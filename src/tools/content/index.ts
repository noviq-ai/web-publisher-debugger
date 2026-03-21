import { en } from './en'
import { ja } from './ja'

export type ToolsContent = typeof en

export const content: Record<string, ToolsContent> = {
  en,
  ja
}

export function getContent(lang: string): ToolsContent {
  return content[lang] || content.en
}

export function detectLanguage(): string {
  const browserLang = navigator.language.split('-')[0]
  return content[browserLang] ? browserLang : 'en'
}
