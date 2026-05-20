import { Release } from './types'

export const v0_7_7: Release = {
  version: 'v0.7.7',
  date: '2026-04-24',
  name: 'Kevin\s Claw',
  summary:
    'Kevin moves to a flexible Skills system, gains Office document creation, and sharpens competitor (SOV) analysis.',
  changes: [
    {
      title: 'Skills system for Kevin',
      description:
        'Replaced fixed brand tools with a flexible "skills" architecture, so Kevin can mix and match capabilities.',
      type: 'feature',
      scope: 'Kevin Chat',
      example:
        'Kevin can be smarter on following user requests.',
    },
    {
      title: 'Office file creation (Kevin’s Claw)',
      description:
        'Kevin’s Claw can now generate PowerPoint decks, and create and validate Word and Excel files.',
      type: 'feature',
      scope: 'Claw',
      frontendEnabled: false,
      example:
        'Ask for a competitor summary and get a ready-to-share PowerPoint instead of copy-pasting into slides yourself.',
    },
    {
      title: 'share-of-voice analysis',
      description:
        'SOV analysis delivers 13 insights per keyword plus 3 cross-keyword comparisons, broken down by platform and date.',
      type: 'feature',
      scope: 'Analysis Service'
    },
    {
      title: 'Kevin’s Claw experience upgrades',
      description:
        'Smoother streaming, your work is saved if you stop midway, better document handling, and automatic to-do tracking inside conversations.',
      type: 'improvement',
      scope: 'Claw',
      frontendEnabled: false,
    },
    {
      title: 'Longer-lasting brand voice',
      description:
        'Brand voice is now remembered for 2 hours instead of 30 minutes, so content stays on-brand across a longer working session.',
      type: 'improvement',
      scope: 'Content Generation',
    },
    {
      title: 'Tag analysis for brands and competitors',
      description:
        'Tag analysis now covers both your brand and competitors using the metrics you’ve already selected.',
      type: 'improvement',
      scope: 'Analysis Service',
    },
    {
      title: 'Long video analysis',
      description:
        'Video analysis now runs in the background with status updates, handles longer videos, and matches links more reliably.',
      type: 'improvement',
      scope: 'Video'
    },
    {
      title: 'Updated WeChat metrics',
      description: 'WeChat analytics now uses the latest set of metric fields.',
      type: 'improvement',
      scope: 'Kevin Chat',
    },
    {
      title: 'Newer language model',
      description: 'Upgraded the underlying model from qwen3.5-plus to qwen3.6-plus for better answers.',
      type: 'improvement',
      scope: 'Kevin Chat',
    },
    {
      title: 'Thinking-mode and caching fixes',
      description:
        'Fixed message-parsing issues in thinking mode and a caching race condition that could cause inconsistent results.',
      type: 'fix',
      scope: 'Kevin Chat',
    },
    {
      title: 'Comment analysis batch mode',
      description: 'Comment analysis now supports batch mode to analyze across multiple posts.',
      type: 'improvement',
      scope: 'Analysis Service',
    },
    {
      title: 'Storage and topics reliability fixes',
      description: 'Fixed a file-storage handling issue and a timeout in the topics service.',
      type: 'fix',
      scope: 'Claw',
      frontendEnabled: false,
    },
    {
      title: 'Leaner system images',
      description: 'System images have been optimized to be lighter and more efficient, reducing deployment size and startup time.',
      type: 'improvement',
      scope: 'Ops & Analytics'
    },
  ],
}
