// Release notes data model.
//
// These releases are curated, plain-English summaries of what shipped in Kevin
// (backend repo: kawo-kevin) plus the surrounding frontends. They are written for
// a non-technical / sales audience, NOT as a raw changelog.
//
// To add a future release: create lib/releases/vX_Y_Z.ts exporting a `Release`
// and register it in lib/releases/index.ts.

export type ChangeType = 'feature' | 'improvement' | 'fix'

export type Scope =
  | 'Kevin Chat' // chat, models, thinking mode, LangGraph, image chat, skills
  | 'Claw' // Kevin's Claw agent: Office files, streaming, todos, document handling
  | 'Video' // video analysis + follow-ups + video evaluation
  | 'Analysis Service' // share of voice, competitor analysis, GEO, tag analysis, comment/sentiment analysis, topics
  | 'AI Report' // report generation, report sections, canvas
  | 'Content Generation' // content creation pipeline, brand voice, editing process, quality control, instruction following
  | 'Ops & Analytics' // usage analytics, cost tracking, WeChat, CRM, retention, this dashboard, infrastructure & deployment

export interface ReleaseChange {
  /** Short, friendly headline. */
  title: string
  /** 1-2 sentences, plain non-technical English. */
  description: string
  type: ChangeType
  scope: Scope
  /**
   * Whether this is live in a customer-facing product yet.
   * Many items ship to the backend first and are not exposed in the UI.
   * Defaults to true (live) when omitted. Set false for backend-only work.
   */
  frontendEnabled?: boolean
  /** Optional concrete "what this means in practice" scenario for sales. */
  example?: string
}

export interface Release {
  /** e.g. "v0.7.7" */
  version: string
  /** ISO date "YYYY-MM-DD", used for sorting and display. */
  date: string
  /** Human title, e.g. "Skills & Office Files". */
  name: string
  /** One-line plain-English headline for the whole release. */
  summary: string
  changes: ReleaseChange[]
}

export const SCOPES: Scope[] = [
  'Kevin Chat',
  'Claw',
  'Video',
  'Analysis Service',
  'AI Report',
  'Content Generation',
  'Ops & Analytics',
]

export const CHANGE_TYPES: ChangeType[] = ['feature', 'improvement', 'fix']

export const CHANGE_TYPE_LABEL: Record<ChangeType, string> = {
  feature: 'New',
  improvement: 'Improved',
  fix: 'Fixed',
}
