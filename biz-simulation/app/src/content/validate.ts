import { INITIAL_METRICS, METRIC_LIMITS, applyEffects } from '../engine/engine'
import type { Decision, DimensionId, Option, StyleAxisId, Variant } from '../engine/types'

// Content checks for the 15 scenario decisions. Every message starts with a
// stable rule code in brackets, e.g. "[jumlah-opsi] d3: ...", so tests and
// authors can tell which rule fired. An empty result means the content is valid.

const DIMENSIONS: readonly DimensionId[] = [
  'business',
  'strategic',
  'people',
  'influence',
  'integrity',
  'resilience',
  'learning',
]
const STYLE_AXES: readonly StyleAxisId[] = ['growth_prudence', 'people_task', 'bold_steady']

const EXPECTED_DECISIONS = 15
const CHAPTERS = [1, 2, 3, 4, 5] as const
const DECISIONS_PER_CHAPTER = 3
const MIN_PERSON_DECISIONS = 5
const MIN_DECISIONS_PER_DIMENSION = 2
const MIN_LEARNING_DECISIONS = 3
const MIN_DECISIONS_PER_STYLE_AXIS = 6

// Whole-word match, case-insensitive. Multi-word names tolerate any run of
// whitespace. Bare "mandiri" is an ordinary Indonesian word (self-reliant) that
// leadership scenarios will use, so only the bank name "Bank Mandiri" is blocked.
const FORBIDDEN_BRANDS =
  /(?<![\p{L}\p{N}])(BRI|Bank\s+Rakyat|Bank\s+Mandiri|BCA|BNI)(?![\p{L}\p{N}])/iu

const SIGNAL_VALUES: readonly number[] = [-2, -1, 0, 1, 2]

const msg = (code: string, decisionId: string, text: string) => `[${code}] ${decisionId}: ${text}`

function hasConditions(v: Variant): boolean {
  return (v.requiresFlags?.length ?? 0) > 0 || (v.excludesFlags?.length ?? 0) > 0
}

function textFields(d: Decision): string[] {
  const out = [d.title]
  for (const v of d.variants) {
    out.push(v.situation)
    if (v.person) out.push(v.person)
    for (const o of v.options) out.push(o.label, o.consequence)
  }
  return out
}

function checkEffects(d: Decision, o: Option, errors: string[]): void {
  const keys = Object.keys(o.effects)
  if (keys.length === 0) {
    errors.push(msg('efek-kosong', d.id, `opsi "${o.id}" tidak punya efek angka`))
    return
  }
  for (const key of keys) {
    if (!Object.hasOwn(METRIC_LIMITS, key)) {
      errors.push(msg('efek-kunci', d.id, `opsi "${o.id}" memakai angka tidak dikenal "${key}"`))
      continue
    }
    // Same rule applyEffects enforces while playing: finite, at most two decimals.
    try {
      applyEffects(INITIAL_METRICS, { [key]: (o.effects as Record<string, number>)[key] })
    } catch {
      errors.push(
        msg('efek-nilai', d.id, `opsi "${o.id}" efek "${key}" harus bilangan hingga dengan paling banyak dua desimal`),
      )
    }
  }
}

function checkOptions(d: Decision, v: Variant, index: number, errors: string[]): void {
  if (v.options.length < 3 || v.options.length > 4) {
    errors.push(msg('jumlah-opsi', d.id, `varian ${index + 1} punya ${v.options.length} opsi, harus 3 sampai 4`))
  }
  const seen = new Set<string>()
  for (const o of v.options) {
    if (seen.has(o.id)) errors.push(msg('id-opsi-ganda', d.id, `varian ${index + 1} memakai id opsi "${o.id}" dua kali`))
    seen.add(o.id)
    if (o.consequence.trim() === '') errors.push(msg('akibat-kosong', d.id, `opsi "${o.id}" tidak punya teks akibat`))
    checkEffects(d, o, errors)
    checkSignals(d, o, errors)
  }
}

