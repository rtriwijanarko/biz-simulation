import { describe, expect, test } from 'vitest'
import {
  INITIAL_METRICS,
  METRIC_LIMITS,
  MIN_REASONING_CHARS,
  applyEffects,
  currentDecision,
  isReasoningValid,
  pickVariant,
  startSession,
  submitAnswer,
} from './engine'
import type { Decision, Option } from './types'

describe('startSession', () => {
  test('begins with the branch starting metrics, no answers, no flags', () => {
    const s = startSession()
    expect(s.index).toBe(0)
    expect(s.flags).toEqual([])
    expect(s.answers).toEqual([])
    expect(s.metrics).toEqual({
      npl: 3.4,
      dpk: 850,
      realization: 78,
      morale: 70,
      regional: 65,
      compliance: 30,
    })
  })

  test('returns a fresh state each time so sessions never share metrics', () => {
    const a = startSession()
    const b = startSession()
    expect(a).not.toBe(b)
    expect(a.metrics).not.toBe(b.metrics)
    expect(a.metrics).not.toBe(INITIAL_METRICS)
  })
})

describe('constants', () => {
  test('reasoning minimum is 20 characters', () => {
    expect(MIN_REASONING_CHARS).toBe(20)
  })

  test('limits match the spec ranges', () => {
    expect(METRIC_LIMITS.npl).toEqual([0, 20])
    expect(METRIC_LIMITS.dpk).toEqual([0, 5000])
    expect(METRIC_LIMITS.realization).toEqual([0, 150])
    expect(METRIC_LIMITS.morale).toEqual([0, 100])
    expect(METRIC_LIMITS.regional).toEqual([0, 100])
    expect(METRIC_LIMITS.compliance).toEqual([0, 100])
  })
})

describe('applyEffects', () => {
  test('adds each delta to the matching metric and leaves others unchanged', () => {
    const next = applyEffects(INITIAL_METRICS, { npl: 1.5, morale: -10 })
    expect(next.npl).toBeCloseTo(4.9, 5)
    expect(next.morale).toBe(60)
    expect(next.dpk).toBe(850)
    expect(next.compliance).toBe(30)
  })

  test('clamps an index metric at its upper limit', () => {
    expect(applyEffects(INITIAL_METRICS, { morale: 50 }).morale).toBe(100)
  })

  test('clamps npl at zero instead of going negative', () => {
    expect(applyEffects(INITIAL_METRICS, { npl: -10 }).npl).toBe(0)
  })

  test('clamps realization and dpk at their own limits, not 100', () => {
    expect(applyEffects(INITIAL_METRICS, { realization: 500 }).realization).toBe(150)
    expect(applyEffects(INITIAL_METRICS, { dpk: -5000 }).dpk).toBe(0)
  })

  test('stays within limits after many chained effects', () => {
    let m = INITIAL_METRICS
    for (let i = 0; i < 30; i++) m = applyEffects(m, { compliance: 20, morale: -20 })
    expect(m.compliance).toBe(100)
    expect(m.morale).toBe(0)
  })

  test('does not mutate the metrics passed in', () => {
    const before = { ...INITIAL_METRICS }
    applyEffects(INITIAL_METRICS, { npl: 5, morale: -30 })
    expect(INITIAL_METRICS).toEqual(before)
  })

  test('empty effects return an equal copy, not the same object', () => {
    const next = applyEffects(INITIAL_METRICS, {})
    expect(next).toEqual(INITIAL_METRICS)
    expect(next).not.toBe(INITIAL_METRICS)
  })
})

