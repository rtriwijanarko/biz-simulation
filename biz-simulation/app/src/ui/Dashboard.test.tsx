import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { INITIAL_METRICS } from '../engine/engine'
import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  it('shows all six branch figures with Indonesian labels and decimal commas', () => {
    render(<Dashboard metrics={INITIAL_METRICS} />)
    for (const label of [
      /^NPL/,
      /^Dana Pihak Ketiga/,
      /^Realisasi Kredit/,
      /^Moral Tim/,
      /^Hubungan dengan Regional/,
      /^Risiko Kepatuhan/,
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(screen.getByText('3,4')).toBeInTheDocument()
    expect(screen.getByText('850')).toBeInTheDocument()
    expect(screen.queryByText(/naik|turun/)).not.toBeInTheDocument()
  })

  it('states the direction and size of each change against the previous figures, in words', () => {
    const next = { ...INITIAL_METRICS, npl: 4.2, morale: 64, dpk: 850 }
    render(<Dashboard metrics={next} previous={INITIAL_METRICS} />)
    expect(screen.getByText(/naik 0,8/)).toBeInTheDocument()
    expect(screen.getByText(/turun 6/)).toBeInTheDocument()
    // Unchanged figures say nothing.
    expect(screen.getAllByText(/naik|turun/)).toHaveLength(2)
  })
})
