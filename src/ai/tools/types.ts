import type { SeoData, PrebidData, GptData, GtmData, AnalyticsData } from '@/shared/types'

export interface ToolContext {
  seoData: SeoData | null
  prebidData: PrebidData | null
  gptData: GptData | null
  gtmData: GtmData | null
  analyticsData: AnalyticsData | null
}

export interface ToolPermissions {
  allowSeo: boolean
  allowAdTech: boolean
  allowGtm: boolean
  allowAnalytics: boolean
}

export interface TrackingOverview {
  gtm: {
    detected: boolean
    containerId: string | null
    dataLayerEventCount: number
    tagsFiredCount: number
  }
  ga4: {
    detected: boolean
    measurementId: string | null
    eventCount: number
    hasConsent: boolean
  }
  pixels: Array<{
    type: string
    id: string
    eventCount: number
  }>
}
