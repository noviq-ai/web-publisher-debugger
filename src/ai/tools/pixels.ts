const DEBUG = false
function log(...args: unknown[]) { if (DEBUG) log(...args) }

import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'
export function createPixelsTool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get marketing pixel data (Facebook/Meta, Twitter/X, TikTok, LinkedIn, Pinterest, Criteo, Snapchat). Use this to analyze pixel implementations and events.',
    inputSchema: z.object({
      platform: z
        .enum(['facebook', 'twitter', 'tiktok', 'linkedin', 'pinterest', 'criteo', 'snapchat', 'all'])
        .default('all')
        .describe('Filter by pixel platform (default: all)'),
      limit: z
        .number()
        .default(20)
        .describe('Maximum number of events per pixel to return (default: 20)'),
    }),
    execute: async ({ platform, limit }) => {
      log('[Tool:get_pixel_data] Called with:', { platform, limit })

      if (!permissions.allowAnalytics) {
        return { error: 'Access to Analytics data not permitted by user' }
      }

      const pixels = context.analyticsData?.pixels

      if (!pixels || pixels.length === 0) {
        return {
          detected: false,
          message: 'No marketing pixels detected on this page',
          availablePlatforms: [],
        }
      }

      let filteredPixels = pixels
      if (platform !== 'all') {
        filteredPixels = pixels.filter((p) => p.type === platform)
      }

      if (filteredPixels.length === 0) {
        return {
          detected: false,
          message: `No ${platform} pixel detected on this page`,
          availablePlatforms: pixels.map((p) => p.type),
        }
      }

      const result = {
        detected: true,
        pixels: filteredPixels.map((pixel) => ({
          type: pixel.type,
          id: pixel.id,
          events: pixel.events.slice(-limit),
          totalEventCount: pixel.events.length,
          returnedEventCount: Math.min(pixel.events.length, limit),
        })),
        totalPixelsDetected: pixels.length,
        availablePlatforms: [...new Set(pixels.map((p) => p.type))],
      }

      log('[Tool:get_pixel_data] Result:', {
        ...result,
        pixels: result.pixels.map((p) => ({
          ...p,
          events: `[${p.returnedEventCount} events]`,
        })),
      })

      return result
    },
  })
}