// Every option must say something about the player: at least one non-zero
// dimension signal and at least one style axis (an explicit 0 is a deliberate
// "balanced" answer). Values must be integers in -2..2 so scoring stays in 0-100.
function checkSignals(d: Decision, o: Option, errors: string[]): void {
  const signals = o.signals ?? {}
  const style = o.style ?? {}

  for (const [dim, value] of Object.entries(signals)) {
    if (!d.dimensions.includes(dim as DimensionId)) {
      errors.push(msg('sinyal-dimensi', d.id, `opsi "${o.id}" memberi sinyal pada "${dim}" yang tidak ditandai keputusan ini`))
    }
    if (!SIGNAL_VALUES.includes(value as number)) {
      errors.push(msg('sinyal-nilai', d.id, `opsi "${o.id}" sinyal "${dim}" harus bilangan bulat -2 sampai 2`))
    }
  }
  for (const [axis, value] of Object.entries(style)) {
    if (!STYLE_AXES.includes(axis as StyleAxisId)) {
      errors.push(msg('sinyal-nilai', d.id, `opsi "${o.id}" memakai sumbu gaya tidak dikenal "${axis}"`))
    } else if (!SIGNAL_VALUES.includes(value as number)) {
      errors.push(msg('sinyal-nilai', d.id, `opsi "${o.id}" gaya "${axis}" harus bilangan bulat -2 sampai 2`))
    }
  }

  const hasDimensionSignal = Object.values(signals).some((x) => x !== 0 && x !== undefined)
  if (!hasDimensionSignal || Object.keys(style).length === 0) {
    errors.push(msg('sinyal-kosong', d.id, `opsi "${o.id}" harus punya minimal satu sinyal dimensi bukan nol dan satu nilai gaya`))
  }
}

function checkFlags(d: Decision, v: Variant, index: number, earlierFlags: ReadonlySet<string>, errors: string[]): void {
  for (const flag of [...(v.requiresFlags ?? []), ...(v.excludesFlags ?? [])]) {
    if (!earlierFlags.has(flag)) {
      errors.push(
        msg('flag-belum-ditetapkan', d.id, `varian ${index + 1} memakai bendera "${flag}" yang belum ditetapkan keputusan sebelumnya`),
      )
    }
  }
}

// Rules that concern a single decision. `earlierFlags` are the flags that
// decisions before this one can set.
export function validateDecision(d: Decision, earlierFlags: ReadonlySet<string>): string[] {
  const errors: string[] = []

  if (d.dimensions.length < 2 || d.dimensions.length > 3) {
    errors.push(msg('jumlah-dimensi', d.id, `menandai ${d.dimensions.length} dimensi, harus 2 sampai 3`))
  }

  if (d.variants.length === 0) {
    errors.push(msg('varian-kosong', d.id, 'tidak punya varian cerita'))
  } else {
    const last = d.variants.length - 1
    if (hasConditions(d.variants[last])) {
      errors.push(msg('varian-bawaan', d.id, 'varian terakhir harus tanpa syarat bendera (varian bawaan)'))
    }
    d.variants.forEach((v, i) => {
      if (i < last && !hasConditions(v)) {
        errors.push(msg('varian-tak-terjangkau', d.id, `varian ${i + 1} tanpa syarat membuat varian sesudahnya tidak pernah terpilih`))
      }
      if ((v.requiresFlags ?? []).some((f) => (v.excludesFlags ?? []).includes(f))) {
        errors.push(msg('syarat-bertentangan', d.id, `varian ${i + 1} mensyaratkan sekaligus melarang bendera yang sama`))
      }
      checkOptions(d, v, i, errors)
      checkFlags(d, v, i, earlierFlags, errors)
    })

    // A dimension the decision claims to measure must be signalled by at least
    // one option, otherwise it counts toward coverage while producing no data.
    for (const dim of d.dimensions) {
      const signalled = d.variants.some((v) => v.options.some((o) => ((o.signals ?? {})[dim] ?? 0) !== 0))
      if (!signalled) errors.push(msg('dimensi-tanpa-sinyal', d.id, `dimensi "${dim}" ditandai tetapi tidak ada opsi yang memberi sinyal padanya`))
    }
  }

  for (const text of textFields(d)) {
    const hit = FORBIDDEN_BRANDS.exec(text)
    if (hit) errors.push(msg('kata-terlarang', d.id, `memuat nama bank asli "${hit[1]}"`))
  }

  return errors
}

