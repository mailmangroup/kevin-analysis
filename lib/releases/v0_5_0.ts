import { Release } from './types'

export const v0_5_0: Release = {
  version: 'v0.5.0',
  date: '2025-10-19',
  name: 'Structured Content & Automation',
  summary:
    'A cleaner way to present answers, a two-step quality check on content, and daily analysis automation.',
  changes: [
    {
      title: 'Structured Rendering System',
      description:
        'Introduced the artifact system for frontend display, providing structured and organized content rendering instantly and presentation capabilities.',
      type: 'feature',
      scope: 'Kevin Chat',
      example: 'Video analysis now shows a rich snippet with video details directly inline, rather than plain text output.',
    },
    {
      title: 'Two-step content editing process',
      description:
        'Content now goes through a two-step editing process before you see it, improving quality control and how accurately it follows your instructions.',
      type: 'improvement',
      scope: 'Content Generation',
    },
    {
      title: 'Chinese link support for media',
      description:
        'Image and video analysis now works with Chinese links.',
      type: 'fix',
      scope: 'Video',
      example: 'Paste a Xiaohongshu video link with Chinese characters and Kevin can analyze it directly.',
    },
    {
      title: 'Avoiding garbled, off-topic replies',
      description:
        'Large tool results are now paginated before being passed to the model, preventing context overflow that caused Kevin to ramble, output nonsense, or reply with broken formatting.',
      type: 'fix',
      scope: 'Kevin Chat',
    },
    {
      title: 'Daily analysis automation',
      description: "Kevin Analysis can now automatically run a full analysis report for the previous day with a single command — no manual setup needed each morning.",
      type: 'feature',
      scope: 'Ops & Analytics',
      example: "Run the daily script and Kevin generates yesterday's performance breakdown across all accounts, ready to review.",
    },
    {
      title: 'Consistent platform naming',
      description: 'Renamed "RED" to "Xiaohongshu" across the app for consistency.',
      type: 'improvement',
      scope: 'AI Report',
    },
  ],
}
