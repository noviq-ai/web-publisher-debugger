import { tool } from 'ai'
import { z } from 'zod'

export function createAdtechReadmeTool() {
  return tool({
    description:
      'Returns a description of all AdTech-related tools available — what each tool does, its parameters, and when to use it. Call this when you are unsure which AdTech tool to use.',
    inputSchema: z.object({}),
    execute: async () => ({
      group: 'AdTech',
      tools: [
        {
          name: 'getAdtechOverview',
          description: 'Lightweight snapshot of Prebid.js + GPT data on the current page.',
          parameters: 'none',
          returns: 'Prebid: bidders, ad units, auction count, flags. GPT: slots, config.',
          whenToUse: 'First call when the user asks anything AdTech-related. Use to decide which deeper tool to call.',
        },
        {
          name: 'getPrebidConfig',
          description: 'Prebid.js configuration details.',
          parameters: 'none',
          returns: 'Timeout, modules, user IDs, consent, S2S settings, alias registry, bidder settings',
          whenToUse: 'When the user asks about Prebid setup, modules, consent, or user ID configuration.',
        },
        {
          name: 'getPrebidBidders',
          description: 'Prebid.js bidder performance statistics.',
          parameters: 'none',
          returns: 'Bid count, win count, average CPM, response time, timeout count per bidder',
          whenToUse: 'When the user asks about bidder performance or wants to compare bidders.',
        },
        {
          name: 'getPrebidAdUnits',
          description: 'Prebid.js ad units and winning bids.',
          parameters: 'none',
          returns: 'Ad units, winning bids, Prebid winning bids, ad server targeting',
          whenToUse: 'When the user asks about ad units, winning bids, or targeting.',
        },
        {
          name: 'getGptSlots',
          description: 'Google Publisher Tag (GPT / Google Ad Manager) slot data.',
          parameters: 'none',
          returns: 'Slot configuration, page targeting, render status, ad delivery info',
          whenToUse: 'When the user asks about GPT/GAM slots, ad rendering, or targeting.',
        },
        {
          name: 'diagnoseBidder',
          description: 'Diagnose a specific bidder\'s live performance (dynamic query).',
          parameters: [
            { name: 'bidderCode', type: 'string', description: 'Bidder code e.g. "appnexus", "rubicon"' },
          ],
          returns: 'Bid rate, timeout rate, win rate, avg CPM, response time, identified issues',
          whenToUse: 'When the user says a specific bidder is slow, not responding, or underperforming.',
        },
        {
          name: 'analyzeAdUnit',
          description: 'Analyze a specific ad unit in real-time (dynamic query).',
          parameters: [
            { name: 'adUnitCode', type: 'string', description: 'Ad unit code e.g. "div-gpt-ad-12345"' },
          ],
          returns: 'Configured bidders, bid responses, no-bids, highest bid, winner',
          whenToUse: 'When the user wants to debug a specific ad slot.',
        },
        {
          name: 'queryPrebidEvents',
          description: 'Query the Prebid event history (dynamic query).',
          parameters: [
            { name: 'eventType', type: 'string', optional: true, description: 'e.g. auctionInit, bidResponse, bidWon, bidTimeout' },
            { name: 'limit', type: 'number', description: 'Max events to return' },
          ],
          returns: 'Event timeline with summaries',
          whenToUse: 'When the user wants to trace the auction timeline or debug event flow.',
        },
      ],
    }),
  })
}
