import { useState, useEffect, useMemo, useCallback } from 'react'
import type { AiContext, AiProvider } from '@/shared/types'
import { useTabDataStore } from '@/store/tabDataStore'
import type { Icon } from '@tabler/icons-react'
import { useChat } from '@/ai/use-chat'
import { createAnthropicProvider } from '@/ai/providers/anthropic'
import { createOpenAIProvider } from '@/ai/providers/openai'
import { createBrowserAIModel, doesBrowserSupportBrowserAI } from '@/ai/providers/browser-ai'
import { createDataTools, getToolDescriptions } from '@/ai/tools'
import type { ToolContext, ToolPermissions } from '@/ai/tools'
import { IconSearch, IconChartBar, IconTag, IconChartLine, IconPlus } from '@tabler/icons-react'

import { Messages } from '@/components/chat'
import type { ChatMessage } from '@/components/chat/types'
import { ChatInput } from '@/components/chat/ChatInput'
import { EmptyState, ApiKeyMissing } from '@/components/layout/EmptyState'
import { ErrorMessage } from '@/components/common/LoadingIndicator'
import { ChatHistory } from '@/components/chat/ChatHistory'
import { Button } from '@/components/ui/button'
import { useChatPersistence } from '@/hooks/useChatPersistence'
import { getMessagesByChatId } from '@/db/queries'

const BASE_SYSTEM_PROMPT = `You are a Web Publisher Technical Expert specializing in:
- Header Bidding (Prebid.js, Amazon TAM)
- Google Ad Manager / Google Publisher Tag
- Google Tag Manager and dataLayer
- SEO (meta tags, structured data, Core Web Vitals)
- Web Analytics (GA4, Facebook Pixel, marketing pixels)

## How to Work
1. When asked about page data, use the appropriate tools directly based on the user's question
2. Call multiple tools in parallel when the question spans different areas (e.g. SEO + AdTech)
3. Only fetch data the user has permitted (check the permissions below)

## Response Guidelines
- Always respond in the same language as the user's message
- Be concise but thorough
- Format responses with clear sections when appropriate
- Use markdown formatting for better readability
- Provide actionable recommendations when analyzing issues`

const QUICK_PROMPTS = [
  'Analyze the SEO issues and suggest fixes',
  'What are the main problems with this page?',
  'Summarize the advertising setup',
  'Are there any tracking issues?',
]

export interface ContextOption {
  key: keyof Pick<AiContext, 'includeSeo' | 'includeAdTech' | 'includeGtm' | 'includeAnalytics'>
  label: string
  icon: Icon
  hasData: boolean
}

