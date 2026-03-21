import { useState, useEffect, useCallback, useRef } from 'react'
import type { SeoData, PrebidData, GptData, GtmData, AnalyticsData } from '@/shared/types'
import { MessageType } from '@/shared/types/messages'

// Check if running in Chrome extension context
const isExtension = typeof chrome !== 'undefined' && chrome.tabs?.query

console.log('[WPD-Panel] useMessageListener module loaded, isExtension:', isExtension)

export function useMessageListener() {
  const [seoData, setSeoData] = useState<SeoData | null>(null)
  const [prebidData, setPrebidData] = useState<PrebidData | null>(null)
  const [gptData, setGptData] = useState<GptData | null>(null)
  const [gtmData, setGtmData] = useState<GtmData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(!isExtension ? false : true)
  const [currentTabId, setCurrentTabId] = useState<number | null>(null)
  const portRef = useRef<chrome.runtime.Port | null>(null)
  // currentTabId を ref で持つことでポートのクロージャから参照できるようにする
  const currentTabIdRef = useRef<number | null>(null)
  // サイドパネルが開かれたウィンドウのIDを保持（変更しない）
  const initialWindowIdRef = useRef<number | null>(null)

  // currentTabId が変わったら ref も更新
  useEffect(() => {
    currentTabIdRef.current = currentTabId
  }, [currentTabId])

  // ポート接続は一度だけ確立する（タブ切替のたびに再接続しない）
  useEffect(() => {
    if (!isExtension) return

    console.log('[WPD-Panel] Connecting to service worker...')
    const port = chrome.runtime.connect({ name: 'sidepanel' })
    portRef.current = port
    console.log('[WPD-Panel] Port connected')

    // リアルタイムメッセージ受信（currentTabIdRef で現在のタブをフィルタ）
    port.onMessage.addListener((message: { type: MessageType; tabId?: number; payload?: unknown }) => {
      console.log('[WPD-Panel] Received from port:', message.type, 'tabId:', message.tabId, 'currentTabId:', currentTabIdRef.current)
      if (message.tabId !== currentTabIdRef.current) {
        console.log('[WPD-Panel] Ignoring message for different tab')
        return
      }

      switch (message.type) {
        case MessageType.SEO_DATA:
          console.log('[WPD-Panel] Setting SEO data')
          setSeoData(message.payload as SeoData)
          setIsLoading(false)
          break
        case MessageType.PREBID_DATA:
          console.log('[WPD-Panel] Setting Prebid data')
          setPrebidData(message.payload as PrebidData)
          setIsLoading(false)
          break
        case MessageType.GPT_DATA:
          console.log('[WPD-Panel] Setting GPT data')
          setGptData(message.payload as GptData)
          setIsLoading(false)
          break
        case MessageType.GTM_DATA:
          console.log('[WPD-Panel] Setting GTM data')
          setGtmData(message.payload as GtmData)
          setIsLoading(false)
          break
        case MessageType.ANALYTICS_DATA:
          console.log('[WPD-Panel] Setting Analytics data')
          setAnalyticsData(message.payload as AnalyticsData)
          setIsLoading(false)
          break
      }
    })

    return () => {
      console.log('[WPD-Panel] Disconnecting port')
      port.disconnect()
      portRef.current = null
    }
  }, []) // ポートはマウント時に一度だけ接続

  // 現在のタブIDとウィンドウIDを取得して初期データリクエスト
  useEffect(() => {
    if (!isExtension) return
    console.log('[WPD-Panel] Querying active tab...')
    chrome.windows.getCurrent((win) => {
      initialWindowIdRef.current = win.id ?? null
      console.log('[WPD-Panel] Initial window ID:', initialWindowIdRef.current)
    })
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('[WPD-Panel] Active tab:', tabs[0]?.id)
      if (tabs[0]?.id) {
        setCurrentTabId(tabs[0].id)
        requestInitialData(tabs[0].id)
      }
    })
  }, [])

  // タブ切り替え監視（サイドパネルが開かれたウィンドウ内のみ）
  useEffect(() => {
    if (!isExtension) return

    const listener = (activeInfo: chrome.tabs.TabActiveInfo) => {
      // サイドパネルが開かれたウィンドウ以外のタブ変更は無視
      if (initialWindowIdRef.current !== null && activeInfo.windowId !== initialWindowIdRef.current) {
        console.log('[WPD-Panel] Ignoring tab change in different window:', activeInfo.windowId, '!==', initialWindowIdRef.current)
        return
      }

      console.log('[WPD-Panel] Tab changed in same window:', activeInfo.tabId)
      setCurrentTabId(activeInfo.tabId)
      setIsLoading(true)
      setSeoData(null)
      setPrebidData(null)
      setGptData(null)
      setGtmData(null)
      setAnalyticsData(null)
      requestInitialData(activeInfo.tabId)
    }

    chrome.tabs.onActivated.addListener(listener)
    return () => chrome.tabs.onActivated.removeListener(listener)
  }, [])

  // 初期データリクエスト（Service Workerのストアから取得 + Content Scriptに収集要求）
  const requestInitialData = useCallback(async (tabId: number) => {
    if (!isExtension) return
    console.log('[WPD-Panel] requestInitialData for tab:', tabId)
    setIsLoading(true)
    try {
      // まずService Workerのストアからデータ取得
      console.log('[WPD-Panel] Sending GET_TAB_DATA')
      const response = await chrome.runtime.sendMessage({
        type: MessageType.GET_TAB_DATA,
        tabId,
      })
      console.log('[WPD-Panel] GET_TAB_DATA response:', { hasSeo: !!response?.seo, hasPrebid: !!response?.prebid, hasGpt: !!response?.gpt })
      if (response) {
        setSeoData(response.seo || null)
        setPrebidData(response.prebid || null)
        setGptData(response.gpt || null)
        setGtmData(response.gtm || null)
        setAnalyticsData(response.analytics || null)
      }

      // キャッシュデータがあればローディング解除（ポート経由で最新データが来たら再更新）
      if (response?.seo) {
        console.log('[WPD-Panel] Cached data found, setting isLoading false')
        setIsLoading(false)
      }

      // 常に最新データをリクエスト（部分データ取得やSEO以外の欠落を防ぐ）
      console.log('[WPD-Panel] Sending REQUEST_REFRESH to ensure fresh data')
      chrome.runtime.sendMessage({
        type: MessageType.REQUEST_REFRESH,
        tabId,
      })
    } catch (e) {
      console.error('[WPD-Panel] Failed to get initial data:', e)
      setIsLoading(false)
    }
  }, [])

  // ページリロード（リフレッシュボタン用）
  const reloadPage = useCallback(async () => {
    if (!isExtension) return
    if (currentTabId) {
      setIsLoading(true)
      // データをクリア
      setSeoData(null)
      setPrebidData(null)
      setGptData(null)
      setGtmData(null)
      setAnalyticsData(null)
      // ページをリロード
      chrome.tabs.reload(currentTabId)
    }
  }, [currentTabId])

  return {
    seoData,
    prebidData,
    gptData,
    gtmData,
    analyticsData,
    isLoading,
    reloadPage,
    tabId: currentTabId,
  }
}
