import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DECISIONS } from '../content'
import { BANK } from '../content/profile'
import { App } from './App'

const BRANDS = /\bBRI\b|Bank Rakyat|\bBCA\b|\bBNI\b|Bank Mandiri/i

describe('App shell', () => {
  it('shows the fictional bank, the briefing and a start button', () => {
    render(<App />)
    expect(screen.getAllByText(new RegExp(BANK.bank)).length).toBeGreaterThan(0)
    for (const paragraph of BANK.briefing) expect(screen.getByText(paragraph)).toBeInTheDocument()
    expect(screen.getByText(/15 keputusan.*45.*75 menit/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mulai simulasi' })).toBeInTheDocument()
  })

  it('does not claim that anyone or anything reads the written reasoning', () => {
    render(<App />)
    expect(document.body.textContent).not.toMatch(/alasan itu dibaca/i)
    expect(document.body.textContent).toMatch(/dikutip dalam laporan/i)
  })

  it('moves to the first decision when the simulation starts', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Mulai simulasi' }))
    expect(screen.getByText(DECISIONS[0].variants[0].situation)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mulai simulasi' })).not.toBeInTheDocument()
  })

  async function playAllDecisions() {
    await userEvent.click(screen.getByRole('button', { name: 'Mulai simulasi' }))
    for (let i = 1; i <= 15; i++) {
      expect(screen.getByText(new RegExp(`Keputusan ${i} dari 15`))).toBeInTheDocument()
      await userEvent.click(screen.getAllByRole('radio')[0])
      await userEvent.click(screen.getByRole('textbox', { name: /alasan/i }))
      await userEvent.paste(`Alasan saya untuk keputusan ke-${i}.`)
      await userEvent.click(screen.getByRole('button', { name: 'Kirim keputusan' }))
      await userEvent.click(screen.getByRole('button', { name: i === 15 ? 'Lihat laporan' : 'Lanjut' }))
    }
  }

  it('plays all 15 decisions through the screens and ends on the report with the participant quotes', async () => {
    render(<App />)
    await playAllDecisions()
    expect(await screen.findByRole('heading', { name: 'Laporan penilaian' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tipe kepemimpinan' })).toBeInTheDocument()
    expect(screen.getAllByText('Alasan saya untuk keputusan ke-1.').length).toBeGreaterThan(0)
  })

  it('starts a fresh simulation from the report', async () => {
    render(<App />)
    await playAllDecisions()
    await userEvent.click(await screen.findByRole('button', { name: 'Mulai ulang' }))
    expect(screen.getByRole('button', { name: 'Mulai simulasi' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Mulai simulasi' }))
    expect(screen.getByText(/Keputusan 1 dari 15/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /alasan/i })).toHaveValue('')
  })

  it('never shows a real bank brand on the briefing or the first decision', async () => {
    render(<App />)
    expect(document.body.textContent).not.toMatch(BRANDS)
    await userEvent.click(screen.getByRole('button', { name: 'Mulai simulasi' }))
    expect(document.body.textContent).not.toMatch(BRANDS)
  })
})
