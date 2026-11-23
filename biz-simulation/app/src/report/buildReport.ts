import { ARCHETYPES, type Archetype } from '../archetypes/archetypes'
import { matchArchetypes, readinessLevel, styleScores, type ReadinessLevel } from '../archetypes/match'
import { INITIAL_METRICS } from '../engine/engine'
import type { Answer, Decision, MetricId, Metrics, Option, SessionState, StyleAxisId } from '../engine/types'
import { DIMENSION_LABELS, extractQuote, type DimensionResult } from '../scoring/scorer'

export const STYLE_DISCLAIMER =
  'Tipe kepemimpinan adalah gambaran gaya dari satu simulasi, bukan diagnosis psikologis atau peringkat.'

export interface Report {
  readiness: { level: ReadinessLevel; average: number }
  archetype: {
    primary: Archetype
    secondary: Archetype
    fit: number
    styleScores: Record<StyleAxisId, number>
  }
  disclaimer: string
  summary: string
  timeline: { decisionId: string; title: string; chosenLabel: string; consequence: string; quote: string }[]
  metricsStart: Metrics
  metricsEnd: Metrics
  dimensions: DimensionResult[]
  pivotal: {
    decisionId: string
    title: string
    chosenLabel: string
    impact: string
    alternative: { label: string; consequence: string; metricDiff: Partial<Metrics> }
  }[]
  strengths: string[]
  developmentAreas: string[]
}

const METRIC_IDS: MetricId[] = ['npl', 'dpk', 'realization', 'morale', 'regional', 'compliance']

// How much a change in each metric counts when picking which two changes to describe in words.
const IMPACT_SCALE: Record<MetricId, number> = {
  npl: 1,
  dpk: 50,
  realization: 10,
  morale: 10,
  regional: 10,
  compliance: 10,
}

export const METRIC_LABELS: Record<MetricId, string> = {
  npl: 'NPL',
  dpk: 'Dana Pihak Ketiga',
  realization: 'Realisasi Kredit',
  morale: 'Moral Tim',
  regional: 'Hubungan dengan Regional',
  compliance: 'Risiko Kepatuhan',
}

const PIVOTAL_COUNT = 3
const LISTED_DIMENSIONS = 3

/** Typical size of a non-zero effect on each metric across every option in the content. */
function typicalEffects(decisions: Decision[]): Record<MetricId, number> {
  const typical = {} as Record<MetricId, number>
  for (const m of METRIC_IDS) {
    const sizes = decisions.flatMap((d) =>
      d.variants.flatMap((v) => v.options.map((o) => Math.abs(o.effects[m] ?? 0)).filter((x) => x > 0)),
    )
    typical[m] = sizes.length === 0 ? 1 : sizes.reduce((a, b) => a + b, 0) / sizes.length
  }
  return typical
}

const optionImpact = (o: Option, typical: Record<MetricId, number>) =>
  METRIC_IDS.reduce((sum, m) => sum + Math.abs(o.effects[m] ?? 0) / typical[m], 0)

/**
 * How unusual the chosen option's impact was among the options the participant had at that decision, in
 * standard deviations. A decision where every option moves the figures about equally scores 0 however big
 * the moves are, so a few large decisions cannot crowd out the rest.
 */
function momentScore(chosen: Option, options: Option[], typical: Record<MetricId, number>): number {
  const impacts = options.map((o) => optionImpact(o, typical))
  const mean = impacts.reduce((a, b) => a + b, 0) / impacts.length
  const sd = Math.sqrt(impacts.reduce((a, b) => a + (b - mean) ** 2, 0) / impacts.length) || 1
  return (optionImpact(chosen, typical) - mean) / sd
}

function formatAmount(value: number): string {
  return (Math.round(Math.abs(value) * 10) / 10).toString().replace('.', ',')
}

// "NPL naik 0,8; Moral Tim turun 6": the two metrics that moved most, in their own units.
function describeImpact(answer: Answer): string {
  const moves = METRIC_IDS.map((m) => ({ m, delta: answer.metricsAfter[m] - answer.metricsBefore[m] }))
    .filter((x) => Math.round(Math.abs(x.delta) * 10) > 0)
    .sort((a, b) => Math.abs(b.delta) / IMPACT_SCALE[b.m] - Math.abs(a.delta) / IMPACT_SCALE[a.m])
    .slice(0, 2)
  if (moves.length === 0) return 'Tidak ada perubahan angka cabang yang berarti.'
  return moves
    .map((x) => `${METRIC_LABELS[x.m]} ${x.delta > 0 ? 'naik' : 'turun'} ${formatAmount(x.delta)}`)
    .join('; ')
}

