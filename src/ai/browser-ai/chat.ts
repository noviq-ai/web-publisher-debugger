import { createBrowserAITextModel } from './shared'

/** Creates an isolated Browser AI model instance for the persistent chat workflow. */
export function createBrowserAIChatModel() {
  return createBrowserAITextModel()
}
