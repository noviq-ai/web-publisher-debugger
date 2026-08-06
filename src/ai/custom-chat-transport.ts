import {
  convertToModelMessages,
  createUIMessageStream,
  streamText,
  stepCountIs,
  type ChatRequestOptions,
  type ChatTransport,
  type LanguageModel,
  type Tool,
} from 'ai'
import type { ChatMessage, SessionCompactionActivity } from '@/components/chat/types'

type Tools = Record<string, Tool>

interface BrowserAISessionManager {
  destroySession(): void
}

type BrowserAIModelLifecycle = Exclude<LanguageModel, string> & {
  getContextUsage?: () => number | undefined
  getContextWindow?: () => number | undefined
  sessionManager?: BrowserAISessionManager
}

interface LanguageDetectionResult {
  detectedLanguage: string
  confidence: number
}

interface LanguageDetectorSession {
  detect(text: string): Promise<LanguageDetectionResult[]>
  destroy(): void
}

interface LanguageDetectorFactory {
  availability(): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>
  create(): Promise<LanguageDetectorSession>
}

interface SummarizerSession {
  summarize(text: string, options: { context: string }): Promise<string>
  destroy(): void
}

interface SummarizerFactory {
  availability(options: SummarizerOptions): Promise<'unavailable' | 'downloadable' | 'downloading' | 'available'>
  create(options: SummarizerOptions): Promise<SummarizerSession>
}

interface SummarizerOptions {
  type: 'tldr'
  format: 'plain-text'
  length: 'short'
  expectedInputLanguages: string[]
  expectedContextLanguages: string[]
  outputLanguage: string
  preference: 'speed'
}

interface BuiltInAIGlobals {
  LanguageDetector?: LanguageDetectorFactory
  Summarizer?: SummarizerFactory
}

interface CompactedContext {
  summary: string
  throughMessageId: string
}

interface PreparedConversation {
  messages: ChatMessage[]
  systemPrompt: string | undefined
  activity: SessionCompactionActivity | null
}

const SESSION_COMPACTION_THRESHOLD = 0.8
const RECENT_MESSAGES_TO_PRESERVE = 6
const LANGUAGE_DETECTION_CONFIDENCE = 0.7

function getErrorMessage(error: object | string | null | undefined): string {
  if (error == null) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  return JSON.stringify(error)
}

function getBrowserAIModelLifecycle(model: LanguageModel): BrowserAIModelLifecycle {
  return model as BrowserAIModelLifecycle
}

function isBrowserAIModel(model: LanguageModel): model is BrowserAIModelLifecycle {
  return typeof model !== 'string' && model.provider === 'browser-ai'
}

