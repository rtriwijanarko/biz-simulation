import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { DECISIONS } from '../content'
import { currentDecision, startSession, submitAnswer } from '../engine/engine'
import { buildReport, type Report } from '../report/buildReport'
import { mockScorer } from '../scoring/mockScorer'
import { DIMENSION_LABELS } from '../scoring/scorer'
import { ReportView } from './ReportView'

const SECTIONS = [
  'Ringkasan eksekutif',
  'Tingkat kesiapan',
  'Tipe kepemimpinan',
  'Timeline keputusan',
  'Dampak pada angka cabang',
  'Dimensi kesiapan',
  'Momen penentu',
  'Kekuatan',
  'Area pengembangan',
  'Catatan',
]

async function playedReport(pickIndex: (n: number) => number): Promise<Report> {
  let s = startSession()
  for (;;) {
    const cur = currentDecision(s, DECISIONS)
    if (!cur) break
    const options = cur.decision.variants[cur.variantIndex].options
    const option = options[pickIndex(options.length)]
    s = submitAnswer(s, DECISIONS, option.id, `Alasan keputusan ke-${s.index + 1} saya. Kalimat kedua.`)
  }
  const dimensions = await mockScorer.score([...s.answers], DECISIONS)
  return buildReport(s, DECISIONS, dimensions)
}

let report: Report
beforeAll(async () => {
  report = await playedReport(() => 0)
})

