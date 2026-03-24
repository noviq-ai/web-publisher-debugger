import type { UIMessage } from 'ai'

// UITool type for dynamic tools
type UITool = {
  input: unknown
  output: unknown | undefined
}

// Message type - using generic tool support since tools are dynamically created
export type ChatMessage = UIMessage<Record<string, unknown>, Record<string, unknown>, Record<string, UITool>>

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

// Utility to extract text from message parts
export function getTextFromMessage(message: ChatMessage | UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part as { type: 'text'; text: string }).text)
    .join('')
}

// Tool names for UI rendering
export const DATA_TOOL_NAMES = [
  'getTrackingOverview',
  'getGtmData',
  'getGa4Data',
  'getPixelData',
  'getSeoData',
  'getAdtechOverview',
  'getPrebidConfig',
  'getPrebidBidders',
  'getPrebidAdUnits',
  'getGptSlots',
  // Dynamic Prebid query tools
  'diagnoseBidder',
  'analyzeAdUnit',
  'queryPrebidEvents',
] as const

export type DataToolName = (typeof DATA_TOOL_NAMES)[number]

// Human-readable tool labels
export const TOOL_LABELS: Record<DataToolName, string> = {
  getTrackingOverview: 'Tracking Overview',
  getGtmData: 'GTM Data',
  getGa4Data: 'GA4 Data',
  getPixelData: 'Pixel Data',
  getSeoData: 'SEO Data',
  getAdtechOverview: 'AdTech Overview',
  getPrebidConfig: 'Prebid Config',
  getPrebidBidders: 'Prebid Bidders',
  getPrebidAdUnits: 'Prebid Ad Units',
  getGptSlots: 'GPT Slots',
  // Dynamic Prebid query tools
  diagnoseBidder: 'Bidder Diagnosis',
  analyzeAdUnit: 'Ad Unit Analysis',
  queryPrebidEvents: 'Prebid Events',
}

// Check if a part type is a data tool
export function isDataToolPart(partType: string): partType is `tool-${DataToolName}` {
  return DATA_TOOL_NAMES.some((name) => partType === `tool-${name}`)
}

// Extract tool name from part type
export function getToolNameFromPartType(partType: string): DataToolName | null {
  const match = partType.match(/^tool-(.+)$/)
  if (match && DATA_TOOL_NAMES.includes(match[1] as DataToolName)) {
    return match[1] as DataToolName
  }
  return null
}

// Weather tool output type (kept for backwards compatibility)
export interface WeatherData {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  cityName?: string
  current_units: {
    time: string
    interval: string
    temperature_2m: string
  }
  current: {
    time: string
    interval: number
    temperature_2m: number
  }
  hourly_units: {
    time: string
    temperature_2m: string
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
  }
  daily_units: {
    time: string
    sunrise: string
    sunset: string
  }
  daily: {
    time: string[]
    sunrise: string[]
    sunset: string[]
  }
  error?: string
}
