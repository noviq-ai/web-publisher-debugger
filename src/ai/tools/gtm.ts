const DEBUG = false
function log(...args: unknown[]) { if (DEBUG) log(...args) }

import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'

export function createGtmTool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get GTM (Google Tag Manager) dataLayer events and tag information. Use this to analyze GTM implementation details.',
    inputSchema: z.object({
      limit: z
        .number()
        .default(20)
        .describe('Maximum number of dataLayer events to return (default: 20)'),
      eventFilter: z
        .string()
        .optional()
        .describe('Filter events by name (partial match)'),
    }),
    execute: async ({ limit, eventFilter }) => {
      log('[Tool:get_gtm_data] Called with:', { limit, eventFilter })

      if (!permissions.allowGtm) {
        return { error: 'Access to GTM data not permitted by user' }
      }

      const { gtmData } = context

      if (!gtmData || !gtmData.detected) {
        return {
          detected: false,
          message: 'GTM not detected on this page',
        }
      }

      let events = gtmData.dataLayerEvents
      if (eventFilter) {
        events = events.filter((e) =>
          e.event.toLowerCase().includes(eventFilter.toLowerCase())
        )
      }

      // Return most recent events (newest last)
      const limitedEvents = events.slice(-limit)

      const result = {
        detected: true,
        containerId: gtmData.containerId,
        containerVersion: gtmData.containerVersion,
        dataLayerEvents: limitedEvents,
        totalEventCount: gtmData.dataLayerEvents.length,
        returnedEventCount: limitedEvents.length,
        tagsFired: gtmData.tagsFired,
        variables: gtmData.variables,
      }

      log('[Tool:get_gtm_data] Result:', {
        ...result,
        dataLayerEvents: `[${result.dataLayerEvents.length} events]`,
      })

      return result
    },
  })
}
