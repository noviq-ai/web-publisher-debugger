import type { Tool } from 'ai'
import type { ToolContext, ToolPermissions } from './types'

import { createTrackingOverviewTool } from './tracking-overview'
import { createGtmTool } from './gtm'
import { createGa4Tool } from './ga4'
import { createPixelsTool } from './pixels'
import { createSeoTool } from './seo'
import { createSeoOverviewTool } from './seo-overview'
import { createAdtechTool } from './adtech'
import { createAdtechOverviewTool } from './adtech-overview'
import { createPrebidQueryTools } from './prebid-query'
import { createSeoReadmeTool } from './readme-seo'
import { createAdtechReadmeTool } from './readme-adtech'
import { createTrackingReadmeTool } from './readme-tracking'

// Re-export for legacy compatibility
export { getWeather } from './get-weather'

// Re-export Prebid query tools creator
export { createPrebidQueryTools } from './prebid-query'

// Export types
export type { ToolContext, ToolPermissions, TrackingOverview } from './types'

// Tool names for type safety
export const TOOL_NAMES = {
  TRACKING_README: 'getTrackingReadme',
  TRACKING_OVERVIEW: 'getTrackingOverview',
  GTM: 'getGtmData',
  GA4: 'getGa4Data',
  PIXELS: 'getPixelData',
  SEO_README: 'getSeoReadme',
  SEO_OVERVIEW: 'getSeoOverview',
  SEO: 'getSeoData',
  ADTECH_README: 'getAdtechReadme',
  ADTECH_OVERVIEW: 'getAdtechOverview',
  ADTECH: 'getAdtechData',
  // Dynamic Prebid query tools
  DIAGNOSE_BIDDER: 'diagnoseBidder',
  ANALYZE_AD_UNIT: 'analyzeAdUnit',
  QUERY_PREBID_EVENTS: 'queryPrebidEvents',
} as const

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES]

// Create all data tools based on context and permissions
export function createDataTools(
  context: ToolContext,
  permissions: ToolPermissions,
  getActiveTabId?: () => number | null
): Record<string, Tool> {
  const tools: Record<string, Tool> = {
    [TOOL_NAMES.TRACKING_README]: createTrackingReadmeTool(),
    [TOOL_NAMES.TRACKING_OVERVIEW]: createTrackingOverviewTool(context, permissions),
    [TOOL_NAMES.GTM]: createGtmTool(context, permissions),
    [TOOL_NAMES.GA4]: createGa4Tool(context, permissions),
    [TOOL_NAMES.PIXELS]: createPixelsTool(context, permissions),
    [TOOL_NAMES.SEO_README]: createSeoReadmeTool(),
    [TOOL_NAMES.SEO_OVERVIEW]: createSeoOverviewTool(context, permissions),
    [TOOL_NAMES.SEO]: createSeoTool(context, permissions),
    [TOOL_NAMES.ADTECH_README]: createAdtechReadmeTool(),
    [TOOL_NAMES.ADTECH_OVERVIEW]: createAdtechOverviewTool(context, permissions),
    [TOOL_NAMES.ADTECH]: createAdtechTool(context, permissions),
  }

  // Add dynamic Prebid query tools if we have a way to get the active tab
  if (getActiveTabId) {
    const prebidQueryTools = createPrebidQueryTools(permissions, getActiveTabId)
    tools[TOOL_NAMES.DIAGNOSE_BIDDER] = prebidQueryTools.diagnoseBidder
    tools[TOOL_NAMES.ANALYZE_AD_UNIT] = prebidQueryTools.analyzeAdUnit
    tools[TOOL_NAMES.QUERY_PREBID_EVENTS] = prebidQueryTools.queryPrebidEvents
  }

  return tools
}

// Get human-readable tool descriptions for system prompt
export function getToolDescriptions(): string {
  return `
## Available Data Tools

You have access to the following tools to retrieve page data. Use them as needed to answer user questions.

### getTrackingReadme
Returns descriptions of all Tracking tools (getTrackingOverview, getGtmData, getGa4Data, getPixelData) — parameters and when to use each.
- Use this when unsure which tracking tool to call

### getTrackingOverview
Quick summary of tracking implementations (GTM, GA4, pixels).
- Returns: GTM status, GA4 status, detected pixels summary
- Use this when: The user asks a broad question about what tracking is on the page

### getGtmData
Get GTM (Google Tag Manager) details.
- Parameters: limit (number), eventFilter (string, optional)
- Returns: Container info, dataLayer events, fired tags, variables

### getGa4Data
Get GA4 (Google Analytics 4) details.
- Parameters: limit (number), eventFilter (string, optional), includeConsent (boolean), includeConfigs (boolean)
- Returns: Measurement ID, events, consent status, configurations

### getPixelData
Get marketing pixel data (Meta, Twitter/X, TikTok, LinkedIn, Pinterest, Criteo, Snapchat).
- Parameters: platform (string: facebook|twitter|tiktok|linkedin|pinterest|criteo|snapchat|all), limit (number)
- Returns: Pixel IDs, events per platform

### getSeoReadme
Returns descriptions of all SEO tools (getSeoOverview, getSeoData) — parameters and when to use each.
- Use this when unsure which SEO tool to call

### getSeoOverview
Get a lightweight overview of SEO data (no parameters needed).
- Returns: Whether title/description/canonical/OGP/Twitter Card exist, JSON-LD types, issue counts
- Use this first to understand what SEO data is available before calling getSeoData

### getSeoData
Get full SEO metadata and issues.
- Parameters: includeJsonLd (boolean), includeHeadings (boolean), issuesOnly (boolean)
- Returns: Meta tags, OGP, Twitter Card, structured data, headings, detected issues

### getAdtechReadme
Returns descriptions of all AdTech tools (getAdtechOverview, getAdtechData, diagnoseBidder, analyzeAdUnit, queryPrebidEvents) — parameters and when to use each.
- Use this when unsure which AdTech tool to call

### getAdtechOverview
Get a lightweight overview of AdTech (Prebid.js) data (no parameters needed).
- Returns: Detected bidders list, ad unit codes, auction count, module count
- Use this first to understand what AdTech data is available before calling getAdtechData

### getAdtechData
Get Prebid.js header bidding data.
- Parameters: includeAuctions (boolean), includeBidderDetails (boolean), includeConfig (boolean), auctionLimit (number)
- Returns: Prebid config, bidders, ad units, auction results, winning bids

### diagnoseBidder (Dynamic Query)
Diagnose a specific Prebid bidder's performance in real-time.
- Parameters: bidderCode (string, e.g., "appnexus", "rubicon")
- Returns: Bid rate, timeout rate, win rate, average CPM, response time, and identified issues
- Use this when: A specific bidder is not responding or performing poorly

### analyzeAdUnit (Dynamic Query)
Analyze a specific Prebid ad unit in real-time.
- Parameters: adUnitCode (string, e.g., "div-gpt-ad-12345")
- Returns: Configured bidders, bid responses, no-bids, highest bid, winner
- Use this when: You need detailed information about a specific ad slot

### queryPrebidEvents (Dynamic Query)
Query Prebid event history.
- Parameters: eventType (optional: auctionInit|auctionEnd|bidRequested|bidResponse|bidWon|bidTimeout|etc), limit (number)
- Returns: Event timeline with summaries
- Use this when: You need to understand the auction timeline or debug issues
`.trim()
}