const signalSum = (option: Option) => Object.values(option.signals).reduce<number>((s, v) => s + (v ?? 0), 0)

function metricDiff(alternative: Option, chosen: Option): Partial<Metrics> {
  const diff: Partial<Metrics> = {}
  for (const m of METRIC_IDS) {
    const d = Math.round(((alternative.effects[m] ?? 0) - (chosen.effects[m] ?? 0)) * 100) / 100
    if (d !== 0) diff[m] = d
  }
  return diff
}

function buildPivotal(state: SessionState, decisions: Decision[]): Report['pivotal'] {
  const typical = typicalEffects(decisions)
  const candidates = state.answers
    .map((answer, order) => {
      const decision = decisions.find((d) => d.id === answer.decisionId)
      const options = decision?.variants[answer.variantIndex]?.options ?? []
      const chosen = options.find((o) => o.id === answer.optionId)
      // The first option with the highest signal sum wins a tie, so the result never depends on sort stability.
      const alternative = options
        .filter((o) => o.id !== answer.optionId)
        .reduce<Option | undefined>((best, o) => (!best || signalSum(o) > signalSum(best) ? o : best), undefined)
      return { answer, order, decision, chosen, alternative, impact: chosen ? momentScore(chosen, options, typical) : 0 }
    })
    .filter((c) => c.decision && c.chosen && c.alternative)
    .sort((a, b) => b.impact - a.impact || a.order - b.order)
    .slice(0, PIVOTAL_COUNT)

  return candidates.map((c) => ({
    decisionId: c.answer.decisionId,
    title: c.decision!.title,
    chosenLabel: c.chosen!.label,
    impact: describeImpact(c.answer),
    alternative: {
      label: c.alternative!.label,
      consequence: c.alternative!.consequence,
      metricDiff: metricDiff(c.alternative!, c.chosen!),
    },
  }))
}

function buildTimeline(state: SessionState, decisions: Decision[]): Report['timeline'] {
  return state.answers.map((answer) => {
    const decision = decisions.find((d) => d.id === answer.decisionId)
    const option = decision?.variants[answer.variantIndex]?.options.find((o) => o.id === answer.optionId)
    return {
      decisionId: answer.decisionId,
      title: decision?.title ?? answer.decisionId,
      chosenLabel: option?.label ?? answer.optionId,
      consequence: option?.consequence ?? '',
      quote: extractQuote(answer.reasoning),
    }
  })
}

const dimensionLine = (d: DimensionResult) => `${DIMENSION_LABELS[d.dimension]}: ${d.rationale}`

function buildSummary(
  readiness: Report['readiness'],
  primary: Archetype,
  highest: DimensionResult | undefined,
  lowest: DimensionResult | undefined,
): string {
  const parts = [
    `Tingkat kesiapan Anda sebagai calon leader: ${readiness.level} (rata-rata skor ${formatAmount(readiness.average)}).`,
    `Pola jawaban Anda paling dekat dengan tipe ${primary.name}.`,
  ]
  if (highest && lowest) {
    // With equal scores there is no strongest or weakest dimension to name.
    parts.push(
      highest.score === lowest.score
        ? 'Profil Anda relatif merata di seluruh dimensi.'
        : `Dimensi yang paling menonjol adalah ${DIMENSION_LABELS[highest.dimension]}, sedangkan ${DIMENSION_LABELS[lowest.dimension]} paling perlu dikembangkan.`,
    )
  }
  return parts.join(' ')
}

export function buildReport(state: SessionState, decisions: Decision[], dimensions: DimensionResult[]): Report {
  const readiness = readinessLevel(dimensions)
  const style = styleScores(state, decisions)
  const { primary, secondary, fit } = matchArchetypes(dimensions, style, ARCHETYPES)

  // Stable sort: equal scores keep the order the scorer returned them in.
  const byScore = [...dimensions].sort((a, b) => b.score - a.score)
  const strong = byScore.slice(0, LISTED_DIMENSIONS)
  const weak = byScore.slice(Math.max(LISTED_DIMENSIONS, byScore.length - LISTED_DIMENSIONS)).reverse()

  return {
    readiness,
    archetype: { primary, secondary, fit, styleScores: style },
    disclaimer: STYLE_DISCLAIMER,
    summary: buildSummary(readiness, primary, byScore[0], byScore[byScore.length - 1]),
    timeline: buildTimeline(state, decisions),
    metricsStart: { ...(state.answers[0]?.metricsBefore ?? INITIAL_METRICS) },
    metricsEnd: { ...state.metrics },
    dimensions,
    pivotal: buildPivotal(state, decisions),
    strengths: strong.map(dimensionLine),
    developmentAreas: weak.map(dimensionLine),
  }
}
