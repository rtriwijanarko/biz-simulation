import type { Answer, Decision, DimensionId } from '../engine/types'

// A real AI scorer only needs to implement `Scorer`; the rest of the app depends on this interface alone.

export interface DimensionResult {
  dimension: DimensionId
  score: number
  rationale: string
  evidence: { decisionId: string; quote: string }[]
}

export interface Scorer {
  score(answers: Answer[], decisions: Decision[]): Promise<DimensionResult[]>
}

export const DIMENSION_LABELS: Record<DimensionId, string> = {
  business: 'Ketajaman Bisnis dan Risiko',
  strategic: 'Pemikiran Strategis dan Sistemik',
  people: 'Memimpin dan Mengembangkan Orang',
  influence: 'Pengaruh dan Komunikasi',
  integrity: 'Integritas dan Keberanian Moral',
  resilience: 'Ketangguhan di Bawah Tekanan',
  learning: 'Ketangkasan Belajar dan Akuntabilitas',
}

/** First sentence of the participant's reasoning, cut at a word boundary with "…" if longer than maxLen. */
export function extractQuote(reasoning: string, maxLen = 160): string {
  const trimmed = reasoning.replace(/\s+/g, ' ').trim()
  // First sentence ends only at . ! or ?, evaluated on the whitespace-collapsed text.
  const m = trimmed.match(/^.*?[.!?](?=\s|$)/)
  const sentence = (m ? m[0] : trimmed).trim()
  const text = sentence || trimmed
  const chars = Array.from(text)
  if (chars.length <= maxLen) return text
  const cut = chars.slice(0, maxLen)
  // Cut at a word boundary when the cut falls inside a word.
  if (chars[maxLen] !== ' ') {
    const lastSpace = cut.lastIndexOf(' ')
    if (lastSpace > 0) cut.length = lastSpace
  }
  return cut.join('').trimEnd() + '…'
}
