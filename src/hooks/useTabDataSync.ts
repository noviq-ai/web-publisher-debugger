import { useEffect, useCallback, useRef } from 'react'
import { MessageType } from '@/shared/types/messages'
import type { SeoData, PrebidData, GptData, GtmData, AnalyticsData, TechStackData } from '@/shared/types'
import { useTabDataStore } from '@/store/tabDataStore'

// Check if running in Chrome extension context
const isExtension = typeof chrome !== 'undefined' && chrome.tabs?.query

const COLLECTION_TIMEOUT_MS = 10000
const RECONNECT_DELAY_MS = 500

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
  const unmountedRef = useRef(false)

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

  // ポートメッセージハンドラ（connectPort から参照するため先に定義）
  const handlePortMessage = useCallback((message: { type: MessageType; tabId?: number; payload?: unknown }) => {
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
  }, [clearCollectionTimeout, setSeoData, setPrebidData, setGptData, setGtmData, setAnalyticsData, setTechStackData, setStatus])

  // ポート接続・切断検知・自動再接続
  const connectPort = useCallback(() => {
    if (unmountedRef.current) return

    try {
      const port = chrome.runtime.connect({ name: 'sidepanel' })
      portRef.current = port

      port.onMessage.addListener(handlePortMessage)

      port.onDisconnect.addListener(() => {
        portRef.current = null
        if (unmountedRef.current) return

        // Service Worker 再起動後に自動再接続
        setTimeout(() => {
          if (!unmountedRef.current) {
            connectPort()
            // 再接続後、現在のタブのデータを再リクエスト
            const tabId = currentTabIdRef.current
            if (tabId) {
              chrome.runtime.sendMessage({ type: MessageType.REQUEST_REFRESH, tabId }).catch(() => {})
            }
          }
        }, RECONNECT_DELAY_MS)
      })
    } catch {
      // Extension context invalidated — retry after delay
      setTimeout(() => {
        if (!unmountedRef.current) connectPort()
      }, RECONNECT_DELAY_MS)
    }
  }, [handlePortMessage])

  // ポート接続（マウント時に一度だけ）
  useEffect(() => {
    if (!isExtension) {
      setStatus('ready')
      return
    }

    unmountedRef.current = false
    connectPort()

    return () => {
      unmountedRef.current = true
      if (portRef.current) {
        portRef.current.disconnect()
        portRef.current = null
      }
      clearCollectionTimeout()
    }
  }, [connectPort, clearCollectionTimeout, setStatus])

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

    // タブリロード完了後に requestInitialData を実行
    const listener = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (tabId !== currentTabId || changeInfo.status !== 'complete') return
      chrome.tabs.onUpdated.removeListener(listener)
      requestInitialData(currentTabId)
    }
    chrome.tabs.onUpdated.addListener(listener)

    chrome.tabs.reload(currentTabId)
  }, [setStatus, startTimeout, resetData, requestInitialData])

  return { reloadPage }
}
