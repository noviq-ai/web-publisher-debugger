const DEBUG = false
function log(...args: unknown[]) { if (DEBUG) log(...args) }

import { tool } from 'ai'
import { z } from 'zod'
import type { ToolContext, ToolPermissions } from './types'

export function createSeoTool(context: ToolContext, permissions: ToolPermissions) {
  return tool({
    description:
      'Get SEO data including meta tags, OGP, Twitter Card, structured data (JSON-LD), headings, and detected issues. Use this to analyze SEO implementation.',
    inputSchema: z.object({
      includeJsonLd: z
        .boolean()
        .default(true)
        .describe('Include structured data / JSON-LD (default: true)'),
      includeHeadings: z
        .boolean()
        .default(true)
        .describe('Include heading structure (default: true)'),
      issuesOnly: z
        .boolean()
        .default(false)
        .describe('Return only detected issues without full data (default: false)'),
    }),
    execute: async ({ includeJsonLd, includeHeadings, issuesOnly }) => {
      log('[Tool:get_seo_data] Called with:', {
        includeJsonLd,
        includeHeadings,
        issuesOnly,
      })

      if (!permissions.allowSeo) {
        return { error: 'Access to SEO data not permitted by user' }
      }

      const { seoData } = context

      if (!seoData) {
        return {
          detected: false,
          message: 'SEO data not available',
        }
      }

      // Issues only mode
      if (issuesOnly) {
        return {
          detected: true,
          url: seoData.url,
          issues: seoData.issues,
          issueCount: {
            error: seoData.issues.filter((i) => i.type === 'error').length,
            warning: seoData.issues.filter((i) => i.type === 'warning').length,
            info: seoData.issues.filter((i) => i.type === 'info').length,
          },
        }
      }

      const result: Record<string, unknown> = {
        detected: true,
        url: seoData.url,
        meta: {
          title: seoData.title,
          description: seoData.description,
          canonical: seoData.canonical,
          robots: seoData.robots,
          viewport: seoData.viewport,
          charset: seoData.charset,
        },
        ogp: seoData.ogp,
        twitter: seoData.twitter,
        hreflang: seoData.hreflang,
        links: seoData.links,
        issues: seoData.issues,
        issueCount: {
          error: seoData.issues.filter((i) => i.type === 'error').length,
          warning: seoData.issues.filter((i) => i.type === 'warning').length,
          info: seoData.issues.filter((i) => i.type === 'info').length,
        },
      }

      if (includeJsonLd) {
        result.jsonLd = seoData.jsonLd
      }

      if (includeHeadings) {
        result.headings = seoData.headings
      }

      log('[Tool:get_seo_data] Result:', {
        ...result,
        jsonLd: includeJsonLd ? `[${seoData.jsonLd.length} items]` : undefined,
      })

      return result
    },
  })
}
