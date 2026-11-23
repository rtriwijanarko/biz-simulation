import { describe, expect, it } from 'vitest'
import { DECISIONS } from '../content'
import { currentDecision, startSession, submitAnswer } from '../engine/engine'
import { mockScorer } from '../scoring/mockScorer'
import { ARCHETYPES } from './archetypes'
import { matchArchetypes, readinessLevel, styleScores } from './match'
import type { DimensionResult } from '../scoring/scorer'
import type { Decision, DimensionId, Metrics, Option, SessionState, StyleAxisId } from '../engine/types'

const DIMS: DimensionId[] = ['business', 'strategic', 'people', 'influence', 'integrity', 'resilience', 'learning']
const AXES: StyleAxisId[] = ['growth_prudence', 'people_task', 'bold_steady']
const BANNED = /lulus|gagal|terbaik|terburuk/i

function results(score: (d: DimensionId) => number): DimensionResult[] {
  return DIMS.map((dimension) => ({ dimension, score: score(dimension), rationale: '', evidence: [] }))
}

function flatStyle(value = 0): Record<StyleAxisId, number> {
  return { growth_prudence: value, people_task: value, bold_steady: value }
}

describe('ARCHETYPES data', () => {
  it('has exactly 16 archetypes with unique ids', () => {
    expect(ARCHETYPES).toHaveLength(16)
    expect(new Set(ARCHETYPES.map((a) => a.id)).size).toBe(16)
  })

  it('gives every archetype 2-3 strengths, 2-3 blind spots and 2-4 profile dimensions', () => {
    for (const a of ARCHETYPES) {
      expect(a.strengths.length, a.id).toBeGreaterThanOrEqual(2)
      expect(a.strengths.length, a.id).toBeLessThanOrEqual(3)
      expect(a.blindSpots.length, a.id).toBeGreaterThanOrEqual(2)
      expect(a.blindSpots.length, a.id).toBeLessThanOrEqual(3)
      const n = Object.keys(a.profile.dimensions).length
      expect(n, a.id).toBeGreaterThanOrEqual(2)
      expect(n, a.id).toBeLessThanOrEqual(4)
      for (const w of Object.values(a.profile.dimensions)) {
        expect(w).toBeGreaterThan(0)
        expect(w).toBeLessThanOrEqual(1)
      }
      for (const t of Object.values(a.profile.style)) {
        expect(Math.abs(t)).toBeLessThanOrEqual(1)
      }
    }
  })

  it('lists the planned names, domains and figures', () => {
    const byName = Object.fromEntries(ARCHETYPES.map((a) => [a.name, [a.domain, a.figure]]))
    expect(byName).toEqual({
      Reconciler: ['politik', 'Nelson Mandela'],
      'Institution Builder': ['politik', 'Lee Kuan Yew'],
      'Steady Crisis Steward': ['politik', 'Angela Merkel'],
      'Empathic Connector': ['politik', 'Jacinda Ardern'],
      'Principled Statesman': ['politik', 'Mohammad Hatta'],
      'Independent Guardian': ['ekonomi', 'Paul Volcker'],
      'Governance Reformer': ['ekonomi', 'Sri Mulyani'],
      'Inclusive Banker': ['ekonomi', 'Muhammad Yunus'],
      'Operational Reformer': ['ekonomi', 'Ignasius Jonan'],
      'Ambidextrous Leader': ['bisnis', 'Satya Nadella'],
      'Growth Catalyst': ['bisnis', 'Jeff Bezos'],
      'Value Guardian': ['bisnis', 'Warren Buffett'],
      'Alignment Turnaround': ['bisnis', 'Alan Mulally'],
      'Purpose-Driven People Builder': ['bisnis', 'Indra Nooyi'],
      'Visionary Builder': ['bisnis', 'B.J. Habibie'],
      'Moral Compass': ['sosial', 'Mahatma Gandhi'],
    })
  })

  it('profiles Ambidextrous Leader as balanced on growth/prudence and bold/steady with business, strategic, learning', () => {
    const a = ARCHETYPES.find((x) => x.name === 'Ambidextrous Leader')!
    expect(Math.abs(a.profile.style.growth_prudence ?? 0)).toBeLessThanOrEqual(0.2)
    expect(Math.abs(a.profile.style.bold_steady ?? 0)).toBeLessThanOrEqual(0.2)
    expect(Object.keys(a.profile.dimensions).sort()).toEqual(['business', 'learning', 'strategic'])
  })

  it('writes styleNote as an analogy naming the figure, free of ranking words', () => {
    for (const a of ARCHETYPES) {
      expect(a.styleNote, a.id).toContain(`Gaya Anda dekat dengan pendekatan yang dikenal publik dari ${a.figure}:`)
      for (const text of [a.styleNote, ...a.strengths, ...a.blindSpots, a.name]) {
        expect(text, a.id).not.toMatch(BANNED)
      }
    }
  })
})

