import { tool } from 'ai'
import { z } from 'zod'

export function createSeoReadmeTool() {
  return tool({
    description:
      'Returns a description of all SEO-related tools available — what each tool does, its parameters, and when to use it. Call this when you are unsure which SEO tool to use.',
    inputSchema: z.object({}),
    execute: async () => ({
      group: 'SEO',
      tools: [
        {
          name: 'getSeoOverview',
          description: 'Lightweight snapshot of SEO data on the current page.',
          parameters: 'none',
          returns: 'Presence of title/description/canonical/OGP/Twitter Card, JSON-LD types, issue counts (error/warning/info)',
          whenToUse: 'First call when the user asks anything SEO-related. Use to decide whether the full getSeoData is needed.',
        },
        {
          name: 'getSeoData',
          description: 'Full SEO data for the current page.',
          parameters: [
            { name: 'includeJsonLd', type: 'boolean', default: true, description: 'Include structured data / JSON-LD' },
            { name: 'includeHeadings', type: 'boolean', default: true, description: 'Include heading structure (H1-H6)' },
            { name: 'issuesOnly', type: 'boolean', default: false, description: 'Return only detected issues' },
          ],
          returns: 'Meta tags, OGP, Twitter Card, hreflang, links, JSON-LD, headings, issues',
          whenToUse: 'When the user wants detailed SEO analysis or specific fields not in getSeoOverview.',
        },
      ],
    }),
  })
}
