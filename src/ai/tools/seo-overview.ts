import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'

export function createSeoOverviewTool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get a lightweight overview of SEO data available for the current page. Use this before getSeoData to understand what is present (meta tags, OGP, JSON-LD, issues) without fetching full details.',
    inputSchema: z.object({}),
    execute: async () => {
      if (!permissions.allowSeo) {
        return { error: 'Access to SEO data not permitted by user' }
      }

      const { seoData } = context

      if (!seoData) {
        return { detected: false, message: 'SEO data not available' }
      }

      return {
        detected: true,
        url: seoData.url,
        meta: {
          hasTitle: seoData.title !== null,
          hasDescription: seoData.description !== null,
          hasCanonical: seoData.canonical !== null,
          hasRobots: seoData.robots !== null,
          hasViewport: seoData.viewport !== null,
        },
        ogp: {
          detected: Object.values(seoData.ogp).some((v) => v !== null),
        },
        twitter: {
          detected: Object.values(seoData.twitter).some((v) => v !== null),
        },
        jsonLd: {
          count: seoData.jsonLd.length,
          types: seoData.jsonLd.map((item) => item.type),
        },
        hreflang: {
          count: seoData.hreflang.length,
        },
        issueCount: {
          error: seoData.issues.filter((i) => i.type === 'error').length,
          warning: seoData.issues.filter((i) => i.type === 'warning').length,
          info: seoData.issues.filter((i) => i.type === 'info').length,
        },
      }
    },
  })
}
