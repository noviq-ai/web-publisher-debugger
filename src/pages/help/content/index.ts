import { en } from './en'
import { ja } from './ja'

export type HelpContent = typeof en

export const content: Record<string, HelpContent> = {
  en,
  ja
}

export function getContent(lang: string): HelpContent {
  return content[lang] || content.en
}

export function detectLanguage(): string {
  const browserLang = navigator.language.split('-')[0]
  return content[browserLang] ? browserLang : 'en'
}
