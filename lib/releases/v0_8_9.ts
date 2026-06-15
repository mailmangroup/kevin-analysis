import { Release } from './types'

export const v0_8_9: Release = {
  version: 'v0.8.9',
  date: '2026-06-15',
  name: 'Smarter Analysis & Reports',
  summary:
    'Deeper AI report insights, a round of comment-analysis improvements, qwen3.6 models, and clearer ops analytics.',
  changes: [
    {
      title: 'Smarter AI report insights',
      description:
        'Reports now support a thinking mode for deeper insight generation and guide the AI to highlight period-over-period changes, making trends easier to act on.',
      type: 'feature',
      scope: 'AI Report',
    },
    {
      title: 'Removed WeChat-specific brand report overview',
      description:
        'Removed WeChat-specific overview tiles so brand reports focus on cross-platform metrics instead of one-off sections.',
      type: 'fix',
      scope: 'AI Report',
    },
    {
      title: 'Sharper comment analysis',
      description:
        'Topic merging is more reliable across large batches, cluster caps are configurable, catch-all buckets are handled correctly, and ranking now uses pure engagement. Language and schema output are also more consistent.',
      type: 'improvement',
      scope: 'Analysis Service',
    },
    {
      title: 'Resumable content-analysis pipeline',
      description:
        'Content analysis can now resume from schema, tagging, personas, or insights using artifacts from a prior run — useful for iterating without starting over.',
      type: 'feature',
      scope: 'Analysis Service',
      frontendEnabled: false,
    },
    {
      title: 'Richer tag and competitor analysis',
      description:
        'Tag analysis shows custom metrics by name instead of opaque keys, calculates engagement automatically, and competitor brand suggestions are more reliable when responses are malformed.',
      type: 'improvement',
      scope: 'Analysis Service',
    },
    {
      title: 'Stable image context in chat',
      description:
        'Image attachments in chat now use cached signed URLs that refresh automatically, so images stay available across longer conversations.',
      type: 'improvement',
      scope: 'Kevin Chat',
      frontendEnabled: false,
    },
    {
      title: 'Upgraded to qwen3.6 models',
      description:
        'Default models and pricing moved to the qwen3.6 family for better quality across chat, analysis, and reports.',
      type: 'improvement',
      scope: 'Kevin Chat',
    },
    {
      title: 'Clearer ops analytics',
      description:
        'Internal monitoring now separates user cancellations from real failures and focuses chat QA analysis on tool usage and answer quality.',
      type: 'improvement',
      scope: 'Ops & Analytics'
    },
  ],
}