export const AiPage: React.FC = () => {
  const seoData = useTabDataStore((s) => s.seoData)
  const prebidData = useTabDataStore((s) => s.prebidData)
  const gtmData = useTabDataStore((s) => s.gtmData)
  const analyticsData = useTabDataStore((s) => s.analyticsData)
  const tabId = useTabDataStore((s) => s.currentTabId)
  const [inputValue, setInputValue] = useState('')
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [byokProvider, setByokProvider] = useState<'anthropic' | 'openai'>('anthropic')
  const browserAIAvailable = doesBrowserSupportBrowserAI()
  const [aiProvider, setAiProvider] = useState<AiProvider>(browserAIAvailable ? 'browser' : 'anthropic')
  const [context, setContext] = useState<AiContext>({
    includeSeo: true,
    includeAdTech: true,
    includeGtm: true,
    includeAnalytics: true,
    seoData: seoData || undefined,
    adTechData: prebidData || undefined,
    gtmData: gtmData || undefined,
    analyticsData: analyticsData || undefined,
  })
  const [contextOpen, setContextOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([])

  // Chat persistence
  const {
    chats,
    loadChat,
    saveUserMessage,
    saveFinishedMessages,
    removeChat,
    renameChat,
    generateUUID,
  } = useChatPersistence()

  const [chatId, setChatId] = useState<string>(() => generateUUID())

  useEffect(() => {
    // Load BYOK settings (provider + API key) from Options
    // ChatInput defaults to 'browser', user can switch to BYOK if key is available
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
          const provider = result.settings.aiProvider || 'anthropic'
          setByokProvider(provider as 'anthropic' | 'openai')
          if (provider === 'anthropic' && result.settings.claudeApiKey) {
            setApiKey(result.settings.claudeApiKey)
          } else if (provider === 'openai' && result.settings.openaiApiKey) {
            setApiKey(result.settings.openaiApiKey)
          }
        }
      })
    } else {
      // Dev mode
      const devProvider = (localStorage.getItem('aiProvider') as 'anthropic' | 'openai') || 'anthropic'
      setByokProvider(devProvider)
      const devKey = localStorage.getItem(devProvider === 'openai' ? 'openaiApiKey' : 'claudeApiKey')
      if (devKey) setApiKey(devKey)
    }
  }, [])

  useEffect(() => {
    setContext((prev) => ({
      ...prev,
      seoData: seoData || undefined,
      adTechData: prebidData || undefined,
      gtmData: gtmData || undefined,
      analyticsData: analyticsData || undefined,
    }))
  }, [seoData, prebidData, gtmData, analyticsData])

  // Tool context - the actual data available to tools
  const toolContext: ToolContext = useMemo(() => ({
    seoData,
    prebidData,
    gtmData,
    analyticsData,
  }), [seoData, prebidData, gtmData, analyticsData])

  // Tool permissions - what the user allows
  const toolPermissions: ToolPermissions = useMemo(() => ({
    allowSeo: context.includeSeo,
    allowAdTech: context.includeAdTech,
    allowGtm: context.includeGtm,
    allowAnalytics: context.includeAnalytics,
  }), [context.includeSeo, context.includeAdTech, context.includeGtm, context.includeAnalytics])

  // Function to get active tab ID for dynamic Prebid queries
  const getActiveTabId = useCallback(() => tabId, [tabId])

  // Create tools with current context and permissions
  const tools = useMemo(() => {
    return createDataTools(toolContext, toolPermissions, getActiveTabId)
  }, [toolContext, toolPermissions, getActiveTabId])

  // Build system prompt with tool descriptions and permissions
  const systemPrompt = useMemo(() => {
    const permittedSources: string[] = []
    if (toolPermissions.allowSeo) permittedSources.push('SEO')
    if (toolPermissions.allowAdTech) permittedSources.push('AdTech/Prebid')
    if (toolPermissions.allowGtm) permittedSources.push('GTM')
    if (toolPermissions.allowAnalytics) permittedSources.push('Analytics (GA4, Pixels)')

    const permissionsSection = permittedSources.length > 0
      ? `\n\n## User Permissions\nThe user has granted access to: ${permittedSources.join(', ')}\nOnly use tools for data the user has permitted.`
      : '\n\n## User Permissions\nNo data access has been granted. Ask the user to enable data access in the context settings.'

    return `${BASE_SYSTEM_PROMPT}${permissionsSection}\n\n${getToolDescriptions()}`
  }, [toolPermissions])

  const model = useMemo(() => {
    if (aiProvider === 'browser') {
      return createBrowserAIModel()
    }
    // BYOK mode: use the provider configured in Options
    if (!apiKey) return null
    if (byokProvider === 'openai') {
      const openai = createOpenAIProvider(apiKey)
      return openai('gpt-4o')
    }
    const anthropic = createAnthropicProvider(apiKey)
    return anthropic('claude-sonnet-4-20250514')
  }, [apiKey, aiProvider, byokProvider])

  // Handle message finish - save to IndexedDB
  // Only save messages that don't already exist in the DB to preserve createdAt ordering
  const handleFinish = useCallback(async ({ messages: finishedMessages }: { messages: ChatMessage[] }) => {
    if (finishedMessages.length === 0) return

    const existingMessages = await getMessagesByChatId(chatId)
    const existingIds = new Set(existingMessages.map(m => m.id))
    const newMessages = finishedMessages.filter(m => m.role !== 'user' && !existingIds.has(m.id))

    if (newMessages.length > 0) {
      await saveFinishedMessages(chatId, newMessages)
    }
  }, [chatId, saveFinishedMessages])

  const { messages, sendMessage, setMessages, status, error } = useChat(
    model!,
    systemPrompt,
    {
      experimental_throttle: 50,
      onFinish: handleFinish,
    },
    tools,
    {
      id: chatId,
      initialMessages,
    }
  )

  const isLoading = status === 'streaming' || status === 'submitted'

  // Handle new chat
  const handleNewChat = useCallback(async () => {
    const newId = generateUUID()
    setChatId(newId)
    setInitialMessages([])
    setMessages([])
    setHistoryOpen(false)
  }, [generateUUID, setMessages])

  // Handle load chat from history
  const handleLoadChat = useCallback(async (id: string) => {
    const loadedMessages = await loadChat(id)
    setChatId(id)
    setInitialMessages(loadedMessages)
    setMessages(loadedMessages)
    setHistoryOpen(false)
  }, [loadChat, setMessages])

  // Handle delete chat
  const handleDeleteChat = useCallback(async (id: string) => {
    await removeChat(id)
    // If deleted current chat, start new one
    if (id === chatId) {
      handleNewChat()
    }
  }, [removeChat, chatId, handleNewChat])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading && model) {
      const userMessage: ChatMessage = {
        id: generateUUID(),
        role: 'user',
        parts: [{ type: 'text', text: inputValue.trim() }],
      }

      // Save user message immediately
      await saveUserMessage(chatId, userMessage)

      // Send to AI
      sendMessage({ text: inputValue.trim() })
      setInputValue('')
    }
  }, [inputValue, isLoading, model, chatId, generateUUID, saveUserMessage, sendMessage])

  // Handle quick prompt click
  const handlePromptClick = useCallback(async (prompt: string) => {
    if (!model) return

    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: 'user',
      parts: [{ type: 'text', text: prompt }],
    }

    // Save user message immediately
    await saveUserMessage(chatId, userMessage)

    // Send to AI
    sendMessage({ text: prompt })
  }, [model, chatId, generateUUID, saveUserMessage, sendMessage])

  const contextOptions: ContextOption[] = [
    { key: 'includeSeo', label: 'SEO', icon: IconSearch, hasData: !!seoData },
    { key: 'includeAdTech', label: 'AdTech', icon: IconChartBar, hasData: !!prebidData?.detected },
    { key: 'includeGtm', label: 'GTM', icon: IconTag, hasData: !!gtmData?.detected },
    {
      key: 'includeAnalytics',
      label: 'Analytics',
      icon: IconChartLine,
      hasData: !!analyticsData?.ga4 || (analyticsData?.pixels?.length ?? 0) > 0,
    },
  ]

  const activeContextCount = contextOptions.filter(
    (opt) => opt.hasData && context[opt.key]
  ).length

  if (aiProvider !== 'browser' && !apiKey) {
    return <ApiKeyMissing />
  }

  const emptyState = (
    <EmptyState
      quickPrompts={QUICK_PROMPTS}
      onPromptClick={handlePromptClick}
      isLoading={isLoading}
    />
  )

  return (
    <div className="flex flex-col h-full">
      {/* Chat toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b shrink-0">
        <ChatHistory
          chats={chats}
          currentChatId={chatId}
          isOpen={historyOpen}
          onOpenChange={setHistoryOpen}
          onSelectChat={handleLoadChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={renameChat}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewChat}
          title="新しいチャット"
        >
          <IconPlus size={16} />
        </Button>
      </div>

      <Messages
        messages={messages}
        status={status}
        emptyState={emptyState}
      />

      {error && (
        <div className="px-6">
          <div className="max-w-3xl mx-auto">
            <ErrorMessage message={error.message} />
          </div>
        </div>
      )}

      <div className="shrink-0 bg-transparent px-4 pb-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            contextOpen={contextOpen}
            setContextOpen={setContextOpen}
            context={context}
            setContext={setContext}
            contextOptions={contextOptions}
            activeContextCount={activeContextCount}
            aiProvider={aiProvider}
            onProviderChange={setAiProvider}
            apiKey={apiKey}
            byokProvider={byokProvider}
            browserAIAvailable={browserAIAvailable}
          />
        </div>
      </div>
    </div>
  )
}