describe('ReportView', () => {
  it('shows every section, in order', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Laporan penilaian' })).toBeInTheDocument()
    const h2 = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(h2).toEqual(SECTIONS)
  })

  it('summarises, states the readiness level and shows the average with a decimal comma', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    expect(screen.getByText(report.summary)).toBeInTheDocument()
    const section = screen.getByRole('heading', { name: 'Tingkat kesiapan' }).closest('section')!
    expect(within(section).getByText(report.readiness.level)).toBeInTheDocument()
    expect(section.textContent).toContain(String(report.readiness.average).replace('.', ','))
  })

  it('shows the primary and secondary leadership type with the figure, strengths and blind spots', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    const { primary, secondary } = report.archetype
    const section = screen.getByRole('heading', { name: 'Tipe kepemimpinan' }).closest('section')!
    expect(within(section).getByRole('heading', { level: 3, name: primary.name })).toBeInTheDocument()
    expect(within(section).getByText(primary.styleNote)).toBeInTheDocument()
    for (const text of [...primary.strengths, ...primary.blindSpots]) {
      expect(within(section).getByText(text)).toBeInTheDocument()
    }
    expect(section.textContent).toContain(secondary.name)
    expect(section.textContent).toContain(secondary.figure)
  })

  it('shows strengths and blind spots for the secondary type too', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    const { secondary } = report.archetype
    const section = screen.getByRole('heading', { name: 'Tipe kepemimpinan' }).closest('section')!
    for (const text of [...secondary.strengths, ...secondary.blindSpots]) {
      expect(within(section).getByText(text)).toBeInTheDocument()
    }
  })

  it('names the decision each evidence quote came from', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    const section = screen.getByRole('heading', { name: 'Dimensi kesiapan' }).closest('section')!
    for (const result of report.dimensions) {
      const block = within(section).getByRole('heading', { level: 3, name: DIMENSION_LABELS[result.dimension] }).closest('article')!
      for (const e of result.evidence) {
        const index = report.timeline.findIndex((t) => t.decisionId === e.decisionId)
        const title = report.timeline[index].title
        expect(within(block).getAllByText(`Keputusan ${index + 1} · ${title}`).length).toBeGreaterThan(0)
      }
    }
  })

  it('moves keyboard focus to the report heading when the report opens', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Laporan penilaian' })).toHaveFocus()
  })

  it('lists all 15 decisions in the timeline with the participant quote', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    const section = screen.getByRole('heading', { name: 'Timeline keputusan' }).closest('section')!
    expect(within(section).getAllByRole('listitem')).toHaveLength(15)
    expect(within(section).getByText('Alasan keputusan ke-1 saya.')).toBeInTheDocument()
    expect(within(section).getByText('Alasan keputusan ke-15 saya.')).toBeInTheDocument()
  })

  it('compares the end figures with the start figures', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    const section = screen.getByRole('heading', { name: 'Dampak pada angka cabang' }).closest('section')!
    expect(within(section).getAllByText(/naik|turun/).length).toBeGreaterThan(0)
  })

  it('shows all seven dimensions with a score, a reason and a quote from the participant', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    const section = screen.getByRole('heading', { name: 'Dimensi kesiapan' }).closest('section')!
    for (const result of report.dimensions) {
      const heading = within(section).getByRole('heading', { level: 3, name: DIMENSION_LABELS[result.dimension] })
      const block = heading.closest('article')!
      expect(block.textContent).toContain(`${result.score} / 100`)
      expect(within(block).getByText(result.rationale)).toBeInTheDocument()
      expect(result.evidence.length).toBeGreaterThan(0)
      for (const e of result.evidence) expect(within(block).getAllByText(e.quote).length).toBeGreaterThan(0)
    }
  })

  it('says so when a dimension has no evidence, instead of leaving it blank', () => {
    const bare: Report = {
      ...report,
      dimensions: report.dimensions.map((d, i) => (i === 0 ? { ...d, evidence: [] } : d)),
    }
    render(<ReportView report={bare} onRestart={vi.fn()} />)
    const heading = screen.getByRole('heading', { level: 3, name: DIMENSION_LABELS[bare.dimensions[0].dimension] })
    expect(within(heading.closest('article')!).getByText(/belum ada keputusan/i)).toBeInTheDocument()
  })

  it('explains what a pivotal moment means before listing them', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    const section = screen.getByRole('heading', { name: 'Momen penentu' }).closest('section')!
    expect(within(section).getByText(/pilihan Anda paling membedakan hasilnya dari pilihan lain/i)).toBeInTheDocument()
  })

  it('shows each pivotal decision with the alternative and its consequence', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    const section = screen.getByRole('heading', { name: 'Momen penentu' }).closest('section')!
    expect(within(section).getAllByRole('listitem')).toHaveLength(3)
    for (const p of report.pivotal) {
      expect(within(section).getByText(p.alternative.label)).toBeInTheDocument()
      expect(within(section).getByText(p.alternative.consequence)).toBeInTheDocument()
      expect(within(section).getByText(p.impact)).toBeInTheDocument()
    }
  })

  it('lists strengths and development areas and ends with the style disclaimer', () => {
    render(<ReportView report={report} onRestart={vi.fn()} />)
    const strengths = screen.getByRole('heading', { name: 'Kekuatan' }).closest('section')!
    const areas = screen.getByRole('heading', { name: 'Area pengembangan' }).closest('section')!
    expect(within(strengths).getAllByRole('listitem')).toHaveLength(3)
    expect(within(areas).getAllByRole('listitem')).toHaveLength(3)
    const note = screen.getByRole('heading', { name: 'Catatan' }).closest('section')!
    expect(within(note).getByText(report.disclaimer)).toBeInTheDocument()
  })

  it('never uses pass/fail or ranking words', async () => {
    for (const pick of [() => 0, (n: number) => n - 1]) {
      const r = await playedReport(pick)
      const { unmount } = render(<ReportView report={r} onRestart={vi.fn()} />)
      const text = document.body.textContent!.toLowerCase()
      for (const word of ['lulus', 'gagal', 'terbaik', 'terburuk']) expect(text).not.toContain(word)
      unmount()
    }
  })

  it('prints on request and restarts on request', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    const onRestart = vi.fn()
    render(<ReportView report={report} onRestart={onRestart} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cetak / simpan PDF' }))
    expect(print).toHaveBeenCalledTimes(1)
    await userEvent.click(screen.getByRole('button', { name: 'Mulai ulang' }))
    expect(onRestart).toHaveBeenCalledTimes(1)
    print.mockRestore()
  })
})
