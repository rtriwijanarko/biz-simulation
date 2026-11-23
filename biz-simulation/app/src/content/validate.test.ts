import { describe, expect, it } from 'vitest'
import type { Decision, DimensionId, Option, StyleAxisId, Variant } from '../engine/types'
import { flagsSetBy, validateContent, validateDecision } from './validate'

const DIMS: DimensionId[] = [
  'business',
  'strategic',
  'people',
  'influence',
  'integrity',
  'resilience',
  'learning',
]
const AXES: StyleAxisId[] = ['growth_prudence', 'people_task', 'bold_steady']

// Every listed dimension gets a non-zero signal; the "balanced" option (polarity 0)
// signals +1 but carries style 0 on every axis.
function option(
  id: string,
  dim: DimensionId | DimensionId[],
  polarity: -1 | 0 | 1,
  setFlags: string[] = [],
): Option {
  const dims = Array.isArray(dim) ? dim : [dim]
  return {
    id,
    label: `Pilihan ${id}`,
    effects: { morale: polarity },
    setFlags,
    signals: Object.fromEntries(dims.map((d) => [d, polarity === 0 ? 1 : polarity])),
    style: Object.fromEntries(AXES.map((a) => [a, polarity])),
    consequence: 'Akibat singkat dari pilihan ini.',
  }
}

function variant(
  dim: DimensionId | DimensionId[],
  extra: Partial<Variant> = {},
  setFlags: string[] = [],
): Variant {
  return {
    situation: 'Situasi di cabang yang memerlukan keputusan.',
    options: [option('a', dim, 1, setFlags), option('b', dim, -1), option('c', dim, 0)],
    ...extra,
  }
}

// 15 valid decisions: 5 chapters x 3. Decision 0 sets "flag_x"; decision 1 branches on it.
function validContent(): Decision[] {
  return Array.from({ length: 15 }, (_, i) => {
    const dims = [DIMS[i % 7], DIMS[(i + 1) % 7]]
    const variants =
      i === 1
        ? [variant(dims, { requiresFlags: ['flag_x'] }), variant(dims)]
        : [variant(dims, {}, i === 0 ? ['flag_x'] : [])]
    return {
      id: `d${i + 1}`,
      chapter: (Math.floor(i / 3) + 1) as Decision['chapter'],
      title: `Keputusan ${i + 1}`,
      dimensions: dims,
      involvesPerson: dims.includes('people') || dims.includes('influence'),
      variants,
    }
  })
}

const has = (errors: string[], code: string) => errors.some((e) => e.includes(`[${code}]`))

