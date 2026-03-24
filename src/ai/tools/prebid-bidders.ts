import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'

export function createPrebidBiddersTool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get Prebid.js bidder statistics: bid count, win count, average CPM, response time, and timeout count per bidder.',
    inputSchema: z.object({}),
    execute: async () => {
      if (!permissions.allowAdTech) {
        return { error: 'Access to AdTech data not permitted by user' }
      }

      const { prebidData } = context

      if (!prebidData || !prebidData.detected) {
        return { detected: false, message: 'Prebid.js not detected on this page' }
      }

      return {
        detected: true,
        bidderCount: prebidData.bidders.length,
        bidders: prebidData.bidders,
      }
    },
  })
}