// Exported so per-chapter content tests can accumulate "earlier flags" the same way.
export function flagsSetBy(d: Decision): string[] {
  return d.variants.flatMap((v) => v.options.flatMap((o) => o.setFlags))
}

function checkStructure(decisions: readonly Decision[], errors: string[]): void {
  if (decisions.length !== EXPECTED_DECISIONS) {
    errors.push(`[jumlah-keputusan] seluruh konten: ada ${decisions.length} keputusan, harus tepat ${EXPECTED_DECISIONS}`)
  }
  for (const chapter of CHAPTERS) {
    const n = decisions.filter((d) => d.chapter === chapter).length
    if (n !== DECISIONS_PER_CHAPTER) {
      errors.push(`[jumlah-babak] seluruh konten: babak ${chapter} punya ${n} keputusan, harus tepat ${DECISIONS_PER_CHAPTER}`)
    }
  }
  const ids = new Set<string>()
  for (const d of decisions) {
    if (ids.has(d.id)) errors.push(msg('id-keputusan-ganda', d.id, 'id keputusan dipakai lebih dari sekali'))
    ids.add(d.id)
  }
}

function checkCoverage(decisions: readonly Decision[], errors: string[]): void {
  const persons = decisions.filter(
    (d) => d.involvesPerson && (d.dimensions.includes('people') || d.dimensions.includes('influence')),
  ).length
  if (persons < MIN_PERSON_DECISIONS) {
    errors.push(
      `[keputusan-antarpribadi] seluruh konten: hanya ${persons} keputusan antarpribadi yang menandai "people" atau "influence", minimal ${MIN_PERSON_DECISIONS}`,
    )
  }

  for (const dim of DIMENSIONS) {
    const n = decisions.filter((d) => d.dimensions.includes(dim)).length
    const min = dim === 'learning' ? MIN_LEARNING_DECISIONS : MIN_DECISIONS_PER_DIMENSION
    if (n < min) errors.push(`[cakupan-dimensi] seluruh konten: dimensi "${dim}" hanya muncul di ${n} keputusan, minimal ${min}`)
  }

  for (const axis of STYLE_AXES) {
    let decisionsWithAxis = 0
    let positive = false
    let negative = false
    for (const d of decisions) {
      // Only non-zero values count: padding an axis with explicit zeros must not
      // satisfy the coverage rule.
      const values = d.variants
        .flatMap((v) => v.options.map((o) => (o.style ?? {})[axis]))
        .filter((x) => x !== undefined && x !== 0)
      if (values.length > 0) decisionsWithAxis++
      if (values.some((x) => x! > 0)) positive = true
      if (values.some((x) => x! < 0)) negative = true
    }
    if (decisionsWithAxis < MIN_DECISIONS_PER_STYLE_AXIS) {
      errors.push(
        `[cakupan-gaya] seluruh konten: sumbu gaya "${axis}" hanya didefinisikan di ${decisionsWithAxis} keputusan, minimal ${MIN_DECISIONS_PER_STYLE_AXIS}`,
      )
    }
    if (!positive || !negative) {
      errors.push(`[arah-gaya] seluruh konten: sumbu gaya "${axis}" harus punya nilai positif dan negatif`)
    }
  }
}

export function validateContent(decisions: readonly Decision[]): string[] {
  const errors: string[] = []
  checkStructure(decisions, errors)

  const earlierFlags = new Set<string>()
  for (const d of decisions) {
    errors.push(...validateDecision(d, earlierFlags))
    for (const flag of flagsSetBy(d)) earlierFlags.add(flag)
  }

  checkCoverage(decisions, errors)
  return errors
}
