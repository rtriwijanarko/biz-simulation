import { describe, expect, it } from 'vitest'
import { currentDecision, startSession, submitAnswer } from '../engine/engine'
import type { Decision, SessionState } from '../engine/types'
import { chapter1 } from './chapter1'
import { chapter2 } from './chapter2'
import { chapter3 } from './chapter3'
import { chapter4 } from './chapter4'
import { DECISIONS } from './index'
import { flagsSetBy, validateDecision } from './validate'

const REASON = 'Alasan saya mempertimbangkan risiko dan dampaknya ke tim.'
const CHAPTER3_FLAGS = [
  'restructured_client',
  'called_collateral',
  'ignored_early_warning',
  'customer_apologized',
  'blamed_customer',
]
const CHAPTER4_FLAGS = ['reported_transparently', 'softened_report', 'fixed_root_cause', 'deflected_audit']

const uniqueFlags = (ds: Decision[]) => [...new Set(ds.flatMap(flagsSetBy))].sort()

// Answer decisions in play order with the given option ids.
function play(picks: string[]): SessionState {
  let s = startSession()
  for (const opt of picks) s = submitAnswer(s, DECISIONS, opt, REASON)
  return s
}
const variantAt = (s: SessionState, id: string) => {
  const cur = currentDecision(s, DECISIONS)
  expect(cur?.decision.id).toBe(id)
  return cur!.variantIndex
}
const lastVariant = (id: string) => DECISIONS.find((d) => d.id === id)!.variants.length - 1

// d1..d6 paths. relaxed: aggressive in chapter 1 (sets relaxed_verification).
// clean: cautious throughout (sets none of the chapter 1-2 risk flags).
const RELAXED = ['a', 'a', 'a', 'a', 'a', 'a']
const CLEAN = ['b', 'b', 'b', 'b', 'b', 'b']
// Ignoring the senior teller in D4 sets ignored_staff_issue.
const IGNORED_TELLER = ['b', 'b', 'b', 'c', 'b', 'b']

describe('chapters 3-4 content', () => {
  it('has three decisions per chapter, in order', () => {
    expect(chapter3).toHaveLength(3)
    expect(chapter4).toHaveLength(3)
    expect(chapter3.every((d) => d.chapter === 3)).toBe(true)
    expect(chapter4.every((d) => d.chapter === 4)).toBe(true)
    expect(DECISIONS.slice(0, 12).map((d) => d.id)).toEqual([
      'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12',
    ])
  })

  it('passes the per-decision validator with flags accumulated in order', () => {
    const earlier = new Set<string>()
    for (const d of [...chapter1, ...chapter2, ...chapter3, ...chapter4]) {
      expect(validateDecision(d, earlier), d.id).toEqual([])
      for (const f of flagsSetBy(d)) earlier.add(f)
    }
  })

  it('sets exactly the agreed flags per chapter', () => {
    expect(uniqueFlags(chapter3)).toEqual([...CHAPTER3_FLAGS].sort())
    expect(uniqueFlags(chapter4)).toEqual([...CHAPTER4_FLAGS].sort())
  })

  it('marks interpersonal decisions and names the person in every variant', () => {
    const [d7, d8, d9] = chapter3
    const [d10, d11, d12] = chapter4
    expect([d7.involvesPerson, d9.involvesPerson]).toEqual([false, false])
    for (const d of [d8, d10, d11, d12]) {
      expect(d.involvesPerson, d.id).toBe(true)
      for (const v of d.variants) expect(v.person?.trim(), d.id).toBeTruthy()
    }
  })

  it('gives every option a style signal and a stated trade-off (no single obvious winner)', () => {
    for (const d of [...chapter3, ...chapter4]) {
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

  it('keeps style signs consistent: hurting people never reads as leaning to people', () => {
    for (const d of [...chapter3, ...chapter4]) {
      for (const v of d.variants) {
        for (const o of v.options) {
          if ((o.signals.people ?? 0) < 0) {
            // people_task: positive = leans to people, negative = leans to task.
            expect(o.style.people_task ?? 0, `${d.id}/${o.id}`).toBeLessThanOrEqual(0)
          }
        }
      }
    }
  })

  it('measures resilience and learning where the plan needs them', () => {
    const [d7, d8, d9] = chapter3
    const [d10, d11, d12] = chapter4
    expect(d8.dimensions).toContain('resilience')
    expect(d11.dimensions).toContain('resilience')
    for (const d of [d9, d10, d12]) expect(d.dimensions, d.id).toContain('learning')
    expect(d7.dimensions).toEqual(expect.arrayContaining(['business', 'strategic']))
  })

  it('chains D7 and D8: loosened verification and an ignored teller change the story', () => {
    expect(variantAt(play(RELAXED), 'd7')).toBe(0)
    expect(variantAt(play(CLEAN), 'd7')).toBe(lastVariant('d7'))

    // D4 option c (ignore the teller) -> D8 shows the escalated-complaint variant.
    expect(variantAt(play([...IGNORED_TELLER, 'd']), 'd8')).toBe(0)
    expect(variantAt(play([...CLEAN, 'd']), 'd8')).toBe(lastVariant('d8'))
  })

  it('chains D9 on how the large debtor was handled in D7', () => {
    const afterD7 = (d7: string) => variantAt(play([...CLEAN, d7, 'a']), 'd9')
    expect(afterD7('a')).toBe(0) // restructured_client
    expect(afterD7('b')).toBe(1) // called_collateral
    expect(afterD7('c')).toBe(lastVariant('d9')) // ignored_early_warning
    expect(afterD7('d')).toBe(lastVariant('d9')) // joint recovery plan, no flag
  })

  it('chains D10 on relaxed verification, then on pushed growth, else the default', () => {
    const rest = ['d', 'a', 'a'] // D7-D9
    expect(variantAt(play([...RELAXED, ...rest]), 'd10')).toBe(0)
    // pushed_growth without relaxed_verification: D1 a, D2 b (does not relax).
    expect(variantAt(play(['a', 'b', 'b', 'b', 'b', 'b', ...rest]), 'd10')).toBe(1)
    expect(variantAt(play([...CLEAN, ...rest]), 'd10')).toBe(lastVariant('d10'))
  })

  it('chains D11 on a deflected audit and D12 on a softened report', () => {
    const upToD10 = [...CLEAN, 'd', 'a', 'a']
    expect(variantAt(play([...upToD10, 'b']), 'd11')).toBe(0) // deflected_audit
    expect(variantAt(play([...upToD10, 'a']), 'd11')).toBe(lastVariant('d11')) // fixed_root_cause

    // softened_report can come from D10 d or from D11 c.
    expect(variantAt(play([...upToD10, 'd', 'a']), 'd12')).toBe(0)
    expect(variantAt(play([...upToD10, 'a', 'c']), 'd12')).toBe(0)
    expect(variantAt(play([...upToD10, 'a', 'a']), 'd12')).toBe(lastVariant('d12'))
  })

  it('lets a full cautious and a full aggressive run reach D12 with different chapter 3-4 stories', () => {
    const cautious = play([...CLEAN, 'd', 'a', 'a', 'a', 'a', 'a'])
    const evasive = play([...RELAXED, 'c', 'b', 'b', 'b', 'c', 'b'])
    expect(cautious.index).toBe(12)
    expect(evasive.index).toBe(12)
    expect(cautious.flags).toContain('fixed_root_cause')
    expect(evasive.flags).toEqual(expect.arrayContaining(['deflected_audit', 'blamed_customer']))
    expect(evasive.metrics.compliance).toBeGreaterThan(cautious.metrics.compliance)
  })
})
