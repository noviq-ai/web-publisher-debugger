import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'

export function createAdtechOverviewTool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get a lightweight overview of AdTech (Prebid.js) data available for the current page. Use this before getAdtechData to understand what is present (bidders, ad units, auctions) without fetching full details.',
    inputSchema: z.object({}),
    execute: async () => {
      if (!permissions.allowAdTech) {
        return { error: 'Access to AdTech data not permitted by user' }
      }

      const { prebidData, gptData } = context

      const prebid = prebidData?.detected ? {
        detected: true,
        version: prebidData.version,
        bidderCount: prebidData.bidders.length,
        bidders: prebidData.bidders.map((b) => b.code),
        adUnitCount: prebidData.adUnits.length,
        adUnits: prebidData.adUnits.map((u) => u.code),
        auctionCount: prebidData.auctions.length,
        winningBidCount: prebidData.winningBids.length,
        hasS2S: prebidData.config.s2sConfig !== null,
        hasConsent: prebidData.config.consentManagement,
        hasUserIds: prebidData.userIds !== null,
        installedModuleCount: prebidData.installedModules.length,
      } : { detected: false }

      const gpt = gptData?.detected ? {
        detected: true,
        version: gptData.version,
        slotCount: gptData.slots.length,
        slots: gptData.slots.map((s) => s.slotElementId),
        eventCount: gptData.events.length,
        config: gptData.config,
      } : { detected: false }

      if (!prebidData?.detected && !gptData?.detected) {
        return { detected: false, message: 'Neither Prebid.js nor GPT detected on this page' }
      }

      return {
        detected: true,
        prebid,
        gpt,
      }
    },
  })
}
