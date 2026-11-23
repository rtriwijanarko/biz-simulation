import type { Decision } from '../engine/types'
import { chapter1 } from './chapter1'
import { chapter2 } from './chapter2'
import { chapter3 } from './chapter3'
import { chapter4 } from './chapter4'
import { chapter5 } from './chapter5'

// All 15 decisions in play order.
export const DECISIONS: Decision[] = [...chapter1, ...chapter2, ...chapter3, ...chapter4, ...chapter5]