describe('applyEffects rejects bad content instead of corrupting state', () => {
  test('a non-finite delta throws and names the metric', () => {
    expect(() => applyEffects(INITIAL_METRICS, { morale: NaN })).toThrow(/morale/)
    expect(() => applyEffects(INITIAL_METRICS, { npl: Infinity })).toThrow(/npl/)
  })

  test('an unknown metric key throws a clear error naming the key', () => {
    expect(() => applyEffects(INITIAL_METRICS, { moral: -10 } as never)).toThrow(/Unknown metric "moral"/)
  })

  test('a null or undefined delta throws instead of counting as zero', () => {
    expect(() => applyEffects(INITIAL_METRICS, { morale: null } as never)).toThrow(/morale/)
    expect(() => applyEffects(INITIAL_METRICS, { morale: undefined })).toThrow(/morale/)
  })

  test('a delta finer than two decimals throws instead of being silently rounded', () => {
    expect(() => applyEffects(INITIAL_METRICS, { npl: 0.125 })).toThrow(/npl.*two decimals/)
    expect(() => applyEffects(INITIAL_METRICS, { npl: 1.005 })).toThrow(/npl/)
    expect(() => applyEffects(INITIAL_METRICS, { morale: -0.004 })).toThrow(/morale/)
  })

  test('two-decimal deltas with float noise are accepted', () => {
    expect(applyEffects(INITIAL_METRICS, { npl: 0.1 + 0.2 }).npl).toBe(3.7)
    expect(applyEffects(INITIAL_METRICS, { morale: -0.13 }).morale).toBe(69.87)
  })
})

describe('applyEffects decimal precision', () => {
  test('repeated decimal deltas do not accumulate floating point noise', () => {
    let m = INITIAL_METRICS
    for (const d of [0.1, 0.2, -0.3, 0.7, -0.4, 0.3, 0.5, -0.2]) m = applyEffects(m, { npl: d })
    expect(m.npl).toBe(4.3)
  })
})

describe('shared constants are protected from mutation', () => {
  test('INITIAL_METRICS and METRIC_LIMITS are frozen, but a session copy is not', () => {
    expect(Object.isFrozen(INITIAL_METRICS)).toBe(true)
    expect(Object.isFrozen(METRIC_LIMITS)).toBe(true)
    expect(Object.isFrozen(METRIC_LIMITS.npl)).toBe(true)
    expect(Object.isFrozen(startSession().metrics)).toBe(false)
  })
})

describe('session state is read-only at the type level', () => {
  test('mutating a session in place does not compile (checked by tsc via npm run build)', () => {
    const s = startSession()
    const neverCalled = () => {
      // @ts-expect-error flags is a readonly array
      s.flags.push('x')
      // @ts-expect-error index is readonly
      s.index = 1
      // @ts-expect-error answers is a readonly array
      s.answers.push(undefined as never)
    }
    void neverCalled
    expect(s.index).toBe(0)
  })
})

// ---- Task 3: variant selection and answer submission ----

const VALID_REASON = 'Karena risiko kredit perlu dijaga dulu.' // > 20 chars

function opt(id: string, extra: Partial<Option> = {}): Option {
  return {
    id,
    label: `Opsi ${id}`,
    effects: {},
    setFlags: [],
    signals: {},
    style: {},
    consequence: `Akibat ${id}.`,
    ...extra,
  }
}

// d1: one variant. Option "push" sets the "pushed" flag; "hold" sets nothing.
// d2: first variant needs "pushed"; the last variant is the unconditional default.
const d1: Decision = {
  id: 'd1',
  chapter: 1,
  title: 'Keputusan satu',
  dimensions: ['business', 'strategic'],
  involvesPerson: false,
  variants: [
    {
      situation: 'Situasi satu',
      options: [
        opt('push', { effects: { npl: 0.5, morale: -5 }, setFlags: ['pushed'] }),
        opt('hold', { effects: { realization: -3 } }),
      ],
    },
  ],
}

const d2: Decision = {
  id: 'd2',
  chapter: 1,
  title: 'Keputusan dua',
  dimensions: ['people', 'integrity'],
  involvesPerson: true,
  variants: [
    {
      requiresFlags: ['pushed'],
      situation: 'Situasi dua (setelah mendorong)',
      options: [opt('flagged-a', { effects: { compliance: 10 } }), opt('flagged-b')],
    },
    {
      situation: 'Situasi dua (bawaan)',
      options: [opt('default-a', { effects: { compliance: -2 } }), opt('default-b')],
    },
  ],
}

const decisions = [d1, d2]

