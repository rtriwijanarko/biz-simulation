import { describe, expect, it } from 'vitest'
import { DECISIONS } from '../content'
import { currentDecision, startSession, submitAnswer } from '../engine/engine'
import { ACTIVE_SCORER } from './active'

describe('ACTIVE_SCORER', () => {
  it('is the scorer the app uses and scores a finished session on all seven dimensions', async () => {
    let s = startSession()
    for (;;) {
      const cur = currentDecision(s, DECISIONS)
      if (!cur) break
      s = submitAnswer(s, DECISIONS, cur.decision.variants[cur.variantIndex].options[0].id, 'Alasan saya cukup panjang untuk diterima.')
    }
    const results = await ACTIVE_SCORER.score([...s.answers], DECISIONS)
    expect(results).toHaveLength(7)
  })
})
