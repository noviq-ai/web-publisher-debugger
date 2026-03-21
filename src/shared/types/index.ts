export * from './messages'
export * from './seo'
export * from './prebid'
export * from './gpt'
export * from './gtm'
export * from './analytics'

export type TabId = 'adtech' | 'seo' | 'tracking' | 'ai'

export type AiProvider = 'browser' | 'anthropic' | 'openai'

export interface Settings {
  aiProvider: AiProvider
  claudeApiKey: string
  openaiApiKey: string
  enableAdTech: boolean
  enableGtm: boolean
  enableSeo: boolean
  enableAnalytics: boolean
  defaultTab: TabId
}

export const defaultSettings: Settings = {
  aiProvider: 'browser',
  claudeApiKey: '',
  openaiApiKey: '',
  enableAdTech: true,
  enableGtm: true,
  enableSeo: true,
  enableAnalytics: true,
  defaultTab: 'ai',
}

export interface AiContext {
  includeSeo: boolean
  includeAdTech: boolean
  includeGtm: boolean
  includeAnalytics: boolean
  seoData?: import('./seo').SeoData
  adTechData?: import('./prebid').PrebidData
  gptData?: import('./gpt').GptData
  gtmData?: import('./gtm').GtmData
  analyticsData?: import('./analytics').AnalyticsData
}
