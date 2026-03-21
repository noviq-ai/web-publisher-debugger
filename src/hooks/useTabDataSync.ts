import { useEffect, useCallback, useRef } from 'react'
import { MessageType } from '@/shared/types/messages'
import type { SeoData, PrebidData, GptData, GtmData, AnalyticsData, TechStackData } from '@/shared/types'
import { useTabDataStore } from '@/store/tabDataStore'

// Check if running in Chrome extension context
const isExtension = typeof chrome !== 'undefined' && chrome.tabs?.query

const COLLECTION_TIMEOUT_MS = 10000

/**
 * Chrome拡張のポート接続・タブ監視を行い、データをストアに書き込む副作用フック。
 * App のトップレベルで一度だけ呼ぶこと。
 */
export function useTabDataSync() {
  const {
    setSeoData,
    setPrebidData,
    setGptData,
    setGtmData,
    setAnalyticsData,
    setTechStackData,
    setStatus,
    setCurrentTabId,
    resetData,
    applyCache,
  } = useTabDataStore.getState()

  const portRef = useRef<chrome.runtime.Port | null>(null)
  const currentTabIdRef = useRef<number | null>(null)
  const initialWindowIdRef = useRef<number | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const startTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const { status } = useTabDataStore.getState()
      if (status === 'connecting' || status === 'loading') {
        setStatus('error')
      }
    }, COLLECTION_TIMEOUT_MS)
  }, [setStatus])

  const clearCollectionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // ポート接続（マウント時に一度だけ）
  useEffect(() => {
    if (!isExtension) {
      setStatus('ready')
      return
    }

    const port = chrome.runtime.connect({ name: 'sidepanel' })
    portRef.current = port

    port.onMessage.addListener((message: { type: MessageType; tabId?: number; payload?: unknown }) => {
      if (message.tabId !== currentTabIdRef.current) return

      clearCollectionTimeout()
      setStatus('ready')

      switch (message.type) {
        case MessageType.SEO_DATA:
          setSeoData(message.payload as SeoData)
          break
        case MessageType.PREBID_DATA:
          setPrebidData(message.payload as PrebidData)
          break
        case MessageType.GPT_DATA:
          setGptData(message.payload as GptData)
          break
        case MessageType.GTM_DATA:
          setGtmData(message.payload as GtmData)
          break
        case MessageType.ANALYTICS_DATA:
          setAnalyticsData(message.payload as AnalyticsData)
          break
        case MessageType.TECH_STACK_DATA:
          setTechStackData(message.payload as TechStackData)
          break
      }
    })

    return () => {
      port.disconnect()
      portRef.current = null
      clearCollectionTimeout()
    }
  }, [clearCollectionTimeout, setSeoData, setPrebidData, setGptData, setGtmData, setAnalyticsData, setTechStackData, setStatus])

  // 初期データリクエスト
  const requestInitialData = useCallback(async (tabId: number) => {
    if (!isExtension) return
    setStatus('connecting')
    startTimeout()

    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.GET_TAB_DATA,
        tabId,
      })

      if (response) {
        applyCache({
          seoData: response.seo ?? null,
          prebidData: response.prebid ?? null,
          gptData: response.gpt ?? null,
          gtmData: response.gtm ?? null,
          analyticsData: response.analytics ?? null,
          techStackData: response.techStack ?? null,
        })
      }

      // いずれかキャッシュがあれば loading へ（ポートデータ到着で ready になる）
      const hasCachedData = !!(response?.seo || response?.prebid || response?.gpt || response?.gtm || response?.analytics || response?.techStack)
      if (hasCachedData) {
        setStatus('loading')
      }

      // 常に最新データをリクエスト
      chrome.runtime.sendMessage({ type: MessageType.REQUEST_REFRESH, tabId })
    } catch (e) {
      console.error('[WPD] Failed to get initial data:', e)
      setStatus('error')
      clearCollectionTimeout()
    }
  }, [setStatus, startTimeout, clearCollectionTimeout, applyCache])

  // 初期タブ取得
  useEffect(() => {
    if (!isExtension) return
    chrome.windows.getCurrent((win) => {
      initialWindowIdRef.current = win.id ?? null
    })
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        currentTabIdRef.current = tabs[0].id
        setCurrentTabId(tabs[0].id)
        requestInitialData(tabs[0].id)
      }
    })
  }, [requestInitialData, setCurrentTabId])

  // タブ切り替え監視
  useEffect(() => {
    if (!isExtension) return

    const listener = (activeInfo: chrome.tabs.TabActiveInfo) => {
      if (initialWindowIdRef.current !== null && activeInfo.windowId !== initialWindowIdRef.current) return

      currentTabIdRef.current = activeInfo.tabId
      setCurrentTabId(activeInfo.tabId)
      resetData()
      requestInitialData(activeInfo.tabId)
    }

    chrome.tabs.onActivated.addListener(listener)
    return () => chrome.tabs.onActivated.removeListener(listener)
  }, [requestInitialData, setCurrentTabId, resetData])

  // リロードボタン用
  const reloadPage = useCallback(() => {
    if (!isExtension) return
    const { currentTabId } = useTabDataStore.getState()
    if (!currentTabId) return

    setStatus('connecting')
    startTimeout()
    resetData()
    chrome.tabs.reload(currentTabId)
  }, [setStatus, startTimeout, resetData])

  return { reloadPage }
}
