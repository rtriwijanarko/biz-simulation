import { describe, expect, it } from 'vitest'
import { INITIAL_METRICS, currentDecision, startSession, submitAnswer } from '../engine/engine'
import type { Decision, DimensionId, MetricId, Option, SessionState } from '../engine/types'
import { DECISIONS } from '../content'
import { extractQuote, type DimensionResult } from '../scoring/scorer'
import { mockScorer } from '../scoring/mockScorer'
import { STYLE_DISCLAIMER, buildReport, type Report } from './buildReport'

type Strategy = (options: readonly Option[], step: number) => Option

const first: Strategy = (o) => o[0]
const last: Strategy = (o) => o[o.length - 1]
const middle: Strategy = (o) => o[Math.floor(o.length / 2)]

// Small seeded generator so the "random" strategies are the same on every run.
function seeded(seed: number): Strategy {
  let a = seed
  return (o) => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296
    return o[Math.floor(r * o.length)]
  }
}

function autoPlay(pick: Strategy): SessionState {
  let state = startSession()
  for (;;) {
    const current = currentDecision(state, DECISIONS)
    if (!current) return state
    const option = pick(current.decision.variants[current.variantIndex].options, state.index)
    // The first sentence is distinctive per step so quotes can be traced back to the answer.
    const reasoning = `Alasan keputusan ke-${state.index + 1} saya. Kalimat kedua tidak ikut dikutip.`
    state = submitAnswer(state, DECISIONS, option.id, reasoning)
  }
}

async function reportFor(pick: Strategy) {
  const state = autoPlay(pick)
  const dimensions = await mockScorer.score([...state.answers], DECISIONS)
  return { state, report: buildReport(state, DECISIONS, dimensions) }
}

const SCALE: Record<MetricId, number> = { npl: 1, dpk: 50, realization: 10, morale: 10, regional: 10, compliance: 10 }
const FORBIDDEN = ['lulus', 'gagal', 'terbaik', 'terburuk']

