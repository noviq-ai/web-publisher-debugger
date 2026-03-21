export type TechStackCategory =
  | 'analytics'
  | 'ad_network'
  | 'tag_manager'
  | 'cdn'
  | 'js_library'
  | 'frontend_framework'
  | 'cms'
  | 'cdp'
  | 'cookie_consent'
  | 'marketing_automation'
  | 'personalization'
  | 'retargeting'
  | 'security'
  | 'widget'
  | 'other'

export const TECH_STACK_CATEGORY_LABELS: Record<TechStackCategory, string> = {
  analytics: 'Analytics',
  ad_network: 'Ad Network',
  tag_manager: 'Tag Manager',
  cdn: 'CDN',
  js_library: 'JavaScript Library',
  frontend_framework: 'Frontend Framework',
  cms: 'CMS',
  cdp: 'CDP',
  cookie_consent: 'Cookie Consent',
  marketing_automation: 'Marketing Automation',
  personalization: 'Personalization',
  retargeting: 'Retargeting',
  security: 'Security',
  widget: 'Widget',
  other: 'Other',
}

export interface TechStackItem {
  name: string
  version?: string
  category: TechStackCategory
  detectedBy: 'global' | 'script_url' | 'dom'
  domain?: string
}

export interface TechStackData {
  items: TechStackItem[]
  detectedAt: number
}
