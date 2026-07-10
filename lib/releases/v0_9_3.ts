import { Release } from './types'

export const v0_9_3: Release = {
  version: 'v0.9.3',
  date: '2026-07-10',
  name: 'Batch Video & Stronger Reports',
  summary:
    'Batch video compliance analysis, more reliable competitor reports, richer competitor group reports, and TikTok/Douyin title support — covering everything since v0.8.9.',
  changes: [
    {
      title: 'Batch video compliance analysis',
      description:
        'New batch workflow to audit videos for compliance at scale, with automatic model fallback and clearer violation flags when something needs review.',
      type: 'feature',
      scope: 'Video',
      frontendEnabled: false,
    },
    {
      title: 'More reliable competitor reports',
      description:
        'Competitor report insight generation now retries on timeouts, tracks generation status and errors, and uses clearer cadence language — so reports finish more consistently and read more naturally.',
      type: 'improvement',
      scope: 'AI Report',
    },
    {
      title: 'Richer competitor group reports',
      description:
        'Competitor group reports now support multi-list stats and account data merging, making it easier to pull a complete competitor picture across lists and accounts.',
      type: 'improvement',
      scope: 'AI Report',
    },
    {
      title: 'Titles for TikTok and Douyin content',
      description:
        'Content generation now supports title fields for TikTok and Douyin, so drafts match how those platforms present posts.',
      type: 'feature',
      scope: 'Content Generation',
    },
    {
      title: 'MCP server support',
      description:
        'Kevin can now expose capabilities through an MCP server for integrations and tooling.',
      type: 'feature',
      scope: 'Ops & Analytics',
      frontendEnabled: false,
    },
    {
      title: 'GEO reports in ops monitoring',
      description:
        'Internal Phoenix monitoring can now pull GEO report data for better visibility into that pipeline.',
      type: 'improvement',
      scope: 'Ops & Analytics',
      frontendEnabled: false,
    },
  ],
}
