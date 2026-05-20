import { Release } from './types'

export const v0_5_7: Release = {
  version: 'v0.5.7',
  date: '2025-11-15',
  name: 'Faster Video Analysis',
  summary:
    'A fast path for instant brand and competitor video analysis, plus deeper quality tracking.',
  changes: [
    {
      title: 'Automatic video analysis from links',
      description:
        'Kevin now auto-detects video links you share and jumps straight into analysis — no need to hunt through unrelated tools.',
      type: 'feature',
      scope: 'Video',
      example: 'Paste a video link and Kevin recognizes it instantly and delivers insights on that clip.',
    },
    {
      title: 'Conversation tracking & quality checks',
      description:
        'Added behind-the-scenes tracking of conversations, better cost monitoring, and automatic quality evaluation of Kevin’s answers.',
      type: 'feature',
      scope: 'Ops & Analytics',
    },
    {
      title: 'Higher-quality video insights',
      description: 'Improved the prompts behind video analysis to deliver better insights.',
      type: 'improvement',
      scope: 'Video',
    },
    {
      title: 'More stable evaluation',
      description: 'Strengthened the evaluation framework for more stable, accurate results.',
      type: 'improvement',
      scope: 'Ops & Analytics',
    },
    {
      title: 'Content generation fix',
      description: 'Resolved issues affecting content generation workflows.',
      type: 'fix',
      scope: 'Content Generation',
    },
  ],
}
