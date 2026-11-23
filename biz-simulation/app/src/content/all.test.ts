import { describe, expect, it } from 'vitest'
import { METRIC_LIMITS, currentDecision, startSession, submitAnswer } from '../engine/engine'
import type { MetricId, Option, SessionState } from '../engine/types'
import { chapter5 } from './chapter5'
import { DECISIONS } from './index'
import { flagsSetBy, validateContent, validateDecision } from './validate'

const REASON = 'Alasan saya mempertimbangkan risiko dan dampaknya ke tim.'
const METRIC_IDS = Object.keys(METRIC_LIMITS) as MetricId[]

// A strategy picks one option out of the variant the engine currently shows.
type Strategy = (options: readonly Option[]) => Option
const STRATEGIES: Record<string, Strategy> = {
  'always first': (o) => o[0],
  'always last': (o) => o[o.length - 1],
  'always middle': (o) => o[Math.floor(o.length / 2)],
}

// Plays all decisions with a strategy through the real engine, recording which
// variant each decision showed.
function autoPlay(pick: Strategy) {
  let state = startSession()
  const variants: Record<string, number> = {}
  for (;;) {
    const current = currentDecision(state, DECISIONS)
    if (!current) break
    const { decision, variantIndex } = current
    variants[decision.id] = variantIndex
    const option = pick(decision.variants[variantIndex].options)
    state = submitAnswer(state, DECISIONS, option.id, REASON)
  }
  return { state, variants }
}

// Answer decisions in play order with the given option ids.
function play(picks: string[]): SessionState {
  let s = startSession()
  for (const opt of picks) s = submitAnswer(s, DECISIONS, opt, REASON)
  return s
}
const variantAt = (s: SessionState, id: string) => {
  const cur = currentDecision(s, DECISIONS)
  expect(cur?.decision.id).toBe(id)
  return cur!.variantIndex
}
const lastVariant = (id: string) => DECISIONS.find((d) => d.id === id)!.variants.length - 1

describe('full content', () => {
  it('has 15 decisions, three per chapter, in chapter order', () => {
    expect(DECISIONS).toHaveLength(15)
    expect(DECISIONS.map((d) => d.id)).toEqual(Array.from({ length: 15 }, (_, i) => `d${i + 1}`))
    expect(DECISIONS.map((d) => d.chapter)).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5])
  })

  it('passes the full content validator with no errors', () => {
    expect(validateContent(DECISIONS)).toEqual([])
  })
})

describe('no dominant option', () => {
  const hasCost = (o: Option) =>
    (o.effects.npl ?? 0) > 0 ||
    (o.effects.compliance ?? 0) > 0 ||
    (o.effects.morale ?? 0) < 0 ||
    (o.effects.realization ?? 0) < 0 ||
    (o.effects.regional ?? 0) < 0 ||
    (o.effects.dpk ?? 0) < 0
  const signalSum = (o: Option) => Object.values(o.signals).reduce<number>((sum, v) => sum + (v ?? 0), 0)

  it('the option that scores best on the signals always carries a cost in the branch figures', () => {
    const offenders: string[] = []
    for (const d of DECISIONS) {
      d.variants.forEach((variant, vi) => {
        const best = Math.max(...variant.options.map(signalSum))
        for (const o of variant.options.filter((x) => signalSum(x) === best)) {
          if (!hasCost(o)) offenders.push(`${d.id} variant ${vi} option ${o.id}`)
        }
      })
    }
    expect(offenders).toEqual([])
  })
})

