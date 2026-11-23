import { describe, expect, it } from 'vitest'
import { currentDecision, startSession, submitAnswer } from '../engine/engine'
import type { Decision } from '../engine/types'
import { chapter1 } from './chapter1'
import { chapter2 } from './chapter2'
import { DECISIONS } from './index'
import { BANK } from './profile'
import { validateDecision } from './validate'

const REASON = 'Alasan saya mempertimbangkan risiko dan dampaknya ke tim.'
const CHAPTER1_FLAGS = ['pushed_growth', 'relaxed_verification', 'held_line', 'price_matched', 'trusted_unit_head']
const CHAPTER2_FLAGS = [
  'coached_staff',
  'warned_staff',
  'ignored_staff_issue',
  'protected_star_lead',
  'disciplined_star_lead',
]

const flagsSetBy = (ds: Decision[]) =>
  [...new Set(ds.flatMap((d) => d.variants.flatMap((v) => v.options.flatMap((o) => o.setFlags))))].sort()

describe('chapters 1-2 content', () => {
  it('has three decisions per chapter, in order', () => {
    expect(chapter1).toHaveLength(3)
    expect(chapter2).toHaveLength(3)
    expect(chapter1.every((d) => d.chapter === 1)).toBe(true)
    expect(chapter2.every((d) => d.chapter === 2)).toBe(true)
    expect(DECISIONS.slice(0, 6).map((d) => d.id)).toEqual(['d1', 'd2', 'd3', 'd4', 'd5', 'd6'])
  })

  it('passes the per-decision validator with flags accumulated in order', () => {
    const earlier = new Set<string>()
    for (const d of [...chapter1, ...chapter2]) {
      expect(validateDecision(d, earlier), d.id).toEqual([])
      for (const v of d.variants) for (const o of v.options) o.setFlags.forEach((f) => earlier.add(f))
    }
  })

  it('sets exactly the agreed flags per chapter', () => {
    expect(flagsSetBy(chapter1)).toEqual([...CHAPTER1_FLAGS].sort())
    expect(flagsSetBy(chapter2)).toEqual([...CHAPTER2_FLAGS].sort())
  })

  it('marks interpersonal decisions and names the person in every variant', () => {
    const [d1, d2, d3] = chapter1
    const [d4, d5, d6] = chapter2
    expect([d1.involvesPerson, d3.involvesPerson]).toEqual([false, false])
    for (const d of [d2, d4, d5, d6]) {
      expect(d.involvesPerson, d.id).toBe(true)
      for (const v of d.variants) expect(v.person?.trim(), d.id).toBeTruthy()
    }
  })

  it('gives every option a style signal and a stated trade-off (no single obvious winner)', () => {
    for (const d of [...chapter1, ...chapter2]) {
      for (const v of d.variants) {
        expect(v.options.length).toBeGreaterThanOrEqual(3)
        for (const o of v.options) expect(Object.keys(o.style).length, `${d.id}/${o.id}`).toBeGreaterThan(0)
        const risky = v.options.filter((o) => (o.effects.compliance ?? 0) > 0 || (o.effects.npl ?? 0) > 0)
        const costly = v.options.filter((o) => (o.effects.morale ?? 0) < 0 || (o.effects.realization ?? 0) < 0)
        expect(risky.length, `${d.id} has an option with a risk cost`).toBeGreaterThan(0)
        expect(costly.length, `${d.id} has an option with a performance/people cost`).toBeGreaterThan(0)
      }
    }
  })

  it('keeps style signs consistent: pushing or deploying staff for the target leans to task, never to people', () => {
    const d1 = chapter1[0].variants[0].options
    // people_task: positive = leans to people, negative = leans to task.
    expect(d1.find((o) => o.id === 'a')?.style.people_task ?? 0).toBeLessThan(0)
    expect(d1.find((o) => o.id === 'c')?.style.people_task ?? 0).toBeLessThan(0)
  })

  it('chains: choices in chapter 1 and 2 change which story variant a later decision shows', () => {
    const play = (picks: Array<[string, string]>) => {
      let s = startSession()
      for (const [, opt] of picks) s = submitAnswer(s, DECISIONS, opt, REASON)
      return s
    }
    // Aggressive D1 -> D2 shows the "after the push" variant (index 0); cautious -> default (last).
    const pushed = play([['d1', 'a']])
    const held = play([['d1', 'b']])
    expect(currentDecision(pushed, DECISIONS)?.variantIndex).toBe(0)
    expect(currentDecision(held, DECISIONS)?.variantIndex).toBe(DECISIONS[1].variants.length - 1)

    // Loosening verification in D2 changes D3 and D5; ignoring the teller in D4 changes D6.
    const loosened = play([['d1', 'a'], ['d2', 'a']])
    expect(currentDecision(loosened, DECISIONS)?.decision.id).toBe('d3')
    expect(currentDecision(loosened, DECISIONS)?.variantIndex).toBe(0)
    const strict = play([['d1', 'b'], ['d2', 'b']])
    expect(currentDecision(strict, DECISIONS)?.variantIndex).toBe(DECISIONS[2].variants.length - 1)

    const ignored = play([['d1', 'a'], ['d2', 'a'], ['d3', 'a'], ['d4', 'c']])
    expect(currentDecision(ignored, DECISIONS)?.decision.id).toBe('d5')
    expect(currentDecision(ignored, DECISIONS)?.variantIndex).toBe(0)
    const coached = play([['d1', 'b'], ['d2', 'b'], ['d3', 'b'], ['d4', 'a']])
    expect(currentDecision(coached, DECISIONS)?.variantIndex).toBe(DECISIONS[4].variants.length - 1)

    const ignoredThenD5 = submitAnswer(ignored, DECISIONS, 'a', REASON)
    expect(currentDecision(ignoredThenD5, DECISIONS)?.decision.id).toBe('d6')
    expect(currentDecision(ignoredThenD5, DECISIONS)?.variantIndex).toBe(0)
  })
})

describe('bank profile', () => {
  it('has fictional names and a 3-4 paragraph briefing without real brands', () => {
    expect(BANK.bank.trim()).not.toBe('')
    expect(BANK.branch.trim()).not.toBe('')
    expect(BANK.role).toMatch(/Kepala Cabang/)
    expect(BANK.briefing.length).toBeGreaterThanOrEqual(3)
    expect(BANK.briefing.length).toBeLessThanOrEqual(4)
    const all = [BANK.bank, BANK.branch, BANK.role, ...BANK.briefing].join(' ')
    expect(all).not.toMatch(/(?<![\p{L}\p{N}])(BRI|Bank\s+Rakyat|Mandiri|BCA|BNI)(?![\p{L}\p{N}])/iu)
    expect(all.toLowerCase()).toContain('tidak ada jawaban')
  })
})
