import { Release } from './types'

export const v0_8_3: Release = {
  version: 'v0.8.3',
  date: '2026-05-20',
  name: 'Deeper Analysis',
  summary:
    'Sharper SOV peak insights, richer comment analysis with persona handling, competitor tag search, and a new report export endpoint.',
  changes: [
    {
      title: 'SOV analysis: tighter peak date range',
      description:
        'Peak analysis now zooms into the exact day of a spike instead of a wider window, giving more accurate context and correctly sourced peak insights.',
      type: 'improvement',
      scope: 'Analysis Service',
    },
    {
      title: 'Comment analysis pipeline for small volumes',
      description:
        'A new lightweight pipeline handles small-volume comment batches end-to-end, keeping results fast without running the full large-volume flow.',
      type: 'improvement',
      scope: 'Analysis Service',
    },
    {
      title: 'Tag analysis: competitor tag stats search',
      description:
        'Tag analysis now supports searching competitor tag statistics directly, making it easier to benchmark tag performance against rivals.',
      type: 'improvement',
      scope: 'Analysis Service',
    },
    {
      title: 'SOV precomputed daily totals',
      description:
        'Daily totals are now precomputed and embedded in trend and peak data passed to the LLM, reducing prompt size and improving insight quality.',
      type: 'improvement',
      scope: 'Analysis Service',
    },
    {
      title: 'Comment analysis: unassigned persona group',
      description:
        'Comments that don\'t match any persona are now grouped under an "unassigned" category so all topics are preserved in the output. Persona generation also retries automatically on failure.',
      type: 'improvement',
      scope: 'Analysis Service',
    },
    {
      title: 'Comment analysis: improved schema and insight prompts',
      description:
        'Overhauled the output schema and insight-generating prompts for more consistent, well-formatted, language-appropriate results.',
      type: 'improvement',
      scope: 'Analysis Service',
    },
    {
      title: 'AI report export endpoint',
      description:
        'Added a backend endpoint to export AI reports. Frontend integration is not yet live.',
      type: 'feature',
      scope: 'AI Report',
      frontendEnabled: false,
    }
  ],
}