describe('auto-play through all 15 decisions', () => {
  for (const [name, pick] of Object.entries(STRATEGIES)) {
    it(`${name}: finishes without error and ends inside the metric limits`, () => {
      const { state } = autoPlay(pick)
      expect(state.index).toBe(15)
      expect(state.answers).toHaveLength(15)
      expect(state.answers.map((a) => a.decisionId)).toEqual(DECISIONS.map((d) => d.id))
      expect(currentDecision(state, DECISIONS)).toBeNull()
      for (const id of METRIC_IDS) {
        const [lo, hi] = METRIC_LIMITS[id]
        expect(state.metrics[id], id).toBeGreaterThanOrEqual(lo)
        expect(state.metrics[id], id).toBeLessThanOrEqual(hi)
      }
    })
  }

  it('always-first and always-last end with different numbers on at least 4 of the 6 metrics', () => {
    const first = autoPlay(STRATEGIES['always first']).state.metrics
    const last = autoPlay(STRATEGIES['always last']).state.metrics
    const differing = METRIC_IDS.filter((id) => first[id] !== last[id])
    expect(differing.length, `differing: ${differing.join(', ')}`).toBeGreaterThanOrEqual(4)
  })

  it('always-first and always-last see different non-default variants in chapters 3-5', () => {
    const first = autoPlay(STRATEGIES['always first']).variants
    const last = autoPlay(STRATEGIES['always last']).variants
    const lateIds = DECISIONS.filter((d) => d.chapter >= 3).map((d) => d.id)
    const diverging = lateIds.filter((id) => first[id] !== last[id])
    expect(diverging.length, 'decisions in chapters 3-5 where the two runs differ').toBeGreaterThan(0)
    // Whenever two runs differ at one decision, at least one of them left the default variant.
    for (const id of diverging) {
      expect(first[id] !== lastVariant(id) || last[id] !== lastVariant(id), id).toBe(true)
    }
  })

  it('every strategy leaves the default variant somewhere in chapters 3-5', () => {
    for (const [name, pick] of Object.entries(STRATEGIES)) {
      const { variants } = autoPlay(pick)
      const nonDefault = DECISIONS.filter((d) => d.chapter >= 3 && variants[d.id] !== lastVariant(d.id))
      expect(nonDefault.length, name).toBeGreaterThan(0)
    }
  })
})

