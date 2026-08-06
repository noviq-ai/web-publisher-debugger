import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'
import type { PrebidData } from '@/shared/types/prebid'
import type { GptData } from '@/shared/types/gpt'
import { countOccurrences } from '@/shared/lib/utils'

export function buildAdtechOverview(prebidData: PrebidData | null, gptData: GptData | null) {
  const prebid = prebidData?.detected ? {
    detected: true,
    version: prebidData.version,
    config: {
      timeout: prebidData.config.timeout,
      priceGranularity: prebidData.config.priceGranularity,
      debug: prebidData.config.debug,
      useBidCache: prebidData.config.useBidCache,
      deviceAccess: prebidData.config.deviceAccess,
      consentManagement: prebidData.config.consentManagement,
      userSyncEnabled: prebidData.config.userSync?.enabled ?? false,
      s2sEnabled: prebidData.config.s2sConfig?.enabled ?? false,
    },
    bidders: prebidData.bidders,
    adUnits: prebidData.adUnits.map(({ code, mediaTypes, sizes, bidders }) => ({ code, mediaTypes, sizes, bidders })),
    auctionCount: prebidData.auctions.length,
    timedOutAuctionCount: prebidData.auctions.filter(({ timeout }) => timeout).length,
    winningBids: prebidData.winningBids.map(({ adUnitCode, bidder, cpm, currency, timeToRespond }) => ({ adUnitCode, bidder, cpm, currency, timeToRespond })),
    eventCounts: countOccurrences(prebidData.events.map(({ eventType }) => eventType)),
    installedModules: prebidData.installedModules,
    hasUserIds: prebidData.userIds !== null,
    hasConsentMetadata: prebidData.consentMetadata !== null,
  } : { detected: false }

  const gpt = gptData?.detected ? {
    detected: true,
    version: gptData.version,
    config: gptData.config,
    slotCount: gptData.slots.length,
    renderedSlotCount: gptData.slots.filter(({ renderInfo }) => renderInfo && !renderInfo.isEmpty).length,
    emptySlotCount: gptData.slots.filter(({ renderInfo }) => renderInfo?.isEmpty).length,
    pendingSlotCount: gptData.slots.filter(({ renderInfo }) => renderInfo === null).length,
    slots: gptData.slots.map(({ slotElementId, adUnitPath, sizes, renderInfo }) => ({ slotElementId, adUnitPath, sizes, renderInfo })),
    pageTargetingKeys: Object.keys(gptData.pageTargeting),
    eventCounts: countOccurrences(gptData.events.map(({ eventType }) => eventType)),
  } : { detected: false }

  return { detected: prebid.detected || gpt.detected, prebid, gpt }
}

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

      if (!prebidData?.detected && !gptData?.detected) {
        return { detected: false, message: 'Neither Prebid.js nor GPT detected on this page' }
      }
      return buildAdtechOverview(prebidData, gptData)
    },
  })
}
