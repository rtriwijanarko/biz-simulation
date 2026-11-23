import { mockScorer } from './mockScorer'
import type { Scorer } from './scorer'

// The scorer the app uses. To plug in a real AI scorer later, implement `Scorer` (see scorer.ts)
// and export it here instead; nothing else in the app needs to change.
export const ACTIVE_SCORER: Scorer = mockScorer
