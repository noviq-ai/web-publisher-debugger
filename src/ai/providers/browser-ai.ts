import { browserAI, doesBrowserSupportBrowserAI } from '@browser-ai/core'

export { doesBrowserSupportBrowserAI }

/**
 * LanguageModel.create() に expectedOutputs を注入するモンキーパッチ。
 * @browser-ai/core が未対応のため、ライブラリ対応後に削除する。
 */
function patchLanguageModelCreate() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LM = (globalThis as any).LanguageModel
  if (!LM) return

  const original = LM.create.bind(LM)
  LM.create = (options?: Record<string, unknown>) => {
    const patched = {
      ...options,
      expectedOutputs: [{ type: 'text', languages: ['ja', 'en'] }],
    }
    return original(patched)
  }
}

patchLanguageModelCreate()

export function createBrowserAIModel() {
  return browserAI()
}