describe('buildReport', () => {
  it('builds a timeline of 15 entries whose quotes come from the participant', async () => {
    const { state, report } = await reportFor(first)
    expect(report.timeline).toHaveLength(15)
    report.timeline.forEach((entry, i) => {
      expect(entry.decisionId).toBe(`d${i + 1}`)
      expect(entry.quote).toBe(extractQuote(state.answers[i].reasoning))
      expect(entry.quote).toBe(`Alasan keputusan ke-${i + 1} saya.`)
      expect(entry.title.length).toBeGreaterThan(0)
      expect(entry.chosenLabel.length).toBeGreaterThan(0)
      expect(entry.consequence.length).toBeGreaterThan(0)
    })
  })

  it('reports start and end metrics from the session', async () => {
    const { state, report } = await reportFor(first)
    expect(report.metricsStart).toEqual(INITIAL_METRICS)
    expect(report.metricsEnd).toEqual(state.metrics)
  })

  describe('pivotal moments', () => {
    // Four hand-made decisions that only move morale. Typical |effect| across all options = 57 / 12 = 4.75.
    // An option's impact is |morale| / 4.75; a decision's score is how far the CHOSEN option's impact sits
    // above the mean impact of that decision's options, in standard deviations (population, sd 0 counts as 1).
    const option = (id: string, morale: number, business: 0 | 1 | 2): Option => ({
      id,
      label: `Opsi ${id}`,
      effects: { morale },
      setFlags: [],
      signals: { business },
      style: {},
      consequence: `Akibat ${id}.`,
    })
    const decision = (id: string, effects: [number, number, number]): Decision => ({
      id,
      chapter: 1,
      title: `Keputusan ${id}`,
      dimensions: ['business', 'strategic'],
      involvesPerson: false,
      variants: [{ situation: 's', options: effects.map((m, i) => option('abc'[i], m, [2, 1, 0][i] as 0 | 1 | 2)) }],
    })
    const fixture = [
      decision('dA', [1, 1, 10]), // choose c: (10-4)/4.243 = 1.414
      decision('dB', [5, 5, 5]), // any choice: 0
      decision('dC', [2, 4, 6]), // choose c: (6-4)/1.633 = 1.225
      decision('dD', [3, 3, 12]), // choose a: (3-6)/4.243 = -0.707
    ]
    const play = (picks: string[]) => {
      let s = startSession()
      picks.forEach((p, i) => {
        s = submitAnswer(s, fixture, p, `Alasan ${i + 1} saya, cukup panjang.`)
      })
      return s
    }

    it('ranks decisions by how unusual the chosen option was among that decision\'s own options', () => {
      const report = buildReport(play(['c', 'a', 'c', 'a']), fixture, [])
      expect(report.pivotal.map((p) => p.decisionId)).toEqual(['dA', 'dC', 'dB'])
    })

    it('does not let a decision win just because every option of it is large', () => {
      // dB has the biggest typical effect but no choice there differs from another: it must rank below dC.
      const report = buildReport(play(['a', 'a', 'c', 'a']), fixture, [])
      expect(report.pivotal.map((p) => p.decisionId)).toEqual(['dC', 'dB', 'dA'])
    })

    it('names the alternative with the highest signal sum and the metric difference against the choice', () => {
      const report = buildReport(play(['c', 'a', 'c', 'a']), fixture, [])
      const first = report.pivotal[0]
      expect(first.chosenLabel).toBe('Opsi c')
      expect(first.alternative.label).toBe('Opsi a') // signal sum 2 beats b (1)
      expect(first.alternative.metricDiff).toEqual({ morale: -9 }) // 1 - 10
    })
  })

  it('always lists 3 different decisions, each with an alternative other than the chosen option', async () => {
    const { report } = await reportFor(middle)
    expect(report.pivotal).toHaveLength(3)
    expect(new Set(report.pivotal.map((p) => p.decisionId)).size).toBe(3)
    for (const p of report.pivotal) {
      expect(p.alternative.label).not.toBe(p.chosenLabel)
      expect(p.alternative.consequence.length).toBeGreaterThan(0)
      expect(p.impact.length).toBeGreaterThan(0)
    }
  })

  it('spreads the pivotal moments over the decisions instead of showing the same three every time', () => {
    const N = 600
    const counts = new Map<string, number>()
    const reports: Report[] = []
    for (let k = 0; k < N; k++) {
      const pick = seeded(7000 + k)
      let state = startSession()
      for (;;) {
        const cur = currentDecision(state, DECISIONS)
        if (!cur) break
        const options = cur.decision.variants[cur.variantIndex].options
        state = submitAnswer(state, DECISIONS, pick(options, state.index).id, `Alasan ke-${state.index + 1} saya, cukup panjang.`)
      }
      reports.push(buildReport(state, DECISIONS, []))
    }
    for (const r of reports) for (const p of r.pivotal) counts.set(p.decisionId, (counts.get(p.decisionId) ?? 0) + 1)
    expect(counts.size, 'decisions that show up as a pivotal moment at least once').toBe(15)
    expect(Math.max(...counts.values()) / N, 'share of the most common decision').toBeLessThanOrEqual(0.4)
  })

  it('alternative is the other option in the same variant with the highest signal sum, and metricDiff is its effects minus the chosen ones', async () => {
    const { state, report } = await reportFor(first)
    const p = report.pivotal[0]
    const answer = state.answers.find((a) => a.decisionId === p.decisionId)!
    const options = DECISIONS.find((d) => d.id === p.decisionId)!.variants[answer.variantIndex].options
    const chosen = options.find((o) => o.id === answer.optionId)!
    const signalSum = (o: Option) => Object.values(o.signals).reduce<number>((s, v) => s + (v ?? 0), 0)
    const best = options
      .filter((o) => o.id !== chosen.id)
      .reduce((b, o) => (signalSum(o) > signalSum(b) ? o : b))
    expect(p.alternative.label).toBe(best.label)
    for (const m of Object.keys(SCALE) as MetricId[]) {
      const diff = (best.effects[m] ?? 0) - (chosen.effects[m] ?? 0)
      expect(p.alternative.metricDiff[m] ?? 0).toBeCloseTo(diff, 5)
    }
  })

  it('lists 3 strengths and 3 development areas that do not overlap', async () => {
    const { report } = await reportFor(last)
    expect(report.strengths).toHaveLength(3)
    expect(report.developmentAreas).toHaveLength(3)
    expect(new Set([...report.strengths, ...report.developmentAreas]).size).toBe(6)
    const scores = [...report.dimensions].sort((a, b) => b.score - a.score)
    expect(report.strengths[0]).toContain(
      { business: 'Ketajaman Bisnis dan Risiko', strategic: 'Pemikiran Strategis dan Sistemik', people: 'Memimpin dan Mengembangkan Orang', influence: 'Pengaruh dan Komunikasi', integrity: 'Integritas dan Keberanian Moral', resilience: 'Ketangguhan di Bawah Tekanan', learning: 'Ketangkasan Belajar dan Akuntabilitas' }[scores[0].dimension],
    )
  })

  it('gives a readiness level, two different archetypes, and the disclaimer', async () => {
    const { report } = await reportFor(middle)
    expect(['Emerging', 'Developing', 'Ready', 'Board-Ready']).toContain(report.readiness.level)
    expect(report.archetype.primary.id).not.toBe(report.archetype.secondary.id)
    expect(report.disclaimer).toBe(STYLE_DISCLAIMER)
    expect(report.summary).toContain(report.readiness.level)
    expect(report.summary).toContain(report.archetype.primary.name)
  })

  it('never uses pass/fail or ranking words anywhere in the report', async () => {
    for (const pick of [first, last, middle, seeded(1), seeded(2), seeded(3)]) {
      const { report } = await reportFor(pick)
      const text = JSON.stringify(report).toLowerCase()
      for (const word of FORBIDDEN) expect(text).not.toContain(word)
    }
  })

  it('differs between opposite strategies and is identical for identical sessions', async () => {
    const a = await reportFor(first)
    const b = await reportFor(last)
    const a2 = await reportFor(first)
    expect(a.report.summary).not.toBe(b.report.summary)
    expect(a.report.pivotal).not.toEqual(b.report.pivotal)
    expect(a2.report).toEqual(a.report)
  })

  it('tells at least 4 archetypes apart across six automatic strategies', async () => {
    const strategies = [first, last, middle, seeded(1), seeded(2), seeded(3)]
    const primaries = new Set<string>()
    for (const pick of strategies) primaries.add((await reportFor(pick)).report.archetype.primary.id)
    expect(primaries.size).toBeGreaterThanOrEqual(4)
  })

  describe('summary wording', () => {
    const DIMS: DimensionId[] = ['business', 'strategic', 'people', 'influence', 'integrity', 'resilience', 'learning']
    const withScores = (scores: number[]): DimensionResult[] =>
      DIMS.map((dimension, i) => ({ dimension, score: scores[i], rationale: 'Alasan contoh.', evidence: [] }))

    it('does not call the same dimension both the strongest and the one to develop when the profile is flat', () => {
      const report = buildReport(startSession(), DECISIONS, withScores([60, 60, 60, 60, 60, 60, 60]))
      expect(report.summary).toContain('merata')
      expect(report.summary).not.toContain('paling menonjol')
      expect(report.summary).not.toContain('paling perlu dikembangkan')
    })

    it('writes the average with an Indonesian decimal comma', () => {
      // 437 / 7 = 62.43, shown to one decimal.
      const report = buildReport(startSession(), DECISIONS, withScores([60, 60, 60, 60, 65, 66, 66]))
      expect(report.summary).toContain('62,4')
      expect(report.summary).not.toContain('62.4')
      expect(report.summary).toContain('paling menonjol')
    })
  })

  it('handles a session with no answers without throwing', () => {
    const state = startSession()
    const report = buildReport(state, DECISIONS, [])
    expect(report.timeline).toEqual([])
    expect(report.pivotal).toEqual([])
    expect(report.strengths).toEqual([])
    expect(report.developmentAreas).toEqual([])
    expect(report.metricsStart).toEqual(INITIAL_METRICS)
    expect(report.archetype.primary.id).not.toBe(report.archetype.secondary.id)
  })
})
