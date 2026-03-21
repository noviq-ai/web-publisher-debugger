import { en } from './en'
import { ja } from './ja'

export type FeedbackContent = typeof en

export const content: Record<string, FeedbackContent> = {
  en,
  ja
}

export function getContent(lang: string): FeedbackContent {
  return content[lang] || content.en
}

export function detectLanguage(): string {
  const browserLang = navigator.language.split('-')[0]
  return content[browserLang] ? browserLang : 'en'
}
