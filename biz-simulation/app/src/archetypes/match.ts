import type { Decision, DimensionId, SessionState, StyleAxisId } from '../engine/types'
import type { DimensionResult } from '../scoring/scorer'
import { ARCHETYPES, type Archetype } from './archetypes'

export type ReadinessLevel = 'Emerging' | 'Developing' | 'Ready' | 'Board-Ready'

const STYLE_AXES: StyleAxisId[] = ['growth_prudence', 'people_task', 'bold_steady']

/**
 * Readiness from the dimension scores: average <45 Emerging, <60 Developing, <75 Ready, otherwise Board-Ready.
 * Integrity below 40 caps the level at Developing; Board-Ready also needs every dimension at 55 or more.
 */
export function readinessLevel(dimensions: DimensionResult[]): { level: ReadinessLevel; average: number } {
  if (dimensions.length === 0) return { level: 'Emerging', average: 0 }

  const mean = dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  const average = Math.round(mean * 10) / 10

  let level: ReadinessLevel
  if (mean < 45) level = 'Emerging'
  else if (mean < 60) level = 'Developing'
  else if (mean < 75) level = 'Ready'
  else level = 'Board-Ready'

  const integrity = dimensions.find((d) => d.dimension === 'integrity')
  if (integrity && integrity.score < 40 && (level === 'Ready' || level === 'Board-Ready')) level = 'Developing'

  if (level === 'Board-Ready' && dimensions.some((d) => d.score < 55)) level = 'Ready'

  return { level, average }
}

/**
 * The most the content lets a player show on one axis: the average, over the decisions that define the
 * axis, of the strongest positive and the strongest negative option. Used to scale a player's tendency,
 * so "the strongest choice available every time" reads as 100 even if the content only offers +1.
 */
function achievableRange(axis: StyleAxisId, decisions: Decision[]): { up: number; down: number } {
  let up = 0
  let down = 0
  let n = 0
  for (const decision of decisions) {
    const values = decision.variants.flatMap((v) => v.options.map((o) => o.style[axis])).filter((x) => x !== undefined)
    if (values.length === 0) continue
    n += 1
    up += Math.max(...values)
    down += Math.min(...values)
  }
  if (n === 0) return { up: 0, down: 0 }
  // A direction the content never offers falls back to the raw -2..2 scale instead of dividing by zero.
  return { up: up / n > 0 ? up / n : 2, down: down / n < 0 ? -down / n : 2 }
}

/**
 * Style tendency per axis, -100..100: the average signal over the answers whose chosen option defines the
 * axis, scaled by what the content allows in that direction (see achievableRange).
 */
export function styleScores(state: SessionState, decisions: Decision[]): Record<StyleAxisId, number> {
  const out: Record<StyleAxisId, number> = { growth_prudence: 0, people_task: 0, bold_steady: 0 }
  for (const axis of STYLE_AXES) {
    let sum = 0
    let n = 0
    for (const answer of state.answers) {
      const decision = decisions.find((d) => d.id === answer.decisionId)
      const option = decision?.variants[answer.variantIndex]?.options.find((o) => o.id === answer.optionId)
      const signal = option?.style[axis]
      if (signal === undefined) continue
      sum += signal
      n += 1
    }
    if (n === 0) continue
    const average = sum / n
    const { up, down } = achievableRange(axis, decisions)
    const scaled = average >= 0 ? average / up : average / down
    // "+ 0" turns -0 into 0.
    out[axis] = Math.max(-100, Math.min(100, Math.round(100 * scaled))) + 0
  }
  return out
}

function fitOf(
  archetype: Archetype,
  scoreOf: (d: DimensionId) => number,
  style: Record<StyleAxisId, number>,
): number {
  const dimEntries = Object.entries(archetype.profile.dimensions) as [DimensionId, number][]
  const weightSum = dimEntries.reduce((s, [, w]) => s + w, 0)
  const x =
    weightSum === 0 ? 0 : dimEntries.reduce((s, [d, w]) => s + w * ((scoreOf(d) - 50) / 50), 0) / weightSum
  const dimTerm = (Math.min(1, Math.max(-1, x)) + 1) / 2

  const styleEntries = Object.entries(archetype.profile.style) as [StyleAxisId, number][]
  const styleTerm =
    styleEntries.length === 0
      ? 0.5
      : styleEntries.reduce((s, [axis, target]) => s + (1 - Math.abs(style[axis] / 100 - target) / 2), 0) /
        styleEntries.length

  return 0.6 * dimTerm + 0.4 * styleTerm
}

/**
 * Best and second-best archetype by closeness of the player's profile to each type's profile.
 * Style tendencies are already scaled by what the content allows (see styleScores), which is what keeps
 * ordinary players from all landing on the types whose targets sit near the middle. Fits are rounded to
 * 1e-9 before comparing so floating-point noise cannot decide a result; ties are then broken by the order
 * of the list, so the result is deterministic. `fit` is the primary archetype's fit, 0..1.
 */
export function matchArchetypes(
  dimensions: DimensionResult[],
  style: Record<StyleAxisId, number>,
  archetypes: Archetype[] = ARCHETYPES,
): { primary: Archetype; secondary: Archetype; fit: number } {
  const scores = new Map(dimensions.map((d) => [d.dimension, d.score]))
  const scoreOf = (d: DimensionId) => scores.get(d) ?? 50

  const ranked = archetypes
    .map((archetype, order) => ({ archetype, order, fit: Math.round(fitOf(archetype, scoreOf, style) * 1e9) / 1e9 }))
    .sort((a, b) => b.fit - a.fit || a.order - b.order)

  return { primary: ranked[0].archetype, secondary: ranked[1].archetype, fit: ranked[0].fit }
}
