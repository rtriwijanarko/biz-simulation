import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BANK } from '../content/profile'
import { App } from './App'

// The decision screen blows up, as it would if content ever drifted from the engine.
vi.mock('./Play', () => ({
  Play: () => {
    throw new Error('rahasia teknis: jangan tampilkan ke peserta')
  },
}))

describe('App when a screen throws', () => {
  beforeEach(() => {
    // React logs the caught error; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  it('shows a polite Indonesian message instead of a blank page, without the technical error text', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Mulai simulasi' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/terjadi kendala/i)
    expect(document.body.textContent).not.toContain('rahasia teknis')
    expect(screen.getByRole('button', { name: 'Mulai ulang' })).toBeInTheDocument()
  })

  it('returns to the briefing when "Mulai ulang" is pressed', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Mulai simulasi' }))
    await userEvent.click(screen.getByRole('button', { name: 'Mulai ulang' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText(BANK.briefing[0])).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mulai simulasi' })).toBeInTheDocument()
  })
})