describe('validateContent', () => {
  it('accepts a valid mini set', () => {
    expect(validateContent(validContent())).toEqual([])
  })

  it('requires exactly 15 decisions', () => {
    expect(has(validateContent(validContent().slice(0, 14)), 'jumlah-keputusan')).toBe(true)
    const extra = [...validContent(), { ...validContent()[0], id: 'd16' }]
    expect(has(validateContent(extra), 'jumlah-keputusan')).toBe(true)
  })

  it('requires exactly 3 decisions per chapter 1-5', () => {
    const c = validContent()
    c[0].chapter = 2
    expect(has(validateContent(c), 'jumlah-babak')).toBe(true)
  })

  it('rejects duplicate decision ids', () => {
    const c = validContent()
    c[1].id = c[0].id
    expect(has(validateContent(c), 'id-keputusan-ganda')).toBe(true)
  })

  it('rejects a decision without variants', () => {
    const c = validContent()
    c[2].variants = []
    expect(has(validateContent(c), 'varian-kosong')).toBe(true)
  })

  it('requires the last variant to have no conditions', () => {
    const c = validContent()
    c[1].variants[1].excludesFlags = ['flag_x']
    expect(has(validateContent(c), 'varian-bawaan')).toBe(true)
    const d = validContent()
    d[1].variants[1].requiresFlags = ['flag_x']
    expect(has(validateContent(d), 'varian-bawaan')).toBe(true)
  })

  it('rejects an unconditional variant that is not last (later variants unreachable)', () => {
    const c = validContent()
    c[1].variants = [variant('people'), variant('people')]
    expect(has(validateContent(c), 'varian-tak-terjangkau')).toBe(true)
  })

  it('requires 3-4 options per variant', () => {
    const c = validContent()
    c[3].variants[0].options = c[3].variants[0].options.slice(0, 2)
    expect(has(validateContent(c), 'jumlah-opsi')).toBe(true)
    const d = validContent()
    d[3].variants[0].options.push(option('d', 'business', 0), option('e', 'business', 0))
    expect(has(validateContent(d), 'jumlah-opsi')).toBe(true)
  })

  it('rejects duplicate option ids within a variant', () => {
    const c = validContent()
    c[4].variants[0].options[1].id = 'a'
    expect(has(validateContent(c), 'id-opsi-ganda')).toBe(true)
  })

  it('rejects an empty consequence', () => {
    const c = validContent()
    c[5].variants[0].options[0].consequence = '   '
    expect(has(validateContent(c), 'akibat-kosong')).toBe(true)
  })

  it('requires at least one numeric effect per option', () => {
    const c = validContent()
    c[6].variants[0].options[0].effects = {}
    expect(has(validateContent(c), 'efek-kosong')).toBe(true)
  })

  it('rejects unknown metric keys in effects', () => {
    const c = validContent()
    ;(c[6].variants[0].options[1].effects as Record<string, number>).profit = 5
    expect(has(validateContent(c), 'efek-kunci')).toBe(true)
  })

  it.each([
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['null', null],
    ['undefined', undefined],
    ['three decimals', 0.123],
    ['a string', '5'],
  ])('rejects an invalid effect value: %s', (_name, value) => {
    const c = validContent()
    ;(c[6].variants[0].options[2].effects as Record<string, unknown>).morale = value
    expect(has(validateContent(c), 'efek-nilai')).toBe(true)
  })

  it('accepts effects with up to two decimals and negative values', () => {
    const c = validContent()
    c[6].variants[0].options[2].effects = { npl: -0.35, dpk: 12.5, morale: -3 }
    expect(validateContent(c)).toEqual([])
  })

  it('requires 2-3 dimensions per decision', () => {
    const c = validContent()
    c[7].dimensions = ['business']
    expect(has(validateContent(c), 'jumlah-dimensi')).toBe(true)
    const d = validContent()
    d[7].dimensions = ['business', 'strategic', 'people', 'influence']
    expect(has(validateContent(d), 'jumlah-dimensi')).toBe(true)
  })

  it('rejects a signal on a dimension the decision does not list', () => {
    const c = validContent()
    c[8].variants[0].options[0].signals = { ...c[8].variants[0].options[0].signals, learning: 2 }
    c[8].dimensions = ['business', 'strategic']
    expect(has(validateContent(c), 'sinyal-dimensi')).toBe(true)
  })

  it('rejects an option with no non-zero dimension signal', () => {
    const c = validContent()
    c[8].variants[0].options[0].signals = {}
    expect(has(validateContent(c), 'sinyal-kosong')).toBe(true)
    const d = validContent()
    d[8].variants[0].options[0].signals = Object.fromEntries(
      Object.keys(d[8].variants[0].options[0].signals).map((k) => [k, 0]),
    )
    expect(has(validateContent(d), 'sinyal-kosong')).toBe(true)
  })

  it('rejects an option with no style value, but accepts an explicit 0', () => {
    const c = validContent()
    c[8].variants[0].options[0].style = {}
    expect(has(validateContent(c), 'sinyal-kosong')).toBe(true)
    const d = validContent()
    d[8].variants[0].options[2].style = { growth_prudence: 0 }
    expect(has(validateContent(d), 'sinyal-kosong')).toBe(false)
  })

  it.each([
    ['3', 3],
    ['0.5', 0.5],
    ['NaN', NaN],
    ['null', null],
  ])('rejects an out-of-range or invalid signal value: %s', (_n, value) => {
    const c = validContent()
    const o = c[8].variants[0].options[0]
    ;(o.signals as Record<string, unknown>)[c[8].dimensions[0]] = value
    expect(has(validateContent(c), 'sinyal-nilai')).toBe(true)
    const d = validContent()
    ;(d[8].variants[0].options[0].style as Record<string, unknown>).bold_steady = value
    expect(has(validateContent(d), 'sinyal-nilai')).toBe(true)
  })

  it('rejects an unknown style axis', () => {
    const c = validContent()
    ;(c[8].variants[0].options[0].style as Record<string, number>).charisma = 1
    expect(has(validateContent(c), 'sinyal-nilai')).toBe(true)
  })

  it('reports a coded message instead of throwing when signals or style are missing', () => {
    const c = validContent()
    const o = c[8].variants[0].options[0] as unknown as Record<string, unknown>
    delete o.signals
    delete o.style
    let errors: string[] = []
    expect(() => (errors = validateContent(c))).not.toThrow()
    expect(has(errors, 'sinyal-kosong')).toBe(true)
  })

  it('requires every listed dimension to be signalled by some option', () => {
    const c = validContent()
    const [first, second] = c[8].dimensions
    for (const v of c[8].variants) for (const o of v.options) delete o.signals[second]
    const errors = validateContent(c)
    expect(has(errors, 'dimensi-tanpa-sinyal')).toBe(true)
    expect(errors.some((e) => e.includes('dimensi-tanpa-sinyal') && e.includes(`"${second}"`))).toBe(true)
    expect(errors.some((e) => e.includes('dimensi-tanpa-sinyal') && e.includes(`"${first}"`))).toBe(false)
  })

  it('rejects a variant that requires and excludes the same flag', () => {
    const c = validContent()
    c[1].variants[0].excludesFlags = ['flag_x']
    expect(has(validateContent(c), 'syarat-bertentangan')).toBe(true)
  })

  it('requires at least 5 person decisions touching people or influence', () => {
    const c = validContent()
    for (const d of c) d.involvesPerson = false
    expect(has(validateContent(c), 'keputusan-antarpribadi')).toBe(true)
    // involvesPerson without people/influence does not count
    const e = validContent()
    for (const d of e) d.involvesPerson = d.dimensions.every((x) => x !== 'people' && x !== 'influence')
    expect(has(validateContent(e), 'keputusan-antarpribadi')).toBe(true)
  })

  it('requires each dimension in at least 2 decisions, learning in at least 3', () => {
    const c = validContent()
    for (const d of c) d.dimensions = d.dimensions.filter((x) => x !== 'integrity')
    for (const d of c) if (d.dimensions.length < 2) d.dimensions.push('business')
    for (const d of c) for (const v of d.variants) for (const o of v.options) delete o.signals.integrity
    expect(validateContent(c).some((e) => e.includes('[cakupan-dimensi]') && e.includes('"integrity"'))).toBe(true)

    const l = validContent()
    for (const d of l) {
      d.dimensions = d.dimensions.map((x) => (x === 'learning' ? 'resilience' : x))
      d.dimensions = [...new Set(d.dimensions)]
      if (d.dimensions.length < 2) d.dimensions.push('business')
      for (const v of d.variants) for (const o of v.options) delete o.signals.learning
    }
    expect(validateContent(l).some((e) => e.includes('[cakupan-dimensi]') && e.includes('"learning"'))).toBe(true)
  })

  it('accepts a dimension at its minimum: exactly 2 decisions, learning exactly 3', () => {
    // The fixture has learning in 4 decisions (i = 5, 6, 12, 13). Swap it for
    // "strategic" in one, then in a second.
    const swapLearning = (d: Decision) => {
      d.dimensions = d.dimensions.map((x) => (x === 'learning' ? 'strategic' : x))
      for (const v of d.variants) for (const o of v.options) {
        delete o.signals.learning
        o.signals.strategic = 1
      }
    }
    const c = validContent()
    swapLearning(c[13])
    expect(c.filter((d) => d.dimensions.includes('learning'))).toHaveLength(3)
    expect(validateContent(c)).toEqual([])
    swapLearning(c[12])
    expect(c.filter((d) => d.dimensions.includes('learning'))).toHaveLength(2)
    expect(validateContent(c).some((e) => e.includes('[cakupan-dimensi]') && e.includes('"learning"'))).toBe(true)
  })

  it('accepts exactly 5 person decisions and rejects 4', () => {
    const c = validContent()
    const personIdx = c.map((d, i) => (d.involvesPerson ? i : -1)).filter((i) => i >= 0)
    expect(personIdx.length).toBeGreaterThanOrEqual(6)
    for (const i of personIdx.slice(5)) c[i].involvesPerson = false
    expect(c.filter((d) => d.involvesPerson)).toHaveLength(5)
    expect(has(validateContent(c), 'keputusan-antarpribadi')).toBe(false)
    c[personIdx[4]].involvesPerson = false
    expect(has(validateContent(c), 'keputusan-antarpribadi')).toBe(true)
  })

  it('accepts decisions with exactly 2 and exactly 3 dimensions', () => {
    const c = validContent()
    c[4].dimensions = ['integrity', 'resilience', 'learning']
    for (const v of c[4].variants) for (const o of v.options) o.signals = { integrity: 1, resilience: 1, learning: 1 }
    expect(validateContent(c)).toEqual([])
  })

  it('accepts a style axis in exactly 6 decisions and rejects 5', () => {
    const c = validContent()
    // bold_steady stays only in decisions 0..5 (exactly 6); the other axes stay everywhere.
    for (const d of c.slice(6)) for (const v of d.variants) for (const o of v.options) delete o.style.bold_steady
    expect(has(validateContent(c), 'cakupan-gaya')).toBe(false)
    for (const v of c[5].variants) for (const o of v.options) delete o.style.bold_steady
    const errors = validateContent(c)
    expect(errors.some((e) => e.includes('[cakupan-gaya]') && e.includes('"bold_steady"'))).toBe(true)
  })

  it('does not count explicit zeros as covering a style axis', () => {
    const c = validContent()
    for (const d of c.slice(2)) for (const v of d.variants) for (const o of v.options) o.style.bold_steady = 0
    expect(has(validateContent(c), 'cakupan-gaya')).toBe(true)
  })

  it('requires each style axis on options in at least 6 decisions', () => {
    const c = validContent()
    for (const d of c.slice(0, 10)) for (const v of d.variants) for (const o of v.options) delete o.style.bold_steady
    expect(has(validateContent(c), 'cakupan-gaya')).toBe(true)
  })

  it('requires each style axis to have both positive and negative values', () => {
    const c = validContent()
    for (const d of c) for (const v of d.variants) for (const o of v.options) {
      if ((o.style.people_task ?? 0) < 0) o.style.people_task = 0
    }
    expect(has(validateContent(c), 'arah-gaya')).toBe(true)
  })

  it('rejects a flag requirement no earlier decision sets', () => {
    const c = validContent()
    c[1].variants[0].requiresFlags = ['never_set']
    expect(has(validateContent(c), 'flag-belum-ditetapkan')).toBe(true)
  })

  it('does not count a flag set by the same or a later decision', () => {
    const c = validContent()
    c[0].variants[0].options[0].setFlags = []
    c[1].variants[0].options[0].setFlags = ['flag_x'] // same decision as the requirement
    c[5].variants[0].options[0].setFlags = ['flag_x'] // later decision
    expect(has(validateContent(c), 'flag-belum-ditetapkan')).toBe(true)
  })

  it('checks excludesFlags the same way as requiresFlags', () => {
    const c = validContent()
    c[1].variants[0] = variant('business', { requiresFlags: ['flag_x'], excludesFlags: ['ghost'] })
    expect(has(validateContent(c), 'flag-belum-ditetapkan')).toBe(true)
  })

  it.each([
    ['BRI', 'Rapat dengan petinggi BRI pagi ini.'],
    ['Bank Rakyat', 'Nasabah dari bank rakyat besar.'],
    ['Bank Mandiri', 'Kompetitor kita, Bank Mandiri, menurunkan bunga.'],
    ['Bank  Mandiri (multi-space, newline)', 'Kompetitor kita, bank \n  mandiri menurunkan bunga.'],
    ['Bank  Rakyat (multi-space)', 'Nasabah dari Bank   Rakyat besar.'],
    ['BRI followed by punctuation', 'Rapat dengan BRI, lalu pulang.'],
    ['BRI with hyphen suffix', 'Aturan BRI-nya berbeda.'],
    ['BCA', 'Transfer lewat bca bermasalah.'],
    ['BNI', 'Kredit sindikasi dengan BNI.'],
  ])('rejects the brand name %s in situation text (case-insensitive)', (_name, text) => {
    const c = validContent()
    c[9].variants[0].situation = text
    expect(has(validateContent(c), 'kata-terlarang')).toBe(true)
  })

  it('rejects brand names in every text field', () => {
    const fields: ((d: Decision) => void)[] = [
      (d) => (d.title = 'Urusan BNI'),
      (d) => (d.variants[0].person = 'Pak Andi dari BCA'),
      (d) => (d.variants[0].options[0].label = 'Hubungi BRI'),
      (d) => (d.variants[0].options[0].consequence = 'Bank Mandiri ikut menurunkan bunga.'),
    ]
    for (const mutate of fields) {
      const c = validContent()
      mutate(c[10])
      expect(has(validateContent(c), 'kata-terlarang')).toBe(true)
    }
  })

  it('matches brand names only as whole words', () => {
    const c = validContent()
    c[9].variants[0].situation = 'Tim brilian menangani kasus bancassurance dan sebrisk.'
    expect(has(validateContent(c), 'kata-terlarang')).toBe(false)
  })

  it('allows the ordinary word "mandiri" (self-reliant) but not the bank name', () => {
    const c = validContent()
    c[9].variants[0].situation = 'Kepala unit meminta timnya bekerja secara mandiri. Mandiri berarti tidak bergantung.'
    expect(has(validateContent(c), 'kata-terlarang')).toBe(false)
  })

  it('names the matched brand in the message', () => {
    const c = validContent()
    c[9].variants[0].situation = 'Tentang BCA.'
    expect(validateContent(c).some((e) => e.includes('[kata-terlarang]') && e.includes('BCA'))).toBe(true)
  })

  it('names the decision id in each message', () => {
    const c = validContent()
    c[9].variants[0].situation = 'Tentang BCA.'
    expect(validateContent(c).some((e) => e.includes('d10'))).toBe(true)
  })

  it('reports several problems at once', () => {
    const c = validContent()
    c[2].variants[0].options[0].consequence = ''
    c[3].variants[0].options[0].effects = {}
    const errors = validateContent(c)
    expect(has(errors, 'akibat-kosong')).toBe(true)
    expect(has(errors, 'efek-kosong')).toBe(true)
  })
})

describe('flagsSetBy', () => {
  it('lists the flags every option of every variant can set', () => {
    const d = validContent()[0]
    d.variants[0].options[1].setFlags = ['flag_y', 'flag_z']
    expect(flagsSetBy(d).sort()).toEqual(['flag_x', 'flag_y', 'flag_z'])
  })
})

describe('validateDecision', () => {
  it('validates one decision against the flags set earlier', () => {
    const d = validContent()[1]
    expect(validateDecision(d, new Set(['flag_x']))).toEqual([])
    expect(has(validateDecision(d, new Set()), 'flag-belum-ditetapkan')).toBe(true)
  })

  it('does not apply whole-set rules (count, coverage)', () => {
    expect(validateDecision(validContent()[0], new Set())).toEqual([])
  })
})
