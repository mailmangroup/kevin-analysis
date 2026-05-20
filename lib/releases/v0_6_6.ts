import { Release } from './types'

export const v0_6_6: Release = {
  version: 'v0.6.6',
  date: '2026-01-20',
  name: 'Major Backend Upgrades',
  summary:
    'A re-engineered core lets Kevin think more deliberately and chat about images, plus a new usage dashboard and HubSpot leads.',
  changes: [
    {
      title: 'Re-engineered core engine',
      description:
        'Moved Kevin onto a new framework (LangGraph) so it can handle complex workflows and pick tools more intelligently.',
      type: 'feature',
      scope: 'Kevin Chat',
    },
    {
      title: 'Thinking mode',
      description: 'Kevin can now reason more deliberately through harder problems before answering.',
      type: 'feature',
      scope: 'Kevin Chat',
      example:
        'For a nuanced strategy question, Kevin works through the reasoning step-by-step rather than answering off the cuff.',
    },
    {
      title: 'Chat with images',
      description:
        'Kevin can now understand images in a conversation, laying the groundwork for visual analysis.',
      type: 'feature',
      scope: 'Kevin Chat',
      frontendEnabled: false,
      example: 'Drop in a screenshot of a post and ask Kevin what stands out about it.',
    },
    {
      title: 'Kevin usage analytics & dashboard (this website)',
      description:
        'Launched detailed usage analytics with a WeCom alert and this dedicated dashboard for monitoring performance and engagement.',
      type: 'feature',
      scope: 'Ops & Analytics',
    },
    {
      title: 'HubSpot CRM integration',
      description: 'The Hi-Kevin website can now pull leads directly from HubSpot.',
      type: 'feature',
      scope: 'Ops & Analytics',
      example: 'Fetch your HubSpot leads inside Hi-Kevin without manual exports.',
    },
    {
      title: 'Natural video follow-ups',
      description:
        'You can now ask conversational follow-up questions about a video analysis and Kevin keeps the context.',
      type: 'improvement',
      scope: 'Video',
      example: 'After Kevin analyzes a video, ask "what about audience reactions?" and it continues seamlessly.',
    },
    {
      title: 'Smarter data search',
      description:
        'Improved Kevin\'s search tools so it finds and pulls the right data more accurately, with faster post search and added safeguards on multi-platform requests.',
      type: 'improvement',
      scope: 'Kevin Chat',
    },
    {
      title: 'Competitor tools fix',
      description: 'Resolved issues with Kevin\'s competitor analysis tools.',
      type: 'fix',
      scope: 'Kevin Chat',
    },
    {
      title: 'Report export language fix',
      description: 'Fixed brand names showing in the wrong language in exported reports.',
      type: 'fix',
      scope: 'AI Report',
    },
  ],
}
