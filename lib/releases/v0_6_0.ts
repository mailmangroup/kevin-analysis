import { Release } from './types'

export const v0_6_0: Release = {
  version: 'v0.6.0',
  date: '2025-12-10',
  name: 'Intelligence Upgrade',
  summary:
    'Kevin gains multi-video competitor analysis and adds retention tracking.',
  changes: [
    {
      title: 'Multi-video competitor analysis',
      description: 'Added the ability to analyze and compare several competitor videos at once.',
      type: 'feature',
      scope: 'Analysis Service',
      example: 'Compare a batch of competitor videos in one go instead of one at a time.',
    },
    {
      title: 'Video usage tracking',
      description: 'Added tracking for how video analysis is being used.',
      type: 'feature',
      scope: 'Ops & Analytics',
    },
    {
      title: 'Retention analysis',
      description: 'New retention analysis to see how users keep coming back over time.',
      type: 'feature',
      scope: 'Ops & Analytics',
    },
    {
      title: 'Higher content generation quality',
      description: 'Extensive prompt improvements lifted content generation quality across content types.',
      type: 'improvement',
      scope: 'Content Generation',
    },
    {
      title: 'WeChat article fix',
      description: 'Resolved problems processing WeChat articles.',
      type: 'fix',
      scope: 'Kevin Chat',
    },
  ],
}
