import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import { App } from '../ui/App'

// Acceptance checks taken from spec.json, run through the real screens.
const BRANDS = /\bBRI\b|Bank Rakyat|\bBCA\b|\bBNI\b|Bank Mandiri/i
const FORBIDDEN = ['lulus', 'gagal', 'terbaik', 'terburuk']
// Reasons are clean on purpose: quotes are the participant's own words and are never censored.
const reasonFor = (session: string, i: number) => `Alasan ${session} untuk keputusan ke-${i}, dengan pertimbangan risiko dan tim.`

interface Played {
  decisionScreens: string[]
  report: HTMLElement
}

async function playSession(strategy: 'first' | 'last', label: string): Promise<Played> {
  await userEvent.click(screen.getByRole('button', { name: 'Mulai simulasi' }))
  const decisionScreens: string[] = []
  for (let i = 1; i <= 15; i++) {
    expect(screen.getByText(new RegExp(`Keputusan ${i} dari 15`))).toBeInTheDocument()
    decisionScreens.push(document.body.textContent ?? '')
    const submit = screen.getByRole('button', { name: 'Kirim keputusan' })
    expect(submit).toBeDisabled() // nothing chosen, no reason yet
    const radios = screen.getAllByRole('radio')
    await userEvent.click(strategy === 'first' ? radios[0] : radios[radios.length - 1])
    expect(submit).toBeDisabled() // an option alone is not enough
    await userEvent.click(screen.getByRole('textbox', { name: /alasan/i }))
    await userEvent.paste(reasonFor(label, i))
    expect(submit).toBeEnabled()
    await userEvent.click(submit)
    await userEvent.click(screen.getByRole('button', { name: i === 15 ? 'Lihat laporan' : 'Lanjut' }))
  }
  const heading = await screen.findByRole('heading', { name: 'Laporan penilaian' })
  return { decisionScreens, report: heading.closest('article')! }
}

describe('acceptance (spec.json)', () => {
  it(
    'two opposite sessions each run 15 decisions to a specific, well-formed report',
    async () => {
      const first = render(<App />)
      expect(document.body.textContent).not.toMatch(BRANDS)
      const a = await playSession('first', 'pertama')
      expect(document.body.textContent).not.toMatch(BRANDS)
      const reportA = a.report.textContent ?? ''
      first.unmount()

      render(<App />)
      const b = await playSession('last', 'terakhir')
      const reportB = b.report.textContent ?? ''

      // Exactly 15 decisions per session.
      expect(a.decisionScreens).toHaveLength(15)
      expect(b.decisionScreens).toHaveLength(15)

      // Consequences chain: at least one situation in chapters 3-4 (decisions 7-12) differs between the sessions.
      const chaptersThreeFour = [6, 7, 8, 9, 10, 11]
      expect(chaptersThreeFour.some((i) => a.decisionScreens[i] !== b.decisionScreens[i])).toBe(true)

      // Seven dimensions, each with a score and a quote from what was typed.
      const dimensions = within(b.report).getByRole('heading', { name: 'Dimensi kesiapan' }).closest('section')!
      const blocks = within(dimensions).getAllByRole('heading', { level: 3 })
      expect(blocks).toHaveLength(7)
      for (const heading of blocks) {
        const block = heading.closest('article')!
        expect(block.textContent).toMatch(/\d+ \/ 100/)
        expect(block.textContent).toContain('Alasan terakhir untuk keputusan ke-')
      }

      // Readiness, primary and secondary type with their figures, and the disclaimer.
      for (const section of ['Tingkat kesiapan', 'Tipe kepemimpinan', 'Momen penentu', 'Kekuatan', 'Area pengembangan', 'Catatan']) {
        expect(within(b.report).getByRole('heading', { name: section })).toBeInTheDocument()
      }
      const types = within(b.report).getByRole('heading', { name: 'Tipe kepemimpinan' }).closest('section')!
      expect(within(types).getAllByRole('heading', { level: 3 })).toHaveLength(2)
      expect(types.textContent).toMatch(/dikenal publik dari/)
      expect(b.report.textContent).toMatch(/bukan diagnosis psikologis/)

      // Specific per participant: opposite answers give different reports.
      expect(reportA).not.toBe(reportB)

      // Assessment tone: no pass/fail or ranking words anywhere.
      for (const word of FORBIDDEN) {
        expect(reportA.toLowerCase()).not.toContain(word)
        expect(reportB.toLowerCase()).not.toContain(word)
      }
    },
    60_000,
  )
})

describe('no real bank brand in the shipped source', () => {
  // content/validate.ts holds the blocklist itself, so it names the brands by design.
  const sources = import.meta.glob(
    ['../**/*.{ts,tsx,css}', '!../**/*.test.{ts,tsx}', '!../content/validate.ts'],
    { query: '?raw', import: 'default', eager: true },
  ) as Record<string, string>

  it('finds none in any non-test file under app/src or in index.html', () => {
    const files = { ...sources, 'index.html': indexHtml }
    expect(Object.keys(files).length).toBeGreaterThan(20)
    const offenders = Object.entries(files)
      .filter(([, text]) => BRANDS.test(text))
      .map(([name]) => name)
    expect(offenders).toEqual([])
  })
})
