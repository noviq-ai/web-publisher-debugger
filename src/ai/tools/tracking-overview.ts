const DEBUG = false
function log(...args: unknown[]) { if (DEBUG) log(...args) }

import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions, TrackingOverview } from './types'

export function createTrackingOverviewTool(
  context: ToolContext,
  permissions: ToolPermissions
) {
  return tool({
    description:
      'Get a quick overview of tracking implementations (GTM, GA4, pixels) on the page. Use when the user asks broadly about what tracking exists.',
    inputSchema: z.object({}),
    execute: async (): Promise<TrackingOverview | { error: string }> => {
      log('[Tool:get_tracking_overview] Called')

      if (!permissions.allowGtm && !permissions.allowAnalytics) {
        return { error: 'Access to tracking data not permitted by user' }
      }

      const { gtmData, analyticsData } = context

      const overview: TrackingOverview = {
        gtm: {
          detected: false,
          containerId: null,
          dataLayerEventCount: 0,
          tagsFiredCount: 0,
        },
        ga4: {
          detected: false,
          measurementId: null,
          eventCount: 0,
          hasConsent: false,
        },
        pixels: [],
      }

      // GTM overview
      if (permissions.allowGtm && gtmData) {
        overview.gtm = {
          detected: gtmData.detected,
          containerId: gtmData.containerId,
          dataLayerEventCount: gtmData.dataLayerEvents.length,
          tagsFiredCount: gtmData.tagsFired.length,
        }
      }

      // GA4 overview
      if (permissions.allowAnalytics && analyticsData?.ga4) {
        overview.ga4 = {
          detected: analyticsData.ga4.detected,
          measurementId: analyticsData.ga4.measurementId,
          eventCount: analyticsData.ga4.events.length,
          hasConsent: analyticsData.ga4.consent !== null,
        }
      }

      // Pixels overview
      if (permissions.allowAnalytics && analyticsData?.pixels) {
        overview.pixels = analyticsData.pixels.map((pixel) => ({
          type: pixel.type,
          id: pixel.id,
          eventCount: pixel.events.length,
        }))
      }

      log('[Tool:get_tracking_overview] Result:', overview)
      return overview
    },
  })
}
