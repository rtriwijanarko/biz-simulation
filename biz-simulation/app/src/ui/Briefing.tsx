import { BANK } from '../content/profile'

export function Briefing({ onStart }: { onStart: () => void }) {
  return (
    <section aria-labelledby="briefing-title">
      <p className="eyebrow">{BANK.bank}</p>
      <h1 id="briefing-title">Simulasi {BANK.role}</h1>
      <p className="meta">{BANK.branch} · 15 keputusan dalam 5 babak · sekitar 45 sampai 75 menit</p>
      {BANK.briefing.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <button type="button" className="button" onClick={onStart}>
        Mulai simulasi
      </button>
    </section>
  )
}
