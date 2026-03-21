import { tool } from 'ai'
import { z } from 'zod'

export function createTrackingReadmeTool() {
  return tool({
    description:
      'Returns a description of all Tracking-related tools available (GTM, GA4, pixels) — what each tool does, its parameters, and when to use it. Call this when you are unsure which tracking tool to use.',
    inputSchema: z.object({}),
    execute: async () => ({
      group: 'Tracking',
      tools: [
        {
          name: 'getTrackingOverview',
          description: 'Lightweight snapshot of all tracking implementations on the current page.',
          parameters: 'none',
          returns: 'GTM container ID + event count, GA4 measurement ID + event count, detected pixels list',
          whenToUse: 'First call when the user asks broadly about tracking. Use to decide which deeper tool to call.',
        },
        {
          name: 'getGtmData',
          description: 'Full Google Tag Manager data for the current page.',
          parameters: [
            { name: 'limit', type: 'number', description: 'Max dataLayer events to return' },
            { name: 'eventFilter', type: 'string', optional: true, description: 'Filter events by name' },
          ],
          returns: 'Container info, dataLayer events, fired tags, variables',
          whenToUse: 'When the user wants to inspect GTM setup, dataLayer events, or fired tags.',
        },
        {
          name: 'getGa4Data',
          description: 'Full GA4 (Google Analytics 4) data for the current page.',
          parameters: [
            { name: 'limit', type: 'number', description: 'Max events to return' },
            { name: 'eventFilter', type: 'string', optional: true, description: 'Filter events by name' },
            { name: 'includeConsent', type: 'boolean', default: true, description: 'Include consent status' },
            { name: 'includeConfigs', type: 'boolean', default: true, description: 'Include GA4 config calls' },
          ],
          returns: 'Measurement ID, events, consent status, configurations',
          whenToUse: 'When the user wants to inspect GA4 events, consent, or configuration.',
        },
        {
          name: 'getPixelData',
          description: 'Full marketing pixel data for the current page.',
          parameters: [
            { name: 'platform', type: 'string', description: 'facebook | twitter | tiktok | linkedin | pinterest | criteo | snapchat | all' },
            { name: 'limit', type: 'number', description: 'Max events to return' },
          ],
          returns: 'Pixel IDs, events per platform',
          whenToUse: 'When the user wants to inspect a specific marketing pixel or all pixels.',
        },
      ],
    }),
  })
}