describe('pickVariant', () => {
  test('chooses the flagged variant when its required flag is present', () => {
    expect(pickVariant(d2, ['pushed'])).toBe(0)
  })

  test('falls back to the unconditional default when the flag is absent', () => {
    expect(pickVariant(d2, [])).toBe(1)
    expect(pickVariant(d2, ['something_else'])).toBe(1)
  })

  test('skips a variant whose excluded flag is present, first match wins', () => {
    const d: Decision = {
      ...d2,
      variants: [
        { requiresFlags: ['a'], excludesFlags: ['b'], situation: 'x', options: [opt('x1'), opt('x2')] },
        { requiresFlags: ['a'], situation: 'y', options: [opt('y1'), opt('y2')] },
        { situation: 'z', options: [opt('z1'), opt('z2')] },
      ],
    }
    expect(pickVariant(d, ['a'])).toBe(0)
    expect(pickVariant(d, ['a', 'b'])).toBe(1)
    expect(pickVariant(d, [])).toBe(2)
  })
})

describe('pickVariant with no matching variant', () => {
  test('fails loudly instead of showing a variant whose conditions are not met', () => {
    const noDefault: Decision = {
      ...d2,
      variants: [{ requiresFlags: ['never_set'], situation: 'x', options: [opt('x1'), opt('x2')] }],
    }
    expect(() => pickVariant(noDefault, [])).toThrow(/no variant/i)
    expect(() => currentDecision(startSession(), [noDefault])).toThrow(/no variant/i)
  })
})

describe('currentDecision', () => {
  test('returns the decision at the session index with the variant its flags select', () => {
    const start = startSession()
    expect(currentDecision(start, decisions)).toEqual({ decision: d1, variantIndex: 0 })
    const next = { ...start, index: 1, flags: ['pushed'] }
    expect(currentDecision(next, decisions)).toEqual({ decision: d2, variantIndex: 0 })
  })

  test('returns null once every decision has been answered', () => {
    expect(currentDecision({ ...startSession(), index: 2 }, decisions)).toBeNull()
  })
})

