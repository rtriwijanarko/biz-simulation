import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onReset: () => void
}

// A screen that throws must not leave the participant with a blank page. The technical message is
// never shown: it means nothing to a participant and can leak internals.
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="notice">
        <h2>Terjadi kendala</h2>
        <p>Maaf, terjadi kendala pada tampilan simulasi. Silakan mulai ulang dari awal.</p>
        <button type="button" className="button" onClick={this.props.onReset}>
          Mulai ulang
        </button>
      </div>
    )
  }
}
