import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

// Submitting blows up inside the click handler, which React error boundaries do not catch by themselves.
vi.mock('../engine/engine', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../engine/engine')>()),
  submitAnswer: () => {
    throw new Error('rahasia teknis: jangan tampilkan ke peserta')
  },
}))

describe('App when answering a decision throws', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  it('shows the polite notice with "Mulai ulang" instead of silently doing nothing', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Mulai simulasi' }))
    await userEvent.click(screen.getAllByRole('radio')[0])
    await userEvent.click(screen.getByRole('textbox', { name: /alasan/i }))
    await userEvent.paste('Alasan saya cukup panjang untuk diterima.')
    await userEvent.click(screen.getByRole('button', { name: 'Kirim keputusan' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/terjadi kendala/i)
    expect(document.body.textContent).not.toContain('rahasia teknis')
    await userEvent.click(screen.getByRole('button', { name: 'Mulai ulang' }))
    expect(screen.getByRole('button', { name: 'Mulai simulasi' })).toBeInTheDocument()
  })
})