describe('submitAnswer', () => {
  test('applies the option effects and flags and records the answer', () => {
    const before = startSession()
    const after = submitAnswer(before, decisions, 'push', VALID_REASON)

    expect(after.index).toBe(1)
    expect(after.flags).toEqual(['pushed'])
    expect(after.metrics.npl).toBe(3.9)
    expect(after.metrics.morale).toBe(65)
    expect(after.answers).toHaveLength(1)
    expect(after.answers[0]).toEqual({
      decisionId: 'd1',
      variantIndex: 0,
      optionId: 'push',
      reasoning: VALID_REASON,
      metricsBefore: before.metrics,
      metricsAfter: after.metrics,
    })
  })

  test('does not duplicate a flag that is already set', () => {
    const state = { ...startSession(), flags: ['pushed'] }
    const after = submitAnswer(state, decisions, 'push', VALID_REASON)
    expect(after.flags).toEqual(['pushed'])
  })

  test('does not duplicate a flag listed twice by the same option', () => {
    const d: Decision = {
      ...d1,
      variants: [{ situation: 's', options: [opt('dup', { setFlags: ['x', 'x'] }), opt('other')] }],
    }
    const after = submitAnswer(startSession(), [d], 'dup', VALID_REASON)
    expect(after.flags).toEqual(['x'])
  })

  test('records the variant that was actually shown', () => {
    const afterPush = submitAnswer(startSession(), decisions, 'push', VALID_REASON)
    const flagged = submitAnswer(afterPush, decisions, 'flagged-a', VALID_REASON)
    expect(flagged.answers[1].variantIndex).toBe(0)

    const afterHold = submitAnswer(startSession(), decisions, 'hold', VALID_REASON)
    const dflt = submitAnswer(afterHold, decisions, 'default-a', VALID_REASON)
    expect(dflt.answers[1].variantIndex).toBe(1)
  })

  test('answering the first choice of decision 1 makes decision 2 use the flagged variant', () => {
    const after = submitAnswer(startSession(), decisions, 'push', VALID_REASON)
    expect(currentDecision(after, decisions)).toEqual({ decision: d2, variantIndex: 0 })
  })

  test.each([
    ['empty', ''],
    ['only spaces', '   '],
    ['too short (13 chars)', 'terlalu pendek'],
    ['long but only whitespace padding', `   ${'x'.repeat(10)}   `],
  ])('rejects reasoning that is %s and leaves the state untouched', (_name, reasoning) => {
    const state = startSession()
    const snapshot = structuredClone(state)
    expect(() => submitAnswer(state, decisions, 'push', reasoning)).toThrow()
    expect(state).toEqual(snapshot)
  })

  test('accepts reasoning of exactly the minimum length after trimming', () => {
    const exactly = 'x'.repeat(MIN_REASONING_CHARS)
    const after = submitAnswer(startSession(), decisions, 'push', `  ${exactly}  `)
    expect(after.answers[0].reasoning).toBe(exactly)
    expect(() => submitAnswer(startSession(), decisions, 'push', 'x'.repeat(MIN_REASONING_CHARS - 1))).toThrow()
  })

  test('rejects an option that is not in the active variant', () => {
    expect(() => submitAnswer(startSession(), decisions, 'default-a', VALID_REASON)).toThrow()
    // flagged-a exists in d2, but d2 is not yet the current decision
    expect(() => submitAnswer(startSession(), decisions, 'flagged-a', VALID_REASON)).toThrow()
    // default-a exists in d2's default variant, but the "pushed" flag selects the other one
    const pushed = submitAnswer(startSession(), decisions, 'push', VALID_REASON)
    expect(() => submitAnswer(pushed, decisions, 'default-a', VALID_REASON)).toThrow()
  })

  test('rejects an answer after the last decision', () => {
    const s1 = submitAnswer(startSession(), decisions, 'hold', VALID_REASON)
    const s2 = submitAnswer(s1, decisions, 'default-a', VALID_REASON)
    expect(s2.index).toBe(2)
    expect(() => submitAnswer(s2, decisions, 'hold', VALID_REASON)).toThrow()
  })

  test('never mutates the previous state and two answers from one state stay independent', () => {
    const state = startSession()
    const snapshot = structuredClone(state)

    const a = submitAnswer(state, decisions, 'push', VALID_REASON)
    const b = submitAnswer(state, decisions, 'hold', VALID_REASON)

    expect(state).toEqual(snapshot)
    expect(a).not.toBe(b)
    expect(a.flags).toEqual(['pushed'])
    expect(b.flags).toEqual([])
    expect(a.answers).toHaveLength(1)
    expect(b.answers).toHaveLength(1)
    expect(a.answers[0].optionId).toBe('push')
    expect(b.answers[0].optionId).toBe('hold')
    expect(a.metrics).not.toBe(state.metrics)
  })
})

describe('isReasoningValid', () => {
  const ZWSP = '\u200b'

  test('counts visible characters, not whitespace padding', () => {
    expect(isReasoningValid('')).toBe(false)
    expect(isReasoningValid('   ')).toBe(false)
    expect(isReasoningValid('x'.repeat(MIN_REASONING_CHARS - 1))).toBe(false)
    expect(isReasoningValid('x'.repeat(MIN_REASONING_CHARS))).toBe(true)
    expect(isReasoningValid(`  ${'x'.repeat(MIN_REASONING_CHARS)}\n`)).toBe(true)
  })

  test('does not count zero-width characters as content', () => {
    expect(isReasoningValid(ZWSP.repeat(MIN_REASONING_CHARS))).toBe(false)
    expect(isReasoningValid(`${'x'.repeat(10)}${ZWSP.repeat(10)}`)).toBe(false)
  })

  test('counts an emoji as one character, not two', () => {
    expect(isReasoningValid('😀'.repeat(10))).toBe(false)
    expect(isReasoningValid('😀'.repeat(MIN_REASONING_CHARS))).toBe(true)
  })

  test('submitAnswer rejects exactly what isReasoningValid rejects', () => {
    const zeroWidth = ZWSP.repeat(MIN_REASONING_CHARS)
    expect(() => submitAnswer(startSession(), decisions, 'push', zeroWidth)).toThrow()
    expect(() => submitAnswer(startSession(), decisions, 'push', '😀'.repeat(10))).toThrow()
    expect(() => submitAnswer(startSession(), decisions, 'push', '😀'.repeat(MIN_REASONING_CHARS))).not.toThrow()
  })
})
