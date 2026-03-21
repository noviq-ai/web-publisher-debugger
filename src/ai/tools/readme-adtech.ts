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
          description: 'Lightweight snapshot of Prebid.js data on the current page.',
          parameters: 'none',
          returns: 'Detected bidders, ad unit codes, auction count, module count, S2S/consent/userId flags',
          whenToUse: 'First call when the user asks anything AdTech-related. Use to decide which deeper tool to call.',
        },
        {
          name: 'getAdtechData',
          description: 'Full Prebid.js data for the current page.',
          parameters: [
            { name: 'includeAuctions', type: 'boolean', default: true, description: 'Include auction results' },
            { name: 'includeBidderDetails', type: 'boolean', default: true, description: 'Include per-bidder stats' },
            { name: 'includeConfig', type: 'boolean', default: true, description: 'Include Prebid config' },
            { name: 'auctionLimit', type: 'number', default: 10, description: 'Max auctions to return' },
          ],
          returns: 'Prebid config, bidders, ad units, auctions, winning bids, targeting, user IDs',
          whenToUse: 'When the user wants a full picture of the header bidding setup.',
        },
        {
          name: 'diagnoseBidder',
          description: 'Diagnose a specific bidder\'s live performance.',
          parameters: [
            { name: 'bidderCode', type: 'string', description: 'Bidder code e.g. "appnexus", "rubicon"' },
          ],
          returns: 'Bid rate, timeout rate, win rate, avg CPM, response time, identified issues',
          whenToUse: 'When the user says a specific bidder is slow, not responding, or underperforming.',
        },
        {
          name: 'analyzeAdUnit',
          description: 'Analyze a specific ad unit in real-time.',
          parameters: [
            { name: 'adUnitCode', type: 'string', description: 'Ad unit code e.g. "div-gpt-ad-12345"' },
          ],
          returns: 'Configured bidders, bid responses, no-bids, highest bid, winner',
          whenToUse: 'When the user wants to debug a specific ad slot.',
        },
        {
          name: 'queryPrebidEvents',
          description: 'Query the Prebid event history.',
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
