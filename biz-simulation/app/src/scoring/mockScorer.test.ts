import { describe, expect, it } from 'vitest'
import type { Answer, Decision, DimensionId, Signal } from '../engine/types'
import { DIMENSION_LABELS, extractQuote } from './scorer'
import { mockScorer } from './mockScorer'

const ORDER: DimensionId[] = [
  'business',
  'strategic',
  'people',
  'influence',
  'integrity',
  'resilience',
  'learning',
]

const metrics = { npl: 0, dpk: 0, realization: 0, morale: 0, regional: 0, compliance: 0 }

function makeDecisions(n: number, signal: Signal): Decision[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `d${i}`,
    chapter: 1 as const,
    title: `Keputusan ${i}`,
    dimensions: ['business', 'people'] as DimensionId[],
    involvesPerson: false,
    variants: [
      {
        situation: 's',
        options: [
          {
            id: 'a',
            label: 'A',
            effects: {},
            setFlags: [],
            signals: { business: signal, people: signal },
            style: {},
            consequence: 'c',
          },
        ],
      },
    ],
  }))
}

function makeAnswers(decisions: Decision[]): Answer[] {
  return decisions.map((d, i) => ({
    decisionId: d.id,
    variantIndex: 0,
    optionId: 'a',
    reasoning: `Alasan saya nomor ${i}. Kalimat kedua.`,
    metricsBefore: metrics,
    metricsAfter: metrics,
  }))
}

describe('mockScorer', () => {
  it('semua sinyal +2 memberi skor 100, -2 memberi 0, 0 memberi 50', async () => {
    for (const [sig, expected] of [[2, 100], [-2, 0], [0, 50]] as const) {
      const ds = makeDecisions(4, sig)
      const res = await mockScorer.score(makeAnswers(ds), ds)
      const biz = res.find((r) => r.dimension === 'business')!
      expect(biz.score).toBe(expected)
    }
  })

  it('selalu mengembalikan tujuh dimensi berurutan; dimensi tanpa keputusan bernilai 50', async () => {
    const ds = makeDecisions(3, 2)
    const res = await mockScorer.score(makeAnswers(ds), ds)
    expect(res.map((r) => r.dimension)).toEqual(ORDER)
    const strategic = res.find((r) => r.dimension === 'strategic')!
    expect(strategic.score).toBe(50)
    expect(strategic.evidence).toEqual([])
    expect(Object.keys(DIMENSION_LABELS)).toEqual(ORDER)
  })

  it('evidence paling banyak 3 dan quote berasal dari alasan peserta', async () => {
    const ds = makeDecisions(6, 1)
    const answers = makeAnswers(ds)
    const res = await mockScorer.score(answers, ds)
    for (const r of res) {
      expect(r.evidence.length).toBeLessThanOrEqual(3)
      for (const e of r.evidence) {
        const a = answers.find((x) => x.decisionId === e.decisionId)!
        expect(a.reasoning).toContain(e.quote)
      }
    }
    const biz = res.find((r) => r.dimension === 'business')!
    expect(biz.evidence).toHaveLength(3)
    expect(biz.rationale).toContain('Keputusan 0')
    expect(biz.rationale).not.toMatch(/lulus|gagal|terbaik|terburuk/i)
  })

  it('deterministik', async () => {
    const ds = makeDecisions(5, 1)
    const as = makeAnswers(ds)
    expect(await mockScorer.score(as, ds)).toEqual(await mockScorer.score(as, ds))
  })
})

describe('extractQuote', () => {
  it('memotong teks 400 karakter menjadi <=161 dan berakhir "…"', () => {
    const q = extractQuote('kata '.repeat(80))
    expect(Array.from(q).length).toBeLessThanOrEqual(161)
    expect(q.endsWith('…')).toBe(true)
  })

  it('mengembalikan teks pendek apa adanya', () => {
    expect(extractQuote('Saya pilih ini.')).toBe('Saya pilih ini.')
  })

  it('mengambil kalimat pertama dan menangani baris baru', () => {
    expect(extractQuote('Pertama\nKedua. Ketiga')).toBe('Pertama Kedua.')
    expect(extractQuote('  Satu   dua. Tiga ')).toBe('Satu dua.')
  })

  it('tidak membelah emoji', () => {
    const q = extractQuote('😀'.repeat(300))
    expect(q.endsWith('…')).toBe(true)
    expect(Array.from(q).length).toBeLessThanOrEqual(161)
    expect(q).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/)
  })
})