function getMessageText(message: ChatMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

function formatMessagesForCompaction(messages: ChatMessage[], previousSummary: string | undefined): string {
  const turns = messages
    .map((message) => {
      const text = getMessageText(message).trim()
      return text.length > 0 ? `${message.role}: ${text}` : ''
    })
    .filter((turn) => turn.length > 0)

  return [previousSummary ? `Previous summary:\n${previousSummary}` : '', ...turns]
    .filter((section) => section.length > 0)
    .join('\n\n')
}

function getMessagesAfterCompaction(messages: ChatMessage[], context: CompactedContext): ChatMessage[] {
  const compactedIndex = messages.findIndex((message) => message.id === context.throughMessageId)
  return compactedIndex >= 0 ? messages.slice(compactedIndex + 1) : messages
}

function appendCompactedContext(systemPrompt: string | undefined, summary: string): string {
  const contextSection = `## Compacted conversation context\n${summary}`
  return systemPrompt ? `${systemPrompt}\n\n${contextSection}` : contextSection
}

export class CustomChatTransport implements ChatTransport<ChatMessage> {
  private model: LanguageModel
  private systemPrompt?: string
  private tools?: Tools
  private lastChatId: string | null = null
  private readonly compactedContexts = new Map<string, CompactedContext>()

  constructor(model: LanguageModel, systemPrompt?: string, tools?: Tools) {
    this.model = model
    this.systemPrompt = systemPrompt
    this.tools = tools
  }

  updateModel(model: LanguageModel) {
    this.model = model
  }

  updateSystemPrompt(systemPrompt: string) {
    this.systemPrompt = systemPrompt
  }

  updateTools(tools: Tools) {
    this.tools = tools
  }

  private getContextUtilization(): { usage: number; window: number } | null {
    if (!isBrowserAIModel(this.model)) return null
    const lifecycle = getBrowserAIModelLifecycle(this.model)
    const usage = lifecycle.getContextUsage?.()
    const window = lifecycle.getContextWindow?.()
    if (usage === undefined || window === undefined || window <= 0) return null
    return { usage, window }
  }

  private resetBrowserAISession(): void {
    if (!isBrowserAIModel(this.model)) return
    getBrowserAIModelLifecycle(this.model).sessionManager?.destroySession()
  }

  private shouldCompact(
    chatId: string,
    messages: ChatMessage[],
    utilization: { usage: number; window: number } | null
  ): boolean {
    if (utilization === null || utilization.usage / utilization.window < SESSION_COMPACTION_THRESHOLD) {
      return false
    }
    const context = this.compactedContexts.get(chatId)
    const activeMessages = context ? getMessagesAfterCompaction(messages, context) : messages
    return activeMessages.length > RECENT_MESSAGES_TO_PRESERVE
  }

  private async summarizeConversation(source: string): Promise<string> {
    const builtInAI = globalThis as typeof globalThis & BuiltInAIGlobals
    if (!builtInAI.LanguageDetector || !builtInAI.Summarizer) {
      throw new Error('Language Detector API or Summarizer API is unavailable')
    }

    const detectorAvailability = await builtInAI.LanguageDetector.availability()
    if (detectorAvailability === 'unavailable') {
      throw new Error('Language Detector API is unavailable on this device')
    }

    const detector = await builtInAI.LanguageDetector.create()
    const detectionResults = await detector.detect(source)
    detector.destroy()
    const detectedLanguage = detectionResults.find((result) => result.confidence >= LANGUAGE_DETECTION_CONFIDENCE)?.detectedLanguage
    if (!detectedLanguage) {
      throw new Error(`Language detection confidence was below ${LANGUAGE_DETECTION_CONFIDENCE}`)
    }

    const options: SummarizerOptions = {
      type: 'tldr',
      format: 'plain-text',
      length: 'short',
      expectedInputLanguages: [detectedLanguage],
      expectedContextLanguages: [detectedLanguage],
      outputLanguage: detectedLanguage,
      preference: 'speed',
    }
    const summarizerAvailability = await builtInAI.Summarizer.availability(options)
    if (summarizerAvailability === 'unavailable') {
      throw new Error(`Summarizer API is unavailable for language ${detectedLanguage}`)
    }

    const summarizer = await builtInAI.Summarizer.create(options)
    const summary = await summarizer.summarize(source, {
      context: 'This is a chat conversation. Preserve decisions, findings, user intent, and unresolved tasks concisely.',
    })
    summarizer.destroy()
    if (summary.trim().length === 0) {
      throw new Error('Summarizer API returned an empty summary')
    }
    return summary.trim()
  }

  private async prepareConversation(chatId: string, messages: ChatMessage[]): Promise<PreparedConversation> {
    const existingContext = this.compactedContexts.get(chatId)
    const activeMessages = existingContext ? getMessagesAfterCompaction(messages, existingContext) : messages
    const utilization = this.getContextUtilization()
    const shouldCompact = this.shouldCompact(chatId, messages, utilization)

    if (!shouldCompact || utilization === null) {
      return {
        messages: activeMessages,
        systemPrompt: existingContext
          ? appendCompactedContext(this.systemPrompt, existingContext.summary)
          : this.systemPrompt,
        activity: null,
      }
    }

    const splitIndex = activeMessages.length - RECENT_MESSAGES_TO_PRESERVE
    const messagesToCompact = activeMessages.slice(0, splitIndex)
    const recentMessages = activeMessages.slice(splitIndex)
    const throughMessage = messagesToCompact[messagesToCompact.length - 1]
    const source = formatMessagesForCompaction(messagesToCompact, existingContext?.summary)

    if (!throughMessage || source.length === 0) {
      return {
        messages: activeMessages,
        systemPrompt: this.systemPrompt,
        activity: null,
      }
    }

    try {
      const summary = await this.summarizeConversation(source)
      this.compactedContexts.set(chatId, { summary, throughMessageId: throughMessage.id })
      return {
        messages: recentMessages,
        systemPrompt: appendCompactedContext(this.systemPrompt, summary),
        activity: { status: 'compacted', beforeTokens: utilization.usage },
      }
    } catch (error) {
      return {
        messages,
        systemPrompt: this.systemPrompt,
        activity: {
          status: 'failed',
          beforeTokens: utilization.usage,
          errorMessage: getErrorMessage(error instanceof Error ? error : String(error)),
        },
      }
    }
  }

  async sendMessages(
    options: {
      chatId: string
      messages: ChatMessage[]
      abortSignal: AbortSignal | undefined
      trigger: 'submit-message' | 'regenerate-message'
      messageId: string | undefined
    } & ChatRequestOptions
  ): Promise<ReadableStream<import('ai').UIMessageChunk>> {
    const isSameChat = this.lastChatId === options.chatId
    if (!isSameChat) {
      this.resetBrowserAISession()
    }
    this.lastChatId = options.chatId

    return createUIMessageStream<ChatMessage>({
      originalMessages: options.messages,
      onError: (error) => getErrorMessage(error instanceof Error ? error : String(error)),
      execute: async ({ writer }) => {
        const utilization = isSameChat ? this.getContextUtilization() : null
        const willCompact = this.shouldCompact(options.chatId, options.messages, utilization)

        const pendingActivityId = willCompact ? `compaction-pending-${crypto.randomUUID()}` : null
        if (pendingActivityId && utilization) {
          writer.write({
            type: 'data-compaction',
            id: pendingActivityId,
            data: { status: 'compacting', beforeTokens: utilization.usage },
          })
        }

        const prepared = await this.prepareConversation(options.chatId, options.messages)
        if (pendingActivityId && prepared.activity) {
          writer.write({
            type: 'data-compaction',
            id: pendingActivityId,
            data: prepared.activity,
          })
        }

        this.resetBrowserAISession()
        const result = streamText({
          model: this.model,
          system: prepared.systemPrompt,
          messages: await convertToModelMessages(prepared.messages),
          abortSignal: options.abortSignal,
          tools: this.tools,
          stopWhen: stepCountIs(10),
        })

        const responseStream = result.toUIMessageStream<ChatMessage>({
          sendStart: false,
          sendFinish: true,
          onError: (error) => getErrorMessage(error instanceof Error ? error : String(error)),
        })
        const reader = responseStream.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          writer.write(value)
        }

        if (pendingActivityId && prepared.activity?.status === 'compacted') {
          const afterTokens = getBrowserAIModelLifecycle(this.model).getContextUsage?.()
          writer.write({
            type: 'data-compaction',
            id: pendingActivityId,
            data: { ...prepared.activity, afterTokens },
          })
        }
      },
    })
  }

  async reconnectToStream(
    _options: { chatId: string } & ChatRequestOptions
  ): Promise<ReadableStream<import('ai').UIMessageChunk> | null> {
    return null
  }
}