describe('matchArchetypes', () => {
  it.each(ARCHETYPES.map((a) => [a.id, a] as const))('self-match: %s is its own primary', (_id, a) => {
    const dims = results((d) => 50 + 50 * (a.profile.dimensions[d] ?? 0))
    const style = flatStyle()
    for (const axis of AXES) style[axis] = (a.profile.style[axis] ?? 0) * 100
    const m = matchArchetypes(dims, style)
    expect(m.primary.id).toBe(a.id)
    expect(m.secondary.id).not.toBe(a.id)
    expect(m.fit).toBeGreaterThan(0.99)
  })

  it('returns different primary and secondary for a flat profile, identically on repeat calls', () => {
    const dims = results(() => 50)
    const a = matchArchetypes(dims, flatStyle())
    const b = matchArchetypes(dims, flatStyle())
    expect(a.primary.id).not.toBe(a.secondary.id)
    expect(b.primary.id).toBe(a.primary.id)
    expect(b.secondary.id).toBe(a.secondary.id)
    expect(a.fit).toBe(b.fit)
  })

  it('breaks exact ties by list order: earlier entry is primary, the identical twin is secondary', () => {
    const base = ARCHETYPES[0]
    const twinA = { ...base, id: 'twin-a' }
    const twinB = { ...base, id: 'twin-b' }
    const dims = results(() => 50)
    const forward = matchArchetypes(dims, flatStyle(), [twinA, twinB])
    expect(forward.primary.id).toBe('twin-a')
    expect(forward.secondary.id).toBe('twin-b')
    const reversed = matchArchetypes(dims, flatStyle(), [twinB, twinA])
    expect(reversed.primary.id).toBe('twin-b')
    expect(reversed.secondary.id).toBe('twin-a')
  })
})

describe('readinessLevel', () => {
  it('Board-Ready: average 80, every dimension >= 55', () => {
    expect(readinessLevel(results(() => 80))).toEqual({ level: 'Board-Ready', average: 80 })
  })

  it('Ready: average 80 but one dimension at 50', () => {
    // 6 x 83.33 + 50 isn't integer; use 6 x 85 + 50 = 560 -> 80
    const r = results((d) => (d === 'learning' ? 50 : 85))
    expect(readinessLevel(r)).toEqual({ level: 'Ready', average: 80 })
  })

  it('Developing: average 70 but integrity 30', () => {
    // 6 x 76.67... use integrity 30 and others 80 -> (480+30)/7 = 72.9
    const r = results((d) => (d === 'integrity' ? 30 : 80))
    const out = readinessLevel(r)
    expect(out.level).toBe('Developing')
    expect(out.average).toBeGreaterThanOrEqual(70)
    expect(out.average).toBeLessThan(75)
  })

  it('Emerging: average 30', () => {
    expect(readinessLevel(results(() => 30))).toEqual({ level: 'Emerging', average: 30 })
  })

  it('maps the average to Developing and Ready bands', () => {
    expect(readinessLevel(results(() => 45)).level).toBe('Developing')
    expect(readinessLevel(results(() => 44)).level).toBe('Emerging')
    expect(readinessLevel(results(() => 60)).level).toBe('Ready')
    expect(readinessLevel(results(() => 59)).level).toBe('Developing')
    expect(readinessLevel(results(() => 75)).level).toBe('Board-Ready')
    expect(readinessLevel(results(() => 74)).level).toBe('Ready')
  })

  it('does not lift Emerging to Developing when integrity is low', () => {
    expect(readinessLevel(results((d) => (d === 'integrity' ? 10 : 40))).level).toBe('Emerging')
  })

  it('treats an empty result list as Emerging with average 0', () => {
    expect(readinessLevel([])).toEqual({ level: 'Emerging', average: 0 })
  })
})

