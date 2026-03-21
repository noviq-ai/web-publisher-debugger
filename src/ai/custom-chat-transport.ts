import { type UIMessage } from '@ai-sdk/react'
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type ChatRequestOptions,
  type ChatTransport,
  type LanguageModel,
  type UIMessageChunk,
  type Tool,
} from 'ai'

type Tools = Record<string, Tool>

export class CustomChatTransport implements ChatTransport<UIMessage> {
  private model: LanguageModel
  private systemPrompt?: string
  private tools?: Tools

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

  async sendMessages(
    options: {
      chatId: string
      messages: UIMessage[]
      abortSignal: AbortSignal | undefined
    } & {
      trigger: 'submit-message' | 'regenerate-message'
      messageId: string | undefined
    } & ChatRequestOptions
  ): Promise<ReadableStream<UIMessageChunk>> {
    const result = streamText({
      model: this.model,
      system: this.systemPrompt,
      messages: await convertToModelMessages(options.messages),
      abortSignal: options.abortSignal,
      tools: this.tools,
      stopWhen: stepCountIs(10), // Allow multiple tool calls before final response
    })

    return result.toUIMessageStream({
      onError: (error) => {
        console.error('[Chat] Stream error:', error)
        if (error == null) {
          return 'Unknown error'
        }
        if (typeof error === 'string') {
          return error
        }
        if (error instanceof Error) {
          return error.message
        }
        return JSON.stringify(error)
      },
    })
  }

  async reconnectToStream(
    _options: {
      chatId: string
    } & ChatRequestOptions
  ): Promise<ReadableStream<UIMessageChunk> | null> {
    // No backend, so we can't reconnect to a stream
    return null
  }
}
