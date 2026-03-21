const DEBUG = false
function log(...args: unknown[]) { if (DEBUG) log(...args) }

import { tool } from 'ai'
import { z } from 'zod'
import type { ToolPermissions } from './types'
import { MessageType, type PrebidQueryRequest, type PrebidQueryResponse } from '@/shared/types'

// Generate unique request ID
function generateRequestId(): string {
  return `prebid-query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Send query to content script via background service worker
async function sendPrebidQuery(
  queryType: PrebidQueryRequest['queryType'],
  params: Record<string, unknown>,
  tabId: number
): Promise<PrebidQueryResponse> {
  const requestId = generateRequestId()

  return new Promise((resolve) => {
    let resolved = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    // Set timeout first
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        log('[Prebid Query] Timeout for:', requestId)
        resolve({
          requestId,
          success: false,
          error: 'Query timed out after 10 seconds',
        })
      }
    }, 10000)

    chrome.runtime.sendMessage(
      {
        type: MessageType.PREBID_QUERY,
        tabId,
        payload: {
          queryType,
          params,
          requestId,
        } as PrebidQueryRequest,
      },
      (response: PrebidQueryResponse) => {
        if (resolved) return // Already timed out

        resolved = true
        if (timeoutId) clearTimeout(timeoutId)

        if (chrome.runtime.lastError) {
          console.error('[WPD] Prebid query chrome error:', chrome.runtime.lastError.message)
          resolve({
            requestId,
            success: false,
            error: chrome.runtime.lastError.message || 'Unknown error',
          })
        } else {
          log('[Prebid Query] Response received:', requestId, response?.success)
          resolve(response)
        }
      }
    )
  })
}

// Create Prebid query tools that need active tab ID
export function createPrebidQueryTools(permissions: ToolPermissions, getActiveTabId: () => number | null) {
  return {
    diagnoseBidder: createDiagnoseBidderTool(permissions, getActiveTabId),
    analyzeAdUnit: createAnalyzeAdUnitTool(permissions, getActiveTabId),
    queryPrebidEvents: createQueryPrebidEventsTool(permissions, getActiveTabId),
  }
}

function createDiagnoseBidderTool(permissions: ToolPermissions, getActiveTabId: () => number | null) {
  return tool({
    description:
      'Diagnose a specific Prebid bidder performance. Returns bid count, no-bid count, timeout count, win rate, average CPM, and response time. Use this to troubleshoot why a bidder is not responding or performing poorly.',
    inputSchema: z.object({
      bidderCode: z
        .string()
        .describe('The bidder code to diagnose (e.g., "appnexus", "rubicon", "openx")'),
    }),
    execute: async ({ bidderCode }) => {
      if (!permissions.allowAdTech) {
        return { error: 'Access to AdTech/Prebid data not permitted by user' }
      }

      const tabId = getActiveTabId()
      if (!tabId) {
        return { error: 'No active tab found. Please ensure you have a page open.' }
      }

      log('[Tool:diagnoseBidder] Diagnosing bidder:', bidderCode, 'tabId:', tabId)

      const response = await sendPrebidQuery('DIAGNOSE_BIDDER', { bidderCode }, tabId)

      if (!response.success) {
        return { error: response.error || 'Failed to diagnose bidder' }
      }

      const diagnosis = response.data as {
        bidderCode: string
        configured: boolean
        adUnitsCount: number
        bidCount: number
        noBidCount: number
        winCount: number
        timeoutCount: number
        averageCpm: number | null
        averageResponseTime: number | null
        bids: unknown[]
        noBids: unknown[]
        timeouts: unknown[]
      }

      // Calculate metrics
      const totalResponses = diagnosis.bidCount + diagnosis.noBidCount + diagnosis.timeoutCount
      const bidRate = totalResponses > 0 ? (diagnosis.bidCount / totalResponses) * 100 : null
      const timeoutRate = totalResponses > 0 ? (diagnosis.timeoutCount / totalResponses) * 100 : null
      const winRate = diagnosis.bidCount > 0 ? (diagnosis.winCount / diagnosis.bidCount) * 100 : null

      return {
        bidderCode: diagnosis.bidderCode,
        summary: {
          configured: diagnosis.configured,
          adUnitsCount: diagnosis.adUnitsCount,
          bidCount: diagnosis.bidCount,
          noBidCount: diagnosis.noBidCount,
          timeoutCount: diagnosis.timeoutCount,
          winCount: diagnosis.winCount,
        },
        metrics: {
          bidRate: bidRate !== null ? `${bidRate.toFixed(1)}%` : 'N/A',
          timeoutRate: timeoutRate !== null ? `${timeoutRate.toFixed(1)}%` : 'N/A',
          winRate: winRate !== null ? `${winRate.toFixed(1)}%` : 'N/A',
          averageCpm: diagnosis.averageCpm !== null ? `$${diagnosis.averageCpm.toFixed(2)}` : 'N/A',
          averageResponseTime:
            diagnosis.averageResponseTime !== null ? `${diagnosis.averageResponseTime.toFixed(0)}ms` : 'N/A',
        },
        issues: identifyBidderIssues(diagnosis),
        // Include sample data for detailed analysis
        sampleBids: diagnosis.bids.slice(0, 3),
        sampleNoBids: diagnosis.noBids.slice(0, 3),
        sampleTimeouts: diagnosis.timeouts.slice(0, 3),
      }
    },
  })
}

function identifyBidderIssues(diagnosis: {
  configured: boolean
  bidCount: number
  noBidCount: number
  timeoutCount: number
  averageResponseTime: number | null
}): string[] {
  const issues: string[] = []

  if (!diagnosis.configured) {
    issues.push('Bidder is not configured in any ad units')
  }

  const total = diagnosis.bidCount + diagnosis.noBidCount + diagnosis.timeoutCount
  if (total === 0) {
    issues.push('No bid requests found - auction may not have run yet')
  } else {
    if (diagnosis.timeoutCount > 0 && diagnosis.timeoutCount / total > 0.2) {
      issues.push(`High timeout rate (${((diagnosis.timeoutCount / total) * 100).toFixed(0)}%) - consider increasing bidder timeout`)
    }

    if (diagnosis.noBidCount > 0 && diagnosis.bidCount === 0) {
      issues.push('Bidder returned NO_BID for all requests - check bidder params, floor prices, or inventory eligibility')
    }

    if (diagnosis.averageResponseTime !== null && diagnosis.averageResponseTime > 500) {
      issues.push(`Slow response time (${diagnosis.averageResponseTime.toFixed(0)}ms) - may cause timeouts`)
    }
  }

  return issues
}

function createAnalyzeAdUnitTool(permissions: ToolPermissions, getActiveTabId: () => number | null) {
  return tool({
    description:
      'Analyze a specific Prebid ad unit. Returns configured bidders, media types, bid responses, no-bids, highest bid, targeting, and winner information.',
    inputSchema: z.object({
      adUnitCode: z
        .string()
        .describe('The ad unit code to analyze (e.g., "div-gpt-ad-12345", "header-banner")'),
    }),
    execute: async ({ adUnitCode }) => {
      if (!permissions.allowAdTech) {
        return { error: 'Access to AdTech/Prebid data not permitted by user' }
      }

      const tabId = getActiveTabId()
      if (!tabId) {
        return { error: 'No active tab found. Please ensure you have a page open.' }
      }

      log('[Tool:analyzeAdUnit] Analyzing ad unit:', adUnitCode, 'tabId:', tabId)

      const response = await sendPrebidQuery('ANALYZE_AD_UNIT', { adUnitCode }, tabId)

      if (!response.success) {
        return { error: response.error || 'Failed to analyze ad unit' }
      }

      const analysis = response.data as {
        adUnitCode: string
        found: boolean
        configuredBidders: string[]
        mediaTypes: unknown
        sizes: unknown
        bidResponses: unknown[]
        noBids: unknown[]
        highestBid: unknown
        targeting: unknown
        winner: unknown
      }

      if (!analysis.found) {
        return {
          adUnitCode,
          error: `Ad unit "${adUnitCode}" not found in Prebid configuration`,
          hint: 'Check if the ad unit code is correct or if the ad unit was added dynamically',
        }
      }

      // Identify which bidders responded vs didn't
      const respondedBidders = analysis.bidResponses.map((b: unknown) => (b as { bidder?: string }).bidder || 'unknown')
      const noBidBidders = analysis.noBids.map((b: unknown) => (b as { bidder?: string }).bidder || 'unknown')
      const missingBidders = analysis.configuredBidders.filter(
        (b) => !respondedBidders.includes(b) && !noBidBidders.includes(b)
      )

      return {
        adUnitCode: analysis.adUnitCode,
        configuration: {
          configuredBidders: analysis.configuredBidders,
          mediaTypes: analysis.mediaTypes,
          sizes: analysis.sizes,
        },
        auctionResults: {
          bidResponseCount: analysis.bidResponses.length,
          noBidCount: analysis.noBids.length,
          respondedBidders,
          noBidBidders,
          missingBidders: missingBidders.length > 0 ? missingBidders : null,
        },
        outcome: {
          highestBid: analysis.highestBid,
          winner: analysis.winner,
          targeting: analysis.targeting,
        },
        bidResponses: analysis.bidResponses.slice(0, 5), // Limit to 5 for brevity
      }
    },
  })
}

function createQueryPrebidEventsTool(permissions: ToolPermissions, getActiveTabId: () => number | null) {
  return tool({
    description:
      'Query Prebid event history. Returns auction events, bid events, timeouts, and render events. Use this to understand the auction timeline and debug issues.',
    inputSchema: z.object({
      eventType: z
        .enum([
          'auctionInit',
          'auctionEnd',
          'bidRequested',
          'bidResponse',
          'bidWon',
          'bidTimeout',
          'setTargeting',
          'adRenderFailed',
          'adRenderSucceeded',
        ])
        .optional()
        .describe('Filter by event type (optional, returns all events if not specified)'),
      limit: z
        .number()
        .default(20)
        .describe('Maximum number of events to return (default: 20)'),
    }),
    execute: async ({ eventType, limit }) => {
      if (!permissions.allowAdTech) {
        return { error: 'Access to AdTech/Prebid data not permitted by user' }
      }

      const tabId = getActiveTabId()
      if (!tabId) {
        return { error: 'No active tab found. Please ensure you have a page open.' }
      }

      log('[Tool:queryPrebidEvents] Querying events, type:', eventType, 'limit:', limit, 'tabId:', tabId)

      const response = await sendPrebidQuery('GET_EVENTS', { eventType, limit }, tabId)

      if (!response.success) {
        return { error: response.error || 'Failed to query Prebid events' }
      }

      const events = response.data as Array<{
        eventType: string
        args: unknown
        elapsedTime: number
      }>

      // Summarize events by type
      const eventCounts: Record<string, number> = {}
      events.forEach((e) => {
        eventCounts[e.eventType] = (eventCounts[e.eventType] || 0) + 1
      })

      return {
        filter: eventType || 'all',
        totalEvents: events.length,
        eventCounts,
        events: events.map((e) => ({
          eventType: e.eventType,
          elapsedTime: `${e.elapsedTime}ms`,
          // Simplify args for readability
          summary: summarizeEventArgs(e.eventType, e.args),
        })),
      }
    },
  })
}

function summarizeEventArgs(eventType: string, args: unknown): string {
  if (!args) return ''

  try {
    switch (eventType) {
      case 'auctionInit':
      case 'auctionEnd': {
        const a = args as { adUnitCodes?: string[]; auctionId?: string }
        return `auctionId: ${a.auctionId?.slice(0, 8)}..., adUnits: ${a.adUnitCodes?.length || 0}`
      }
      case 'bidRequested': {
        const a = args as { bidderCode?: string; bids?: unknown[] }
        return `bidder: ${a.bidderCode}, bids: ${a.bids?.length || 0}`
      }
      case 'bidResponse': {
        const a = args as { bidder?: string; cpm?: number; adUnitCode?: string }
        return `bidder: ${a.bidder}, cpm: $${a.cpm?.toFixed(2)}, adUnit: ${a.adUnitCode}`
      }
      case 'bidWon': {
        const a = args as { bidder?: string; cpm?: number; adUnitCode?: string }
        return `winner: ${a.bidder}, cpm: $${a.cpm?.toFixed(2)}, adUnit: ${a.adUnitCode}`
      }
      case 'bidTimeout': {
        if (Array.isArray(args)) {
          const bidders = args.map((t: unknown) => (t as { bidder?: string }).bidder).join(', ')
          return `bidders: ${bidders}`
        }
        return ''
      }
      default:
        return JSON.stringify(args).slice(0, 100)
    }
  } catch {
    return ''
  }
}
