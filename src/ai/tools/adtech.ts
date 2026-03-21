const DEBUG = false
function log(...args: unknown[]) { if (DEBUG) log(...args) }

import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'

export function createAdtechTool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get Prebid.js AdTech data including configuration, bidders, ad units, and auction results. Use this to analyze header bidding implementation.',
    inputSchema: z.object({
      includeAuctions: z
        .boolean()
        .default(true)
        .describe('Include auction results (default: true)'),
      includeBidderDetails: z
        .boolean()
        .default(true)
        .describe('Include bidder performance details (default: true)'),
      includeConfig: z
        .boolean()
        .default(true)
        .describe('Include Prebid configuration (default: true)'),
      auctionLimit: z
        .number()
        .default(10)
        .describe('Maximum number of auctions to return (default: 10)'),
    }),
    execute: async ({ includeAuctions, includeBidderDetails, includeConfig, auctionLimit }) => {
      log('[Tool:get_adtech_data] Called with:', {
        includeAuctions,
        includeBidderDetails,
        includeConfig,
        auctionLimit,
      })

      if (!permissions.allowAdTech) {
        return { error: 'Access to AdTech data not permitted by user' }
      }

      const { prebidData } = context

      if (!prebidData || !prebidData.detected) {
        return {
          detected: false,
          message: 'Prebid.js not detected on this page',
        }
      }

      const result: Record<string, unknown> = {
        detected: true,
        version: prebidData.version,
        installedModules: prebidData.installedModules,
        adUnits: prebidData.adUnits,
        winningBids: prebidData.winningBids,
        prebidWinningBids: prebidData.prebidWinningBids,
      }

      if (includeConfig) {
        result.config = prebidData.config
        result.userIds = prebidData.userIds
        result.consentMetadata = prebidData.consentMetadata
        result.aliasRegistry = prebidData.aliasRegistry
        result.bidderSettings = prebidData.bidderSettings
      }

      if (includeBidderDetails) {
        result.bidders = prebidData.bidders
      }

      if (includeAuctions) {
        result.auctions = prebidData.auctions.slice(-auctionLimit)
        result.totalAuctionCount = prebidData.auctions.length
        result.returnedAuctionCount = Math.min(prebidData.auctions.length, auctionLimit)
      }

      log('[Tool:get_adtech_data] Result:', {
        ...result,
        auctions: includeAuctions ? `[${result.returnedAuctionCount} auctions]` : undefined,
        installedModules: `[${prebidData.installedModules.length} modules]`,
      })

      return result
    },
  })
}
