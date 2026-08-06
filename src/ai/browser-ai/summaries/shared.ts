import { streamText } from 'ai'
import { createBrowserAITextModel } from '../shared'

const MAX_SUMMARY_PAYLOAD_CHARACTERS = 12_000

function serializeBoundedPayload(payload: object): string {
  const serialized = JSON.stringify(payload)
  if (serialized.length <= MAX_SUMMARY_PAYLOAD_CHARACTERS) return serialized
  return JSON.stringify({
    truncated: true,
    originalCharacterCount: serialized.length,
    excerpt: serialized.slice(0, MAX_SUMMARY_PAYLOAD_CHARACTERS),
  })
}

export async function* streamPageSummary(
  subject: string,
  payload: object,
  abortSignal: AbortSignal,
  preferredResponseLanguage: string | null,
): AsyncGenerator<string, void, void> {
  const languageInstruction = preferredResponseLanguage === 'Japanese'
    ? '回答は必ず日本語で記述してください。分析対象ページやJSON内の言語より、ブラウザの日本語設定を優先してください。見出しも日本語にしてください。広告技術用語の bidder / bidders は必ず「ビッダー」と表記し、「バイダー」とは表記しないでください。'
    : preferredResponseLanguage
      ? `Respond in ${preferredResponseLanguage}. The browser language has priority over the analyzed page language.`
    : 'Use the language of the analyzed page content. If it cannot be determined, respond in English.'
  const requiredSections = preferredResponseLanguage === 'Japanese'
    ? '## 総合評価\n## 優先課題\n## 健全な点\n## 次のアクション'
    : '## Overall assessment\n## Priority issues\n## What is healthy\n## Next actions'
  const result = streamText({
    model: createBrowserAITextModel(),
    abortSignal,
    prompt: `${languageInstruction}

Analyze this publisher page's ${subject} implementation health using only the JSON below.

Return concise Markdown with exactly these sections:
${requiredSections}

Prioritize concrete implementation impact. Do not invent facts absent from the data. Keep the response under 350 words.

${serializeBoundedPayload(payload)}`,
  })

  for await (const textDelta of result.textStream) yield textDelta
}