describe('styleScores', () => {
  const metrics: Metrics = { npl: 3.4, dpk: 850, realization: 78, morale: 70, regional: 65, compliance: 30 }

  function decision(id: string, styleA: Record<string, number>[]): Decision {
    return {
      id,
      chapter: 1,
      title: id,
      dimensions: ['business', 'strategic'],
      involvesPerson: false,
      variants: [
        {
          situation: 's',
          options: styleA.map((style, i) => ({
            id: `o${i}`,
            label: `o${i}`,
            effects: { morale: 1 },
            setFlags: [],
            signals: { business: 1 },
            style: style as never,
            consequence: 'c',
          })),
        },
      ],
    }
  }

  function stateFor(picks: [string, string][]): SessionState {
    return {
      index: picks.length,
      metrics,
      flags: [],
      answers: picks.map(([decisionId, optionId]) => ({
        decisionId,
        variantIndex: 0,
        optionId,
        reasoning: 'alasan yang cukup panjang',
        metricsBefore: metrics,
        metricsAfter: metrics,
      })),
    }
  }

  it('returns 0 for an axis no chosen option defines', () => {
    const decisions = [decision('a', [{ bold_steady: 2 }])]
    expect(styleScores(stateFor([['a', 'o0']]), decisions)).toEqual({
      growth_prudence: 0,
      people_task: 0,
      bold_steady: 100,
    })
  })

  it('returns 100 when every defining signal is +2 and -100 when all are -2', () => {
    const decisions = [decision('a', [{ growth_prudence: 2 }, { growth_prudence: -2 }]), decision('b', [{ growth_prudence: 2 }, { growth_prudence: -2 }])]
    expect(styleScores(stateFor([['a', 'o0'], ['b', 'o0']]), decisions).growth_prudence).toBe(100)
    expect(styleScores(stateFor([['a', 'o1'], ['b', 'o1']]), decisions).growth_prudence).toBe(-100)
  })

  it('divides by the number of answers that define the axis, not by all answers', () => {
    const decisions = [decision('a', [{ people_task: 2 }]), decision('b', [{ bold_steady: 2 }, { bold_steady: 1 }])]
    const s = styleScores(stateFor([['a', 'o0'], ['b', 'o1']]), decisions)
    expect(s.people_task).toBe(100)
    expect(s.bold_steady).toBe(50)
  })

  it('counts a defined zero signal in n and never returns -0', () => {
    const decisions = [decision('a', [{ people_task: 2 }, { people_task: 0 }])]
    const withZero = styleScores(stateFor([['a', 'o1']]), decisions)
    expect(Object.is(withZero.people_task, 0)).toBe(true)
    expect(Object.is(withZero.growth_prudence, 0)).toBe(true)
  })

  it('scales each axis by what the content allows, so the strongest available choice reads as 100', () => {
    // The content only ever offers +1 / -1 on this axis; picking +1 every time is the most it can show.
    const decisions = [decision('a', [{ bold_steady: 1 }, { bold_steady: -1 }]), decision('b', [{ bold_steady: 1 }, { bold_steady: -1 }])]
    expect(styleScores(stateFor([['a', 'o0'], ['b', 'o0']]), decisions).bold_steady).toBe(100)
    expect(styleScores(stateFor([['a', 'o1'], ['b', 'o1']]), decisions).bold_steady).toBe(-100)
  })

  it('scales the two directions separately when the content is lopsided', () => {
    // Up to +2 but only down to -1: a -1 pick is already the strongest downward choice.
    const decisions = [decision('a', [{ growth_prudence: 2 }, { growth_prudence: -1 }])]
    expect(styleScores(stateFor([['a', 'o0']]), decisions).growth_prudence).toBe(100)
    expect(styleScores(stateFor([['a', 'o1']]), decisions).growth_prudence).toBe(-100)
  })

  it('returns all zeros for a session without answers', () => {
    expect(styleScores({ index: 0, metrics, flags: [], answers: [] }, [])).toEqual({
      growth_prudence: 0,
      people_task: 0,
      bold_steady: 0,
    })
  })
})

