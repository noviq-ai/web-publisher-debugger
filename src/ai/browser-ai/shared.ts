import { browserAI, doesBrowserSupportBrowserAI } from '@browser-ai/core'

export type BrowserAIAvailability = 'unavailable' | 'available' | 'available-after-download'

const BROWSER_AI_TEXT_SETTINGS = {
  expectedInputs: [{ type: 'text' as const, languages: ['ja', 'en'] }],
  expectedOutputs: [{ type: 'text' as const, languages: ['ja', 'en'] }],
}

export { doesBrowserSupportBrowserAI }

export function resolvePreferredResponseLanguage(
  browserUiLanguage: string | null,
  browserLanguages: readonly string[],
): string | null {
  const primaryLanguage = browserUiLanguage || browserLanguages[0]
  if (!primaryLanguage) return null
  return primaryLanguage.toLowerCase().startsWith('ja') ? 'Japanese' : 'English'
}

export function createBrowserAITextModel() {
  return browserAI('text', BROWSER_AI_TEXT_SETTINGS)
}

export async function getBrowserAISummaryAvailability(): Promise<BrowserAIAvailability> {
  if (!doesBrowserSupportBrowserAI()) return 'unavailable'
  return createBrowserAITextModel().availability()
}
