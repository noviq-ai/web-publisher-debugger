import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'

export function createPrebidAdUnitsTool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get Prebid.js ad units, winning bids, Prebid winning bids, and ad server targeting data.',
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
        adUnits: prebidData.adUnits,
        winningBids: prebidData.winningBids,
        prebidWinningBids: prebidData.prebidWinningBids,
        adserverTargeting: prebidData.adserverTargeting,
      }
    },
  })
}
