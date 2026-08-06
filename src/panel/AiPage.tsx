import { useState, useEffect, useMemo, useCallback } from 'react'
import type { AiContext, AiProvider } from '@/shared/types'
import { useTabDataStore } from '@/store/tabDataStore'
import { useChat } from '@/ai/use-chat'
import { createAnthropicProvider } from '@/ai/providers/anthropic'
import { createOpenAIProvider } from '@/ai/providers/openai'
import { createBrowserAIChatModel } from '@/ai/browser-ai/chat'
import { doesBrowserSupportBrowserAI, resolvePreferredResponseLanguage } from '@/ai/browser-ai/shared'
import { createDataTools, getToolDescriptions } from '@/ai/tools'
import type { ToolContext, ToolPermissions } from '@/ai/tools'
import { IconMagnifyingGlass as IconSearch, IconChart7 as IconChartBar, IconTag, IconLineChart2 as IconChartLine, IconPlusMedium as IconPlus } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"

import { Messages } from '@/components/chat'
import type { ChatMessage } from '@/components/chat/types'
import { ChatInput } from '@/components/chat/ChatInput'
import { EmptyState, ApiKeyMissing } from '@/components/layout/EmptyState'
import { HeaderActionsPortal } from '@/components/layout/Layout'
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
1. All tools retrieve data from the **currently inspected browser tab** — no URL is needed, never ask for one
2. When asked about page data, use the appropriate tools directly based on the user's question
3. Use overview tools (getSeoOverview, getAdtechOverview, getTrackingOverview) first to understand what data is available, then call the full tool if more detail is needed
4. Call multiple tools in parallel when the question spans different areas (e.g. SEO + AdTech)
5. Only fetch data the user has permitted (check the permissions below)

## Response Guidelines
- Follow the response-language priority supplied below
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

const DEV_THINKING_PREVIEW_PARAM = 'thinking'

const DEV_THINKING_PREVIEW_MESSAGES: ChatMessage[] = [{
  id: 'dev-thinking-preview-user',
  role: 'user',
  parts: [{ type: 'text', text: 'Analyze this page implementation.' }],
}]

export interface ContextOption {
  key: keyof Pick<AiContext, 'includeSeo' | 'includeAdTech' | 'includeGtm' | 'includeAnalytics'>
  label: string
  icon: React.ElementType
  hasData: boolean
}

export const AiPage: React.FC = () => {
  const seoData = useTabDataStore((s) => s.seoData)
  const prebidData = useTabDataStore((s) => s.prebidData)
  const gptData = useTabDataStore((s) => s.gptData)
  const gtmData = useTabDataStore((s) => s.gtmData)
  const analyticsData = useTabDataStore((s) => s.analyticsData)
  const tabId = useTabDataStore((s) => s.currentTabId)
  const [inputValue, setInputValue] = useState('')
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [byokProvider, setByokProvider] = useState<'anthropic' | 'openai'>('anthropic')
  const browserAIAvailable = doesBrowserSupportBrowserAI()
  const preferredResponseLanguage = useMemo(
    () => resolvePreferredResponseLanguage(typeof chrome === 'undefined' || !chrome.i18n ? null : chrome.i18n.getUILanguage(), navigator.languages),
    [],
  )
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
  const isThinkingPreview = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get('preview') === DEV_THINKING_PREVIEW_PARAM

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
    gptData,
    gtmData,
    analyticsData,
  }), [seoData, prebidData, gptData, gtmData, analyticsData])

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

    const languageSection = preferredResponseLanguage
      ? `\n\n## Response Language Priority\nRespond in ${preferredResponseLanguage}. The browser language has priority over the language of the user's inquiry. Only use the inquiry language when the browser language cannot be determined.`
      : '\n\n## Response Language Priority\nThe browser language could not be determined. Respond in the language of the user\'s latest inquiry.'

    return `${BASE_SYSTEM_PROMPT}${languageSection}${permissionsSection}\n\n${getToolDescriptions()}`
  }, [preferredResponseLanguage, toolPermissions])

  const model = useMemo(() => {
    if (aiProvider === 'browser') {
      return createBrowserAIChatModel()
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

  const { messages, sendMessage, setMessages, stop, status, error } = useChat(
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

  const displayStatus = isThinkingPreview ? 'submitted' : status
  const displayMessages = isThinkingPreview ? DEV_THINKING_PREVIEW_MESSAGES : messages
  const isLoading = displayStatus === 'streaming' || displayStatus === 'submitted'

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

  const sendChatMessage = useCallback(async (text: string) => {
    const normalizedText = text.trim()
    if (!normalizedText || isLoading) return

    const userMessage: ChatMessage = {
      id: generateUUID(),
      role: 'user',
      parts: [{ type: 'text', text: normalizedText }],
    }

    if (!model) return
    await saveUserMessage(chatId, userMessage)
    sendMessage({ text: normalizedText })
  }, [chatId, generateUUID, isLoading, model, saveUserMessage, sendMessage, setMessages])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await sendChatMessage(inputValue)
    setInputValue('')
  }, [inputValue, sendChatMessage])

  // Handle quick prompt click
  const handlePromptClick = useCallback(async (prompt: string) => {
    await sendChatMessage(prompt)
  }, [sendChatMessage])

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
      <HeaderActionsPortal>
        <ChatHistory
          chats={chats}
          currentChatId={chatId}
          isOpen={historyOpen}
          onOpenChange={setHistoryOpen}
          onSelectChat={handleLoadChat}
          onDeleteChat={handleDeleteChat}
          onRenameChat={renameChat}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewChat}
          title="New Chat"
          aria-label="New Chat"
        >
          <IconPlus />
        </Button>
      </HeaderActionsPortal>

      <Messages
        messages={displayMessages}
        status={displayStatus}
        emptyState={emptyState}
      />

      {error && (
        <div className="px-6">
          <div className="max-w-3xl mx-auto">
            <ErrorMessage message={error.message} />
          </div>
        </div>
      )}

      <div className="shrink-0 bg-transparent px-4 pb-3">
        <div className="max-w-3xl mx-auto">
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onStop={() => void stop()}
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
