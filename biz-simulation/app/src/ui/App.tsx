import { useState } from 'react'
import { DECISIONS } from '../content'
import { BANK } from '../content/profile'
import { startSession } from '../engine/engine'
import type { SessionState } from '../engine/types'
import { buildReport, type Report } from '../report/buildReport'
import { ACTIVE_SCORER } from '../scoring/active'
import { Briefing } from './Briefing'
import { ErrorBoundary } from './ErrorBoundary'
import { Play } from './Play'
import { ReportView } from './ReportView'

type Phase = 'briefing' | 'play' | 'report'

export function App() {
  const [phase, setPhase] = useState<Phase>('briefing')
  const [session, setSession] = useState<SessionState>(startSession)
  const [report, setReport] = useState<Report | null>(null)
  // Bumping the key remounts the boundary, which clears a caught error.
  const [resetKey, setResetKey] = useState(0)

  const restart = () => {
    setSession(startSession())
    setReport(null)
    setPhase('briefing')
    setResetKey((k) => k + 1)
  }

  const finish = async () => {
    const dimensions = await ACTIVE_SCORER.score([...session.answers], DECISIONS)
    setReport(buildReport(session, DECISIONS, dimensions))
    setPhase('report')
  }

  return (
    <>
      <header className="topbar no-print">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">{BANK.bank.charAt(0)}</span>
          <div className="brand-text">
            <strong>{BANK.bank}</strong>
            <span>{`Simulasi ${BANK.role}`}</span>
          </div>
        </div>
      </header>
      <main className="page">
        <ErrorBoundary key={resetKey} onReset={restart}>
          {phase === 'briefing' && <Briefing onStart={() => setPhase('play')} />}
          {phase === 'play' && <Play state={session} onAnswer={setSession} onFinish={finish} />}
          {phase === 'report' && report && <ReportView report={report} onRestart={restart} />}
        </ErrorBoundary>
      </main>
    </>
  )
}
