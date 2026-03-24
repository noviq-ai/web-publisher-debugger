import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'

export function createPrebidConfigTool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get Prebid.js configuration details including timeout, modules, user IDs, consent, and S2S settings.',
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
        version: prebidData.version,
        config: prebidData.config,
        installedModules: prebidData.installedModules,
        userIds: prebidData.userIds,
        consentMetadata: prebidData.consentMetadata,
        aliasRegistry: prebidData.aliasRegistry,
        bidderSettings: prebidData.bidderSettings,
      }
    },
  })
}
