import { Release } from './types'

export const v0_7_2: Release = {
  version: 'v0.7.2',
  date: '2026-03-17',
  name: 'Deep Research & Comments',
  summary:
    'A new multi-step "deep agent", group-level competitor reports, and a dedicated comment analysis service.',
  changes: [
    {
      title: 'Deep research agent',
      description:
        'Kevin can now run multi-step "deep research" by orchestrating several specialized agents in a secure sandbox.',
      type: 'feature',
      scope: 'Claw',
      frontendEnabled: false,
      example:
        'For a big question like "how is our category trending?", Kevin breaks it into sub-tasks and researches each before summarizing.',
    },
    {
      title: 'Group-level competitor reports',
      description:
        'Competitor reports now include group-level insights and an improved competitor-group report.',
      type: 'feature',
      scope: 'AI Report'
    },
    {
      title: 'Comment analysis service',
      description: 'Added a dedicated service for analyzing comments on posts.',
      type: 'feature',
      scope: 'Analysis Service',
    },
    {
      title: 'Editable report insights',
      description: 'Report insights can now be edited after they’re generated.',
      type: 'feature',
      scope: 'AI Report',
    },
    {
      title: 'Better conversation management',
      description:
        'Conversations gained permanent delete, removed limits on document uploads, and automatically attach documents shared at the start of a chat.',
      type: 'improvement',
      scope: 'Kevin Chat',
    },
    {
      title: 'Tag analysis',
      description:
        'New tag analysis with data-driven prompts that surface insights from your post tags.',
      type: 'feature',
      scope: 'Analysis Service',
    },
    {
      title: 'Smoother streaming replies',
      description: 'Kevin’s responses now stream sentence-by-sentence for a more natural feel.',
      type: 'improvement',
      scope: 'Kevin Chat',
    },
    {
      title: 'Report accuracy fixes',
      description:
        'Fixed report timezone handling (now Beijing time), date-offset issues, and warnings for missing values.',
      type: 'fix',
      scope: 'AI Report',
    },
    {
      title: 'Faster conversation loading',
      description: 'Improved database indexing to speed up conversation-related requests.',
      type: 'fix',
      scope: 'Kevin Chat',
    },
  ],
}
