import type { ReadinessLevel } from '../archetypes/match'
import type { Archetype } from '../archetypes/archetypes'
import type { MetricId } from '../engine/types'
import { METRIC_LABELS, type Report } from '../report/buildReport'
import { DIMENSION_LABELS } from '../scoring/scorer'
import { Dashboard } from './Dashboard'
import { useFocusOnMount } from './focus'
import { formatNumber } from './format'

const LEVEL_MEANING: Record<ReadinessLevel, string> = {
  Emerging: 'Fondasi kepemimpinan sedang terbentuk; masih banyak ruang untuk berkembang.',
  Developing: 'Beberapa kekuatan sudah terlihat; sebagian dimensi masih perlu dibangun.',
  Ready: 'Siap mengambil peran kepemimpinan yang lebih besar dengan pendampingan terarah.',
  'Board-Ready': 'Kuat dan konsisten di seluruh dimensi; siap menghadapi sorotan tingkat dewan.',
}

// "NPL 0,5 lebih rendah; Realisasi Kredit 6 lebih rendah", relative to what the participant chose.
function describeDiff(diff: Partial<Record<MetricId, number>>): string {
  const parts = (Object.keys(diff) as MetricId[]).map((m) => {
    const d = diff[m] ?? 0
    return `${METRIC_LABELS[m]} ${formatNumber(Math.abs(d))} ${d > 0 ? 'lebih tinggi' : 'lebih rendah'}`
  })
  return parts.length > 0 ? parts.join('; ') : 'Angka cabang relatif sama.'
}

function ArchetypeBlock({ label, archetype }: { label: string; archetype: Archetype }) {
  return (
    <div className="archetype">
      <p className="eyebrow">{label}</p>
      <h3>{archetype.name}</h3>
      <p>{archetype.styleNote}</p>
      <h4>Kekuatan tipe ini</h4>
      <ul>
        {archetype.strengths.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <h4>Titik buta tipe ini</h4>
      <ul>
        {archetype.blindSpots.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  )
}

export function ReportView({ report, onRestart }: { report: Report; onRestart: () => void }) {
  const { primary, secondary } = report.archetype
  const headingRef = useFocusOnMount<HTMLHeadingElement>()
  // Evidence quotes say which decision they came from: "Keputusan 7 · Debitur besar mulai menunggak".
  const source = (decisionId: string) => {
    const index = report.timeline.findIndex((t) => t.decisionId === decisionId)
    return index === -1 ? null : `Keputusan ${index + 1} · ${report.timeline[index].title}`
  }
  return (
    <article className="report">
      <h1 ref={headingRef} tabIndex={-1}>
        Laporan penilaian
      </h1>

      <section>
        <h2>Ringkasan eksekutif</h2>
        <p>{report.summary}</p>
      </section>

      <section>
        <h2>Tingkat kesiapan</h2>
        <p className="level">
          <span className="value">{report.readiness.level}</span>
          <span className="meta">{`rata-rata skor ${formatNumber(report.readiness.average)} dari 100`}</span>
        </p>
        <p>{LEVEL_MEANING[report.readiness.level]}</p>
      </section>

      <section>
        <h2>Tipe kepemimpinan</h2>
        <div className="archetype-grid">
          <ArchetypeBlock label="Tipe utama" archetype={primary} />
          <ArchetypeBlock label="Tipe pendamping" archetype={secondary} />
        </div>
      </section>

      <section>
        <h2>Timeline keputusan</h2>
        <ol className="timeline">
          {report.timeline.map((entry) => (
            <li key={entry.decisionId}>
              <h3>{entry.title}</h3>
              <p>
                <strong>Pilihan Anda:</strong> {entry.chosenLabel}
              </p>
              <p>{entry.consequence}</p>
              <blockquote>{entry.quote}</blockquote>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Dampak pada angka cabang</h2>
        <p className="hint">Angka akhir dibandingkan dengan angka awal simulasi.</p>
        <Dashboard metrics={report.metricsEnd} previous={report.metricsStart} />
      </section>

      <section>
        <h2>Dimensi kesiapan</h2>
        <div className="dimensions-grid">
        {report.dimensions.map((d) => (
          <article className="dimension" key={d.dimension}>
            <h3>{DIMENSION_LABELS[d.dimension]}</h3>
            <p className="score">
              <meter min={0} max={100} value={d.score} aria-label={`Skor ${DIMENSION_LABELS[d.dimension]}`} />
              <span>{`${d.score} / 100`}</span>
            </p>
            <p>{d.rationale}</p>
            {d.evidence.length === 0 ? (
              <p className="hint">Belum ada keputusan yang secara khusus menggambarkan dimensi ini.</p>
            ) : (
              d.evidence.map((e) => (
                <figure className="evidence" key={e.decisionId}>
                  {source(e.decisionId) && <figcaption>{source(e.decisionId)}</figcaption>}
                  <blockquote>{e.quote}</blockquote>
                </figure>
              ))
            )}
          </article>
        ))}
        </div>
      </section>

      <section>
        <h2>Momen penentu</h2>
        <p className="hint">
          Keputusan di mana pilihan Anda paling membedakan hasilnya dari pilihan lain yang tersedia pada keputusan yang sama.
        </p>
        <ol className="pivotal">
          {report.pivotal.map((p) => (
            <li key={p.decisionId}>
              <h3>{p.title}</h3>
              <p>
                <strong>Pilihan Anda:</strong> {p.chosenLabel}
              </p>
              <p>{p.impact}</p>
              <p>
                <strong>Alternatif:</strong> {p.alternative.label}
              </p>
              <p>{p.alternative.consequence}</p>
              <p className="hint">{`Dibanding pilihan Anda: ${describeDiff(p.alternative.metricDiff)}.`}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Kekuatan</h2>
        <ul>
          {report.strengths.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Area pengembangan</h2>
        <ul>
          {report.developmentAreas.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Catatan</h2>
        <p>{report.disclaimer}</p>
      </section>

      <div className="actions no-print">
        <button type="button" className="button" onClick={() => window.print()}>
          Cetak / simpan PDF
        </button>
        <button type="button" className="button secondary" onClick={onRestart}>
          Mulai ulang
        </button>
      </div>
    </article>
  )
}
