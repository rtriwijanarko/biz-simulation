export type DimensionId =
  | 'business'
  | 'strategic'
  | 'people'
  | 'influence'
  | 'integrity'
  | 'resilience'
  | 'learning'

export type StyleAxisId = 'growth_prudence' | 'people_task' | 'bold_steady'

export type MetricId = 'npl' | 'dpk' | 'realization' | 'morale' | 'regional' | 'compliance'

export type Metrics = Record<MetricId, number>

export type Signal = -2 | -1 | 0 | 1 | 2

export interface Option {
  id: string
  label: string
  effects: Partial<Metrics>
  setFlags: string[]
  signals: Partial<Record<DimensionId, Signal>>
  style: Partial<Record<StyleAxisId, Signal>>
  consequence: string
}

export interface Variant {
  requiresFlags?: string[]
  excludesFlags?: string[]
  situation: string
  person?: string
  options: Option[]
}

export interface Decision {
  id: string
  chapter: 1 | 2 | 3 | 4 | 5
  title: string
  dimensions: DimensionId[]
  involvesPerson: boolean
  variants: Variant[]
}

export interface Answer {
  readonly decisionId: string
  readonly variantIndex: number
  readonly optionId: string
  readonly reasoning: string
  readonly metricsBefore: Readonly<Metrics>
  readonly metricsAfter: Readonly<Metrics>
}

// A session is never edited in place: each answer produces a new SessionState.
export interface SessionState {
  readonly index: number
  readonly metrics: Readonly<Metrics>
  readonly flags: readonly string[]
  readonly answers: readonly Answer[]
}
