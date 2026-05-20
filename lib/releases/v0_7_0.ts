import { Release } from './types'

export const v0_7_0: Release = {
  version: 'v0.7.0',
  date: '2026-02-13',
  name: 'Smarter Data Analysis',
  summary:
    'Kevin can now analyze datasets directly with SQL tools and generate competitor group reports.',
  changes: [
    {
      title: 'Direct data analysis (SQL)',
      description:
        'Kevin can now query datasets directly to perform smarter, proactive data analysis.',
      type: 'feature',
      scope: 'Kevin Chat',
      frontendEnabled: false,
      example:
        'Ask "which platform drove the most engagement last month?" and Kevin works it out from the underlying data using SQL queries for faster results and better accuracy.',
    },
    {
      title: 'Competitor group reports',
      description: 'A new report feature to generate reports on the competitive landscape.',
      type: 'feature',
      scope: 'AI Report'
    },
    {
      title: 'Help Center focused chat',
      description:
        'Added one-click "fast paths" for the Help Center.',
      type: 'feature',
      scope: 'Kevin Chat',
      frontendEnabled: false,
    },
    {
      title: 'User & project memory (preview)',
      description:
        'Giving Kevin memory of users and projects. Three tiers with both long-term and short-term memory.',
      type: 'feature',
      scope: 'Kevin Chat',
      frontendEnabled: false,
    },
    {
      title: 'Stricter, safer inputs',
      description:
        'Added stricter validation for brand and organization inputs, and clearer error messages when content moderation is triggered.',
      type: 'improvement',
      scope: 'Kevin Chat',
    },
    {
      title: 'More detailed usage tracking',
      description:
        'The Kevin usage dashboard now shows more granular usage info, and cost tracking accounts for "thinking" tokens.',
      type: 'improvement',
      scope: 'Ops & Analytics',
    },
    {
      title: 'Document chat in the test frontend',
      description:
        'Enabled full document processing, project context, and updated guidance for chatting with images and documents.',
      type: 'improvement',
      scope: 'Kevin Chat',
      frontendEnabled: false,
    },
    {
      title: 'Paginated post-tags API',
      description: 'Added pagination support to the post-tags endpoint.',
      type: 'improvement',
      scope: 'Kevin Chat',
    },
  ],
}
