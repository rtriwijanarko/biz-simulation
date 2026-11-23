import type { Answer, Decision, DimensionId } from '../engine/types'
import { extractQuote, type DimensionResult, type Scorer } from './scorer'

const DIMENSIONS: DimensionId[] = [
  'business',
  'strategic',
  'people',
  'influence',
  'integrity',
  'resilience',
  'learning',
]

function rationaleFor(score: number, title: string | undefined): string {
  if (score < 40) {
    return title
      ? `Pilihan-pilihan Anda condong ke arah yang kurang mendukung dimensi ini, misalnya pada keputusan "${title}". Ada ruang untuk mengembangkannya.`
      : 'Pilihan-pilihan Anda condong ke arah yang kurang mendukung dimensi ini. Ada ruang untuk mengembangkannya.'
  }
  if (score <= 60) {
    return title
      ? `Pilihan Anda pada dimensi ini beragam, misalnya pada keputusan "${title}". Pola yang konsisten belum terlihat jelas.`
      : 'Pilihan Anda pada dimensi ini beragam. Pola yang konsisten belum terlihat jelas.'
  }
  return title
    ? `Pilihan-pilihan Anda cenderung mendukung dimensi ini, misalnya pada keputusan "${title}". Pola ini tampak cukup konsisten.`
    : 'Pilihan-pilihan Anda cenderung mendukung dimensi ini. Pola ini tampak cukup konsisten.'
}

function scoreDimension(dimension: DimensionId, answers: Answer[], decisions: Decision[]): DimensionResult {
  const relevant = decisions.filter((d) => d.dimensions.includes(dimension))
  if (relevant.length === 0) {
    return { dimension, score: 50, rationale: rationaleFor(50, undefined), evidence: [] }
  }

  const contributions: { decisionId: string; signal: number; reasoning: string }[] = []
  let sum = 0
  for (const d of relevant) {
    const answer = answers.find((a) => a.decisionId === d.id)
    if (!answer) continue
    const option = d.variants[answer.variantIndex]?.options.find((o) => o.id === answer.optionId)
    const signal = option?.signals[dimension] ?? 0
    sum += signal
    if (signal !== 0) contributions.push({ decisionId: d.id, signal, reasoning: answer.reasoning })
  }

  const raw = Math.round(50 + (50 * sum) / (2 * relevant.length))
  const score = Math.min(100, Math.max(0, raw))

  // Stable sort keeps decision order for ties.
  const top = [...contributions].sort((a, b) => Math.abs(b.signal) - Math.abs(a.signal)).slice(0, 3)
  const evidence = top.map((c) => ({ decisionId: c.decisionId, quote: extractQuote(c.reasoning) }))
  const firstTitle = top.length > 0 ? decisions.find((d) => d.id === top[0].decisionId)?.title : undefined

  return { dimension, score, rationale: rationaleFor(score, firstTitle), evidence }
}

export const mockScorer: Scorer = {
  async score(answers, decisions) {
    return DIMENSIONS.map((dim) => scoreDimension(dim, answers, decisions))
  },
}
