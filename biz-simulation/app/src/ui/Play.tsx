import { useRef, useState } from 'react'
import { DECISIONS } from '../content'
import { MIN_REASONING_CHARS, currentDecision, isReasoningValid, submitAnswer } from '../engine/engine'
import type { Metrics, SessionState } from '../engine/types'
import { Dashboard } from './Dashboard'
import { useFocusOnMount } from './focus'

interface Feedback {
  consequence: string
  before: Metrics
  after: Metrics
  isLast: boolean
}

interface PlayProps {
  state: SessionState
  onAnswer: (next: SessionState) => void
  onFinish: () => void
}

export function Play({ state, onAnswer, onFinish }: PlayProps) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  // An error thrown inside a click handler is not caught by React error boundaries, so it is
  // kept here and rethrown while rendering, where the boundary shows the polite notice.
  const [crash, setCrash] = useState<unknown>(null)
  // A ref, not state: the report button stays on screen, so a second click must be ignored.
  const finished = useRef(false)

  const submit = (optionId: string, reasoning: string) => {
    try {
      const next = submitAnswer(state, DECISIONS, optionId, reasoning)
      const answer = next.answers[next.answers.length - 1]
      const variant = DECISIONS.find((d) => d.id === answer.decisionId)!.variants[answer.variantIndex]
      setFeedback({
        consequence: variant.options.find((o) => o.id === answer.optionId)!.consequence,
        before: { ...answer.metricsBefore },
        after: { ...answer.metricsAfter },
        isLast: next.index >= DECISIONS.length,
      })
      onAnswer(next)
    } catch (error) {
      setCrash(error)
    }
  }

  if (crash) throw crash

  if (feedback) {
    return (
      <Feedback feedback={feedback} onFinish={() => {
        if (finished.current) return
        finished.current = true
        onFinish()
      }} onNext={() => setFeedback(null)} />
    )
  }

  const current = currentDecision(state, DECISIONS)
  if (!current) return null
  return <DecisionForm key={state.index} state={state} onSubmit={submit} />
}

function Feedback({ feedback, onFinish, onNext }: { feedback: Feedback; onFinish: () => void; onNext: () => void }) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>()
  return (
    <section aria-labelledby="feedback-title">
      <h2 id="feedback-title" ref={headingRef} tabIndex={-1}>Akibat keputusan Anda</h2>
      <p>{feedback.consequence}</p>
      <Dashboard metrics={feedback.after} previous={feedback.before} />
      {feedback.isLast ? (
        <button type="button" className="button" onClick={onFinish}>
          Lihat laporan
        </button>
      ) : (
        <button type="button" className="button" onClick={onNext}>
          Lanjut
        </button>
      )}
    </section>
  )
}

const CHAPTERS = [1, 2, 3, 4, 5] as const

function Stepper({ current }: { current: number }) {
  return (
    <ol className="stepper" aria-label="Babak simulasi">
      {CHAPTERS.map((n) => {
        const status = n < current ? 'selesai' : n === current ? 'sedang berjalan' : 'belum'
        return (
          <li key={n} className={`step ${n < current ? 'done' : n === current ? 'now' : ''}`} aria-current={n === current ? 'step' : undefined}>
            <span aria-hidden="true">{n < current ? '✓' : n}</span>
            <span className="sr-only">{`Babak ${n}, ${status}`}</span>
          </li>
        )
      })}
    </ol>
  )
}

// Earlier answers, read from the session. Nothing is added: title, number and the option the participant chose.
function History({ state }: { state: SessionState }) {
  return (
    <details className="history">
      <summary>{`Riwayat (${state.answers.length})`}</summary>
      <div className="history-panel">
        {state.answers.length === 0 ? (
          <p className="hint">Belum ada keputusan yang diambil.</p>
        ) : (
          <ol>
            {state.answers.map((a, i) => {
              const decision = DECISIONS.find((d) => d.id === a.decisionId)!
              const label = decision.variants[a.variantIndex].options.find((o) => o.id === a.optionId)?.label
              return (
                <li key={a.decisionId}>
                  <strong>{`Keputusan ${i + 1} · ${decision.title}`}</strong>
                  <span>{label}</span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </details>
  )
}

function DecisionForm({ state, onSubmit }: { state: SessionState; onSubmit: (optionId: string, reasoning: string) => void }) {
  const [optionId, setOptionId] = useState('')
  const [reasoning, setReasoning] = useState('')
  // On a phone the figures start folded so the situation stays near the top.
  const [compassOpen, setCompassOpen] = useState(() => window.matchMedia?.('(min-width: 640px)').matches ?? true)
  const { decision, variantIndex } = currentDecision(state, DECISIONS)!
  const variant = decision.variants[variantIndex]
  const count = Array.from(reasoning.trim()).length
  const headingRef = useFocusOnMount<HTMLHeadingElement>()

  return (
    <div className="decision-screen">
      <header className="decision-head">
        <div className="decision-title">
          <p className="eyebrow">{`Babak ${decision.chapter} · Keputusan ${state.index + 1} dari ${DECISIONS.length}`}</p>
          <h2 id="decision-title" ref={headingRef} tabIndex={-1}>
            {decision.title}
          </h2>
        </div>
        <div className="decision-nav">
          <History state={state} />
          <Stepper current={decision.chapter} />
        </div>
      </header>

      <details className="compass" open={compassOpen} onToggle={(e) => setCompassOpen(e.currentTarget.open)}>
        <summary id="state-title">Kondisi cabang saat ini</summary>
        <Dashboard metrics={state.metrics} />
      </details>

      <div className="decision-layout">
        <section className="briefing" aria-label="Situasi">
          <p className="eyebrow">Situasi</p>
          {variant.person && <p className="person">{variant.person}</p>}
          <p>{variant.situation}</p>
        </section>

        <form
          aria-labelledby="decision-title"
          onSubmit={(e) => {
            e.preventDefault()
            if (optionId && isReasoningValid(reasoning)) onSubmit(optionId, reasoning)
          }}
        >
          <fieldset>
            <legend>Tindakan yang Anda pilih</legend>
            {variant.options.map((option) => (
              <label className="option" key={option.id}>
                <input
                  type="radio"
                  name="option"
                  value={option.id}
                  checked={optionId === option.id}
                  onChange={() => setOptionId(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>

          <label htmlFor="reasoning" className="field-label">
            Alasan Anda
          </label>
          <p id="reasoning-help" className="hint">
            Jelaskan pertimbangan Anda, trade-off yang Anda sadari, dan batasan yang Anda tetapkan.
          </p>
          <textarea
            id="reasoning"
            rows={6}
            value={reasoning}
            aria-describedby="reasoning-help reasoning-count"
            onChange={(e) => setReasoning(e.target.value)}
          />
          <div className="submit-row">
            <p id="reasoning-count" className="hint">{`${count} dari minimal ${MIN_REASONING_CHARS} karakter`}</p>
            <button type="submit" className="button" disabled={!optionId || !isReasoningValid(reasoning)}>
              Kirim keputusan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
