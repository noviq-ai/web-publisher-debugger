import { en } from './en'
import { ja } from './ja'

export type OptionsContent = typeof en

export const content: Record<string, OptionsContent> = {
  en,
  ja
}

export function getContent(lang: string): OptionsContent {
  return content[lang] || content.en
}

export function detectLanguage(): string {
  const browserLang = navigator.language.split('-')[0]
  return content[browserLang] ? browserLang : 'en'
}