describe('chapter 5 content', () => {
  const [, d14, d15] = chapter5

  // d1-d6 paths. CLEAN: cautious in chapters 1-2 (sets held_line and protected_star_lead,
  // never relaxed_verification or pushed_growth).
  const CLEAN = ['b', 'b', 'b', 'b', 'b', 'b']
  const D7_D9 = ['d', 'a', 'a']
  const UP_TO_D9 = [...CLEAN, ...D7_D9]

  it('has three decisions in chapter 5, ids d13 to d15', () => {
    expect(chapter5).toHaveLength(3)
    expect(chapter5.map((d) => d.id)).toEqual(['d13', 'd14', 'd15'])
    expect(chapter5.every((d) => d.chapter === 5)).toBe(true)
    expect(DECISIONS.slice(12)).toEqual(chapter5)
  })

  it('passes the per-decision validator with every earlier flag available', () => {
    const earlier = new Set(DECISIONS.slice(0, 12).flatMap(flagsSetBy))
    for (const d of chapter5) expect(validateDecision(d, earlier), d.id).toEqual([])
  })

  it('is the last chapter: it sets no new flags', () => {
    expect(chapter5.flatMap(flagsSetBy)).toEqual([])
  })

  it('marks all three as interpersonal and names the person in every variant', () => {
    for (const d of chapter5) {
      expect(d.involvesPerson, d.id).toBe(true)
      for (const v of d.variants) expect(v.person?.trim(), d.id).toBeTruthy()
    }
  })

  it('names the regional head consistently in the evaluation meeting and the final decision', () => {
    for (const d of [d14, d15]) {
      for (const v of d.variants) expect(v.person, d.id).toMatch(/Pak Antonius Wibisono/)
    }
  })

  it('measures learning on the evaluation meeting (D14)', () => {
    expect(d14.dimensions).toContain('learning')
  })

  it('gives every option a style signal and a stated trade-off (no single obvious winner)', () => {
    for (const d of chapter5) {
      for (const v of d.variants) {
        expect(v.options.length).toBeGreaterThanOrEqual(3)
        for (const o of v.options) expect(Object.keys(o.style).length, `${d.id}/${o.id}`).toBeGreaterThan(0)
        const risky = v.options.filter((o) => (o.effects.compliance ?? 0) > 0 || (o.effects.npl ?? 0) > 0)
        const costly = v.options.filter((o) => (o.effects.morale ?? 0) < 0 || (o.effects.realization ?? 0) < 0)
        expect(risky.length, `${d.id} has an option with a risk cost`).toBeGreaterThan(0)
        expect(costly.length, `${d.id} has an option with a performance/people cost`).toBeGreaterThan(0)
      }
    }
  })

  it('keeps style signs consistent: hurting people never reads as leaning to people', () => {
    for (const d of chapter5) {
      for (const v of d.variants) {
        for (const o of v.options) {
          if ((o.signals.people ?? 0) < 0) {
            // people_task: positive = leans to people, negative = leans to task.
            expect(o.style.people_task ?? 0, `${d.id}/${o.id}`).toBeLessThanOrEqual(0)
          }
        }
      }
    }
  })

  it('keeps consequences as observable events, not closing morals', () => {
    for (const d of chapter5) {
      for (const v of d.variants) {
        for (const o of v.options) {
          expect(o.consequence, `${d.id}/${o.id}`).not.toMatch(/bukan .+,? melainkan/i)
          expect(o.consequence, `${d.id}/${o.id}`).not.toMatch(/pelajaran|hikmah/i)
        }
      }
    }
  })

  it('avoids ranking words in participant-visible text', () => {
    // "gagal" is left out on purpose: "gagal bayar" is ordinary banking terminology.
    const banned = /terbaik|terburuk/i
    for (const d of chapter5) {
      const fields = [d.title]
      for (const v of d.variants) {
        fields.push(v.situation)
        if (v.person) fields.push(v.person)
        for (const o of v.options) fields.push(o.label, o.consequence)
      }
      for (const text of fields) expect(text, `${d.id}: ${text.slice(0, 60)}`).not.toMatch(banned)
    }
  })

  it('chains D13 on how the branch pushed growth and reported earlier', () => {
    // softened_report from D10 d: reporting axis wins over everything else.
    const softened = [...UP_TO_D9, 'd', 'a', 'a']
    expect(variantAt(play(softened), 'd13')).toBe(0)

    // pushed_growth (D1 a, D2 b keeps verification) with a transparent audit and report.
    const pushed = ['a', 'b', 'b', 'b', 'b', 'b', ...D7_D9, 'a', 'a', 'a']
    expect(variantAt(play(pushed), 'd13')).toBe(1)

    // held_line and reported_transparently (D10 a, D11 a, D12 a), verification never relaxed.
    const heldTransparent = [...UP_TO_D9, 'a', 'a', 'a']
    expect(variantAt(play(heldTransparent), 'd13')).toBe(2)

    // held_line but no transparent report: the generic default.
    const heldQuiet = [...UP_TO_D9, 'c', 'd', 'd']
    expect(variantAt(play(heldQuiet), 'd13')).toBe(lastVariant('d13'))
  })

  it('chains D14 on a deflected audit, then a softened report, else the shared default', () => {
    const afterD13 = (d10: string, d11: string, d12: string) => play([...UP_TO_D9, d10, d11, d12, 'b'])
    expect(variantAt(afterD13('b', 'a', 'a'), 'd14')).toBe(0) // deflected_audit
    expect(variantAt(afterD13('d', 'a', 'a'), 'd14')).toBe(1) // softened_report only
    expect(variantAt(afterD13('a', 'a', 'a'), 'd14')).toBe(lastVariant('d14'))
  })

  it('chains D15 on whether the star unit head was protected or confronted in D5', () => {
    const afterD14 = (d5: string) =>
      play(['b', 'b', 'b', 'b', d5, 'b', ...D7_D9, 'a', 'a', 'a', 'b', 'a'])
    expect(variantAt(afterD14('b'), 'd15')).toBe(0) // protected_star_lead
    expect(variantAt(afterD14('a'), 'd15')).toBe(lastVariant('d15')) // disciplined_star_lead
  })
})
