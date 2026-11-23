import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DECISIONS } from '../content'
import { MIN_REASONING_CHARS, currentDecision, startSession, submitAnswer } from '../engine/engine'
import type { SessionState } from '../engine/types'
import { Play } from './Play'

const OK_REASON = 'a'.repeat(MIN_REASONING_CHARS)

function stateAt(n: number): SessionState {
  let s = startSession()
  for (let i = 0; i < n; i++) {
    const cur = currentDecision(s, DECISIONS)!
    s = submitAnswer(s, DECISIONS, cur.decision.variants[cur.variantIndex].options[0].id, OK_REASON)
  }
  return s
}

function Harness({ initial, onFinish }: { initial: SessionState; onFinish: () => void }) {
  const [state, setState] = useState(initial)
  return <Play state={state} onAnswer={setState} onFinish={onFinish} />
}

const submit = () => screen.getByRole('button', { name: 'Kirim keputusan' })
const reasoningBox = () => screen.getByRole('textbox', { name: /alasan/i })

async function fill(reasoning: string, optionIndex = 0) {
  await userEvent.click(screen.getAllByRole('radio')[optionIndex])
  await userEvent.click(reasoningBox())
  if (reasoning) await userEvent.paste(reasoning)
}

describe('Play: the decision screen', () => {
  it('shows the chapter and position, the situation and every option', () => {
    render(<Play state={stateAt(0)} onAnswer={vi.fn()} onFinish={vi.fn()} />)
    const { decision, variantIndex } = currentDecision(startSession(), DECISIONS)!
    const variant = decision.variants[variantIndex]
    expect(screen.getByText('Babak 1 · Keputusan 1 dari 15')).toBeInTheDocument()
    expect(screen.getByText(variant.situation)).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(variant.options.length)
    for (const o of variant.options) expect(screen.getByLabelText(o.label)).toBeInTheDocument()
  })

  it('shows the person involved when the situation names one', () => {
    const s = stateAt(1)
    const { decision, variantIndex } = currentDecision(s, DECISIONS)!
    const person = decision.variants[variantIndex].person
    expect(person).toBeTruthy()
    render(<Play state={s} onAnswer={vi.fn()} onFinish={vi.fn()} />)
    expect(screen.getByText(person!)).toBeInTheDocument()
  })

  it('keeps "Kirim keputusan" disabled until an option and a long enough reason exist', async () => {
    render(<Play state={stateAt(0)} onAnswer={vi.fn()} onFinish={vi.fn()} />)
    expect(submit()).toBeDisabled()

    await userEvent.click(screen.getAllByRole('radio')[0])
    expect(submit()).toBeDisabled() // option but no reason

    await userEvent.click(reasoningBox())
    await userEvent.paste('   \n  ')
    expect(submit()).toBeDisabled() // only whitespace

    await userEvent.clear(reasoningBox())
    await userEvent.paste('a'.repeat(MIN_REASONING_CHARS - 1))
    expect(submit()).toBeDisabled() // one character short

    await userEvent.paste('a')
    expect(submit()).toBeEnabled()
  })

  it('does not enable submit for a reason without an option', async () => {
    render(<Play state={stateAt(0)} onAnswer={vi.fn()} onFinish={vi.fn()} />)
    await userEvent.click(reasoningBox())
    await userEvent.paste(OK_REASON)
    expect(submit()).toBeDisabled()
  })

  it('counts the reason characters against the minimum', async () => {
    render(<Play state={stateAt(0)} onAnswer={vi.fn()} onFinish={vi.fn()} />)
    await userEvent.click(reasoningBox())
    await userEvent.paste('abc')
    expect(screen.getByText(`3 dari minimal ${MIN_REASONING_CHARS} karakter`)).toBeInTheDocument()
  })

  it('after submitting, shows the consequence and the changed figures with a Lanjut button', async () => {
    render(<Harness initial={stateAt(0)} onFinish={vi.fn()} />)
    const { decision, variantIndex } = currentDecision(startSession(), DECISIONS)!
    const chosen = decision.variants[variantIndex].options[0]
    await fill(OK_REASON)
    await userEvent.click(submit())

    expect(screen.getByText(chosen.consequence)).toBeInTheDocument()
    expect(screen.getAllByText(/naik|turun/).length).toBeGreaterThan(0)
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Lanjut' }))
    expect(screen.getByText('Babak 1 · Keputusan 2 dari 15')).toBeInTheDocument()
    // The next decision starts with a clean form.
    expect(reasoningBox()).toHaveValue('')
    expect(submit()).toBeDisabled()
  })

  it('moves keyboard focus to the new heading after each step so keyboard users keep their place', async () => {
    render(<Harness initial={stateAt(0)} onFinish={vi.fn()} />)
    expect(screen.getByRole('heading', { level: 2, name: /Dorongan target/ })).toHaveFocus()
    await fill(OK_REASON)
    await userEvent.click(submit())
    expect(screen.getByRole('heading', { level: 2, name: 'Akibat keputusan Anda' })).toHaveFocus()
    await userEvent.click(screen.getByRole('button', { name: 'Lanjut' }))
    expect(screen.getByText('Babak 1 · Keputusan 2 dari 15')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveFocus()
  })

  it('records only one answer when "Kirim keputusan" is double-clicked', async () => {
    const onAnswer = vi.fn()
    render(<Play state={stateAt(0)} onAnswer={onAnswer} onFinish={vi.fn()} />)
    await fill(OK_REASON)
    await userEvent.dblClick(submit())
    expect(onAnswer).toHaveBeenCalledTimes(1)
    expect(onAnswer.mock.calls[0][0].answers).toHaveLength(1)
  })

  it('accepts a 2000-character reason with emoji and line breaks and stores it trimmed', async () => {
    const onAnswer = vi.fn()
    render(<Play state={stateAt(0)} onAnswer={onAnswer} onFinish={vi.fn()} />)
    const long = '  Pertimbangan saya 🙂\nbaris kedua. ' + 'kata '.repeat(400) + '  '
    await fill(long)
    expect(submit()).toBeEnabled()
    await userEvent.click(submit())
    expect(onAnswer).toHaveBeenCalledTimes(1)
    expect(onAnswer.mock.calls[0][0].answers[0].reasoning).toBe(long.trim())
  })

  it('offers "Lihat laporan" after the 15th decision and finishes only once', async () => {
    const onFinish = vi.fn()
    render(<Harness initial={stateAt(14)} onFinish={onFinish} />)
    expect(screen.getByText(/Keputusan 15 dari 15/)).toBeInTheDocument()
    await fill(OK_REASON)
    await userEvent.click(submit())
    expect(screen.queryByRole('button', { name: 'Lanjut' })).not.toBeInTheDocument()
    await userEvent.dblClick(screen.getByRole('button', { name: 'Lihat laporan' }))
    expect(onFinish).toHaveBeenCalledTimes(1)
  })
})
