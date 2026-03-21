const DEBUG = false
function log(...args: unknown[]) { if (DEBUG) log(...args) }

import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'

export function createGa4Tool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get GA4 (Google Analytics 4) events, configuration, and consent information. Use this to analyze GA4 implementation.',
    inputSchema: z.object({
      limit: z
        .number()
        .default(20)
        .describe('Maximum number of events to return (default: 20)'),
      eventFilter: z
        .string()
        .optional()
        .describe('Filter events by name (partial match)'),
      includeConsent: z
        .boolean()
        .default(true)
        .describe('Include consent configuration (default: true)'),
      includeConfigs: z
        .boolean()
        .default(true)
        .describe('Include gtag config calls (default: true)'),
    }),
    execute: async ({ limit, eventFilter, includeConsent, includeConfigs }) => {
      log('[Tool:get_ga4_data] Called with:', {
        limit,
        eventFilter,
        includeConsent,
        includeConfigs,
      })

      if (!permissions.allowAnalytics) {
        return { error: 'Access to Analytics data not permitted by user' }
      }

      const ga4Data = context.analyticsData?.ga4

      if (!ga4Data || !ga4Data.detected) {
        return {
          detected: false,
          message: 'GA4 not detected on this page',
        }
      }

      let events = ga4Data.events
      if (eventFilter) {
        events = events.filter((e) =>
          e.name.toLowerCase().includes(eventFilter.toLowerCase())
        )
      }

      // Return most recent events (newest last)
      const limitedEvents = events.slice(-limit)

      const result: Record<string, unknown> = {
        detected: true,
        measurementId: ga4Data.measurementId,
        events: limitedEvents,
        totalEventCount: ga4Data.events.length,
        returnedEventCount: limitedEvents.length,
      }

      if (includeConsent) {
        result.consent = ga4Data.consent
      }

      if (includeConfigs) {
        result.configs = ga4Data.configs
      }

      log('[Tool:get_ga4_data] Result:', {
        ...result,
        events: `[${limitedEvents.length} events]`,
      })

      return result
    },
  })
}
