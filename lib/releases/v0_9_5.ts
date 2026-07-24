import { Release } from './types'

export const v0_9_5: Release = {
  version: 'v0.9.5',
  date: '2026-07-24',
  name: 'AI Tagging Onboarding & Batch Video',
  summary:
    'AI tagging onboarding readiness, saved batch-video audit preferences, own-brand comment search, and clearer competitor targeting — covering everything since v0.9.3.',
  changes: [
    {
      title: 'AI tagging onboarding readiness',
      description:
        'New readiness pipeline guides brands through AI tagging setup — sample tagging, discrepancy review, and a synthesized readiness report — with saved preferences and retryable async jobs.',
      type: 'feature',
      scope: 'Analysis Service',
      frontendEnabled: false,
    },
    {
      title: 'Saved batch-video audit preferences',
      description:
        'Batch video compliance audits can now remember per-user targets, categories, judgment rules, and synthesis prompts, with thinking mode, more resilient timeouts, and clearer report sections.',
      type: 'feature',
      scope: 'Analysis Service',
      frontendEnabled: false,
    },
    {
      title: 'Own-brand post comment search',
      description:
        'In chat, search comments on your own published posts with destination resolution and pagination, making it easier to dig into audience feedback on live content.',
      type: 'feature',
      scope: 'Kevin Chat',
    },
    {
      title: 'Clearer competitor targeting in brand analysis',
      description:
        'In chat, brand analysis can now resolve competitor list IDs per network via competitor groups — or omit them to include all competitors — for more precise competitive views.',
      type: 'improvement',
      scope: 'Kevin Chat',
    },
    {
      title: 'Clearer SOV job failure status',
      description:
        'Share-of-voice jobs that expire or disappear while polling now return a clear terminal error instead of hanging in an uncertain state.',
      type: 'fix',
      scope: 'Analysis Service',
    },
    {
      title: 'Fixed WeChat article performance sorting',
      description:
        'WeChat article performance sorting works correctly again, and invalid metrics are rejected with date-aware guidance so reports stay trustworthy.',
      type: 'fix',
      scope: 'Analysis Service',
    },
    {
      title: 'Vision-based AI tag evaluation',
      description:
        'Internal tooling can now evaluate AI tags with vision models, run benchmarks with experiment caching, and review errors on a dedicated dashboard.',
      type: 'improvement',
      scope: 'Ops & Analytics',
    },
    {
      title: 'More reliable Phoenix daily sync',
      description:
        'Internal Phoenix analytics ETL is now idempotent via sync-state watermarks, so daily Mongo loads stay consistent on retries.',
      type: 'improvement',
      scope: 'Ops & Analytics',
    },
  ],
}
