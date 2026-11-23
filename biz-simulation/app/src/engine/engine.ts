import type { Answer, Decision, MetricId, Metrics, SessionState } from './types'

export const INITIAL_METRICS: Readonly<Metrics> = Object.freeze({
  npl: 3.4,
  dpk: 850,
  realization: 78,
  morale: 70,
  regional: 65,
  compliance: 30,
})

const limit = (lo: number, hi: number) => Object.freeze([lo, hi] as const)

export const METRIC_LIMITS: Readonly<Record<MetricId, readonly [number, number]>> = Object.freeze({
  npl: limit(0, 20),
  dpk: limit(0, 5000),
  realization: limit(0, 150),
  morale: limit(0, 100),
  regional: limit(0, 100),
  compliance: limit(0, 100),
})

export const MIN_REASONING_CHARS = 20

// The one rule for "is this reasoning long enough", shared by submitAnswer and
// the UI's send button. Zero-width and other invisible format characters
// (category Cf) are ignored and emoji count as one character, so neither can
// be used to pad past the minimum.
export function isReasoningValid(reasoning: string): boolean {
  const visible = reasoning.replace(/\p{Cf}/gu, '').trim()
  return Array.from(visible).length >= MIN_REASONING_CHARS
}

export function startSession(): SessionState {
  return { index: 0, metrics: { ...INITIAL_METRICS }, flags: [], answers: [] }
}

// Metrics are kept to two decimals so repeated additions (3.4 + 0.1 + 0.2 ...)
// never accumulate binary floating point noise such as 4.300000000000001.
// Safe because applyEffects only accepts deltas that already have <= 2 decimals.
const round2 = (x: number) => Math.round(x * 100) / 100

export function applyEffects(m: Readonly<Metrics>, effects: Partial<Metrics>): Metrics {
  const next = { ...m }
  for (const key of Object.keys(effects)) {
    if (!Object.hasOwn(METRIC_LIMITS, key)) {
      throw new Error(`Unknown metric "${key}" in effects`)
    }
    const id = key as MetricId
    const delta = effects[id]
    if (typeof delta !== 'number' || !Number.isFinite(delta)) {
      throw new Error(`Effect for "${id}" must be a finite number, got ${delta}`)
    }
    // Reject finer precision outright: rounding it away would silently change
    // what the scenario author wrote (and round half-up is asymmetric for +/-).
    if (Math.abs(delta * 100 - Math.round(delta * 100)) > 1e-6) {
      throw new Error(`Effect for "${id}" must have at most two decimals, got ${delta}`)
    }
    const [lo, hi] = METRIC_LIMITS[id]
    next[id] = round2(Math.min(hi, Math.max(lo, m[id] + delta)))
  }
  return next
}

// First variant whose required flags are all set and whose excluded flags are
// all absent. A variant without conditions always matches, so the last,
// unconditional variant is the default.
export function pickVariant(decision: Decision, flags: readonly string[]): number {
  const index = decision.variants.findIndex(
    (v) =>
      (v.requiresFlags ?? []).every((f) => flags.includes(f)) &&
      !(v.excludesFlags ?? []).some((f) => flags.includes(f)),
  )
  if (index === -1) {
    throw new Error(`Decision "${decision.id}" has no variant matching the current flags`)
  }
  return index
}

export function currentDecision(
  state: SessionState,
  decisions: readonly Decision[],
): { decision: Decision; variantIndex: number } | null {
  if (state.index >= decisions.length) return null
  const decision = decisions[state.index]
  return { decision, variantIndex: pickVariant(decision, state.flags) }
}

export function submitAnswer(
  state: SessionState,
  decisions: readonly Decision[],
  optionId: string,
  reasoning: string,
): SessionState {
  const current = currentDecision(state, decisions)
  if (!current) throw new Error('The session is already finished')

  if (!isReasoningValid(reasoning)) {
    throw new Error(`Reasoning must be at least ${MIN_REASONING_CHARS} characters`)
  }

  const { decision, variantIndex } = current
  const option = decision.variants[variantIndex].options.find((o) => o.id === optionId)
  if (!option) {
    throw new Error(`Option "${optionId}" is not available in decision "${decision.id}"`)
  }

  const metrics = applyEffects(state.metrics, option.effects)
  const flags = [...new Set([...state.flags, ...option.setFlags])]
  const answer: Answer = {
    decisionId: decision.id,
    variantIndex,
    optionId,
    reasoning: reasoning.trim(),
    metricsBefore: state.metrics,
    metricsAfter: metrics,
  }
  return { index: state.index + 1, metrics, flags, answers: [...state.answers, answer] }
}
