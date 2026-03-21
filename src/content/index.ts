import { collectSeoData } from './collectors/seo'
import { initPrebidCollector, getPrebidData, requestPrebidDataCollection } from './collectors/prebid'
import { initGptCollector, getGptData, requestGptDataCollection } from './collectors/gpt'
import { initGtmCollector, getGtmData } from './collectors/gtm'
import { initAnalyticsCollector, getAnalyticsData } from './collectors/analytics'
import { collectTechStackFromDOM } from './collectors/techstack'
import { isContextValid, safeSendMessage } from './utils/safe-messaging'
import type { TechStackItem } from '@/shared/types/techstack'

// Debug flag - set to true for development logging
const DEBUG = false
function log(...args: unknown[]) {
  if (DEBUG) console.log(...args)
}

log('[WPD] Content script loaded')

// Content Script はサイドパネルから COLLECT_DATA を受け取るまで初期化しない
let initialized = false

// Message types (duplicated to avoid external imports that break content script bundling)
const MessageType = {
  SEO_DATA: 'SEO_DATA',
  PREBID_DATA: 'PREBID_DATA',
  GPT_DATA: 'GPT_DATA',
  GTM_DATA: 'GTM_DATA',
  ANALYTICS_DATA: 'ANALYTICS_DATA',
  TECH_STACK_DATA: 'TECH_STACK_DATA',
  COLLECT_DATA: 'COLLECT_DATA',
  PREBID_QUERY: 'PREBID_QUERY',
  PREBID_QUERY_RESULT: 'PREBID_QUERY_RESULT',
} as const

// Pending query callbacks for Prebid queries
const pendingQueries = new Map<string, (response: unknown) => void>()

// injected.ts からの TechStack グローバル検出結果を受信
window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (event.data?.type === 'WPD_TECHSTACK_DATA') {
    const { payload } = event.data as { payload: { items: Array<{ name: string; version?: string; category: string }>; detectedAt: number } }
    const globalItems: TechStackItem[] = payload.items.map((item) => ({
      name: item.name,
      version: item.version,
      category: item.category as TechStackItem['category'],
      detectedBy: 'global' as const,
    }))

    // injected が検出した技術名のセットを evaluator に渡す
    // → 複数シグナル持つシグネチャ（WordPress等）が global check でもヒットする
    const detectedGlobals = new Set(globalItems.map((i) => i.name))
    const allItems = collectTechStackFromDOM(detectedGlobals)

    // global 検出済みのものはバージョン情報をマージして優先、それ以外は DOM/URL 検出分を追加
    const globalMap = new Map(globalItems.map((i) => [i.name, i]))
    const merged: TechStackItem[] = allItems.map((item) => {
      const g = globalMap.get(item.name)
      return g ? { ...item, version: g.version, detectedBy: g.detectedBy } : item
    })

    safeSendMessage({
      type: MessageType.TECH_STACK_DATA,
      payload: {
        items: merged,
        detectedAt: payload.detectedAt,
      },
    })
    log('[WPD] TechStack sent:', merged.length, 'items')
  }
})

// 設定を取得
async function getSettings() {
  if (!isContextValid()) {
    return {
      enableAdTech: true,
      enableGtm: true,
      enableSeo: true,
      enableAnalytics: true,
    }
  }
  try {
    const result = await chrome.storage.local.get(['settings'])
    return result.settings || {
      enableAdTech: true,
      enableGtm: true,
      enableSeo: true,
      enableAnalytics: true,
    }
  } catch {
    return {
      enableAdTech: true,
      enableGtm: true,
      enableSeo: true,
      enableAnalytics: true,
    }
  }
}

