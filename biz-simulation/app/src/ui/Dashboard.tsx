import type { MetricId, Metrics } from '../engine/types'
import { formatNumber as format } from './format'

const ROWS: { id: MetricId; label: string }[] = [
  { id: 'npl', label: 'NPL (% dari kredit)' },
  { id: 'dpk', label: 'Dana Pihak Ketiga (Rp miliar)' },
  { id: 'realization', label: 'Realisasi Kredit (% dari target)' },
  { id: 'morale', label: 'Moral Tim (0–100)' },
  { id: 'regional', label: 'Hubungan dengan Regional (0–100)' },
  { id: 'compliance', label: 'Risiko Kepatuhan (0–100, makin tinggi makin berisiko)' },
]

// For these, a lower figure is the healthier one.
const LOWER_IS_BETTER: ReadonlySet<MetricId> = new Set<MetricId>(['npl', 'compliance'])

function change(id: MetricId, now: number, before: number): { direction: 'naik' | 'turun'; text: string; tone: 'good' | 'bad' } | null {
  const delta = Math.round((now - before) * 10) / 10
  if (delta === 0) return null
  const better = LOWER_IS_BETTER.has(id) ? delta < 0 : delta > 0
  return {
    direction: delta > 0 ? 'naik' : 'turun',
    text: `${delta > 0 ? 'naik' : 'turun'} ${format(Math.abs(delta))}`,
    tone: better ? 'good' : 'bad',
  }
}

export function Dashboard({ metrics, previous }: { metrics: Readonly<Metrics>; previous?: Readonly<Metrics> }) {
  return (
    <dl className="dashboard">
      {ROWS.map(({ id, label }) => {
        const moved = previous ? change(id, metrics[id], previous[id]) : null
        return (
          <div className="figure" key={id}>
            <dt>{label}</dt>
            <dd>
              <span className="value">{format(metrics[id])}</span>
              {moved && <span className={`change ${moved.direction} ${moved.tone}`}>{moved.text}</span>}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