describe('matchArchetypes on real content', () => {
  // Small seeded generator so the "random" players are the same on every run.
  function seeded(seed: number) {
    let a = seed
    return () => {
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const signalSum = (o: Option) => Object.values(o.signals).reduce<number>((sum, v) => sum + (v ?? 0), 0)

  // A player who takes the best-scoring option with probability `pBest` and a random one otherwise.
  async function player(seed: number, pBest: number) {
    const next = seeded(seed)
    let state = startSession()
    for (;;) {
      const cur = currentDecision(state, DECISIONS)
      if (!cur) break
      const options = cur.decision.variants[cur.variantIndex].options
      const best = options.reduce((b, o) => (signalSum(o) > signalSum(b) ? o : b))
      const chosen = next() < pBest ? best : options[Math.floor(next() * options.length)]
      state = submitAnswer(state, DECISIONS, chosen.id, `Alasan ke-${state.index + 1} saya, cukup panjang.`)
    }
    const dimensions = await mockScorer.score([...state.answers], DECISIONS)
    const style = styleScores(state, DECISIONS)
    return { match: matchArchetypes(dimensions, style), style }
  }

  // The type's style must not pull the opposite way on an axis where the player clearly leans one way.
  const contradicts = (style: Record<StyleAxisId, number>, targets: Partial<Record<StyleAxisId, number>>) =>
    AXES.some((axis) => {
      const target = targets[axis] ?? 0
      return Math.abs(style[axis]) >= 60 && Math.abs(target) >= 0.4 && Math.sign(style[axis]) !== Math.sign(target)
    })

  async function population(n: number, pBest: number, seedBase: number) {
    const counts = new Map<string, number>()
    let contradictions = 0
    for (let k = 0; k < n; k++) {
      const { match, style } = await player(seedBase + k, pBest)
      counts.set(match.primary.id, (counts.get(match.primary.id) ?? 0) + 1)
      if (contradicts(style, match.primary.profile.style)) contradictions += 1
    }
    return { types: counts.size, biggest: Math.max(...counts.values()) / n, contradictions: contradictions / n }
  }

  it('spreads random players over many types instead of collapsing onto two or three', async () => {
    const r = await population(500, 0, 1000)
    expect(r.types, 'types that appear at least once').toBeGreaterThanOrEqual(12)
    expect(r.biggest, 'share of the most common type').toBeLessThanOrEqual(0.35)
  })

  it('keeps competent players (best option 70% of the time) on several types, none of which contradicts their style', async () => {
    // Measured with the current content: about 13 types, the biggest around 44%, about 20% contradictions.
    // Competent play concentrates because the best options share one style; the bounds guard against worse.
    const r = await population(300, 0.7, 3000)
    expect(r.types, 'types that appear at least once').toBeGreaterThanOrEqual(8)
    expect(r.biggest, 'share of the most common type').toBeLessThanOrEqual(0.5)
    expect(r.contradictions, 'share whose type pulls against a strong style axis').toBeLessThanOrEqual(0.25)
  })

  it('never gives the player who always takes the best option a type that opposes their style', async () => {
    const { match, style } = await player(1, 1)
    expect(contradicts(style, match.primary.profile.style), `${match.primary.id} for style ${JSON.stringify(style)}`).toBe(false)
  })

  it('does not let a weak style hint pick an extreme type', () => {
    // Nothing stands out except a mild bold lean: the type must not be one built on a strong growth or people lean.
    const m = matchArchetypes(results(() => 50), { ...flatStyle(), bold_steady: 20 })
    expect(Math.abs(m.primary.profile.style.growth_prudence ?? 0)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(m.primary.profile.style.people_task ?? 0)).toBeLessThanOrEqual(0.5)
  })

  it('picks the closest type for a uniformly strong player with no style lean, not an accident of rounding', () => {
    expect(matchArchetypes(results(() => 80), flatStyle()).primary.id).toBe('ambidextrous-leader')
  })

  it('still gives Ambidextrous Leader to a balanced player who is strong on business, strategy and learning', () => {
    const dims = results((d) => (['business', 'strategic', 'learning'].includes(d) ? 80 : 55))
    expect(matchArchetypes(dims, flatStyle()).primary.id).toBe('ambidextrous-leader')
  })
})
