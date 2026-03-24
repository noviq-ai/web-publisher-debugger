import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'

export function createGptSlotsTool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get Google Publisher Tag (GPT / Google Ad Manager) data: slot configuration, page targeting, render status, and ad delivery info.',
    inputSchema: z.object({}),
    execute: async () => {
      if (!permissions.allowAdTech) {
        return { error: 'Access to AdTech data not permitted by user' }
      }

      const { gptData } = context

      if (!gptData || !gptData.detected) {
        return { detected: false, message: 'Google Publisher Tag not detected on this page' }
      }

      return {
        detected: true,
        version: gptData.version,
        config: gptData.config,
        pageTargeting: gptData.pageTargeting,
        slotCount: gptData.slots.length,
        slots: gptData.slots,
        eventCount: gptData.events.length,
      }
    },
  })
}