// データ収集を実行
async function collectAllData() {
  log('[WPD] collectAllData called')
  const settings = await getSettings()

  // SEOデータ（常に即座に収集可能）
  if (settings.enableSeo) {
    const seoData = collectSeoData()
    log('[WPD] SEO data collected:', seoData.title)
    safeSendMessage({
      type: MessageType.SEO_DATA,
      payload: seoData,
    })
  }

  // Prebidデータ（既に初期化済みなら取得）
  if (settings.enableAdTech) {
    const prebidData = getPrebidData()
    if (prebidData.detected) {
      log('[WPD] Prebid data collected')
      safeSendMessage({
        type: MessageType.PREBID_DATA,
        payload: prebidData,
      })
    }

    // GPTデータ
    const gptData = getGptData()
    if (gptData.detected) {
      log('[WPD] GPT data collected')
      safeSendMessage({
        type: MessageType.GPT_DATA,
        payload: gptData,
      })
    }
  }

  // GTMデータ
  if (settings.enableGtm) {
    const gtmData = getGtmData()
    if (gtmData.detected || gtmData.dataLayerEvents.length > 0) {
      log('[WPD] GTM data collected:', gtmData.containerId)
      safeSendMessage({
        type: MessageType.GTM_DATA,
        payload: gtmData,
      })
    }
  }

  // Analyticsデータ
  if (settings.enableAnalytics) {
    const analyticsData = getAnalyticsData()
    if (analyticsData.ga4 || analyticsData.pixels.length > 0) {
      log('[WPD] Analytics data collected')
      safeSendMessage({
        type: MessageType.ANALYTICS_DATA,
        payload: analyticsData,
      })
    }
  }
}

// 初期化
async function init() {
  log('[WPD] init called')
  const settings = await getSettings()

  // 各Collectorを初期化
  if (settings.enableAdTech) {
    initPrebidCollector()
    initGptCollector()
  }

  if (settings.enableGtm) {
    initGtmCollector()
  }

  if (settings.enableAnalytics) {
    initAnalyticsCollector()
  }

  // DOMContentLoadedでSEOデータを収集
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      log('[WPD] DOMContentLoaded fired')
      if (settings.enableSeo) {
        const seoData = collectSeoData()
        log('[WPD] SEO data collected on DOMContentLoaded:', seoData.title)
        safeSendMessage({
          type: MessageType.SEO_DATA,
          payload: seoData,
        })
      }
    })
  } else {
    // 既にロード済み
    log('[WPD] Document already loaded')
    if (settings.enableSeo) {
      const seoData = collectSeoData()
      log('[WPD] SEO data collected immediately:', seoData.title)
      safeSendMessage({
        type: MessageType.SEO_DATA,
        payload: seoData,
      })
    }
  }
}

// Service Workerからのメッセージを受信
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  log('[WPD] Received message from SW:', message.type)

  if (message.type === MessageType.COLLECT_DATA) {
    if (!initialized) {
      // 初回: コレクターを初期化し、injected.jsを注入
      initialized = true
      init()
      // init() は injected.ts を注入し、Prebid/GPT を非同期検出する
      // 検出後にイベント駆動でデータが自動送信される
      // SEO データは init() 内で即座に収集・送信される
    } else {
      // 既に初期化済み → 再収集のみ
      // SPA遷移直後は Prebid/GPT が未準備の場合があるため余裕を持たせる
      requestPrebidDataCollection()
      requestGptDataCollection()
      // TechStack も再評価（SPA遷移で新技術が追加される可能性）
      window.postMessage({ type: 'WPD_REQUEST_TECHSTACK' }, '*')
      setTimeout(() => {
        collectAllData()
        // 遅延ロードを考慮して 2 秒後にも再評価
        window.postMessage({ type: 'WPD_REQUEST_TECHSTACK' }, '*')
      }, 1000)
    }
    return
  }

  // Prebid Query: Side Panel -> SW -> Content Script -> Injected Script
  if (message.type === MessageType.PREBID_QUERY) {
    const { payload } = message as { payload: { requestId: string; queryType: string; params: unknown } }
    log('[WPD] Prebid query received:', payload.queryType, payload.requestId)

    // Register callback for this query
    pendingQueries.set(payload.requestId, (response) => {
      log('[WPD] Prebid query response:', payload.requestId)
      sendResponse(response)
    })

    // Forward to injected script
    window.postMessage({
      type: 'WPD_PREBID_QUERY',
      payload,
    }, '*')

    // Return true to indicate async response
    return true
  }
})

// Listen for Prebid query results from injected script
window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (event.data.type === 'WPD_PREBID_QUERY_RESULT') {
    const { payload } = event.data as { payload: { requestId: string; success: boolean; data?: unknown; error?: string } }
    log('[WPD] Prebid query result from injected:', payload.requestId, payload.success)

    const callback = pendingQueries.get(payload.requestId)
    if (callback) {
      callback(payload)
      pendingQueries.delete(payload.requestId)
    }
  }
})

// 初期化はサイドパネルからの COLLECT_DATA メッセージで遅延実行される
// init() は呼ばない
