// このファイルはページコンテキストで実行される
// Prebid.js, dataLayer, gtag などのグローバル変数にアクセスするため

// ========================================
// Performance Configuration
// ========================================
const DEBUG = false // Set to true for development logging
const THROTTLE_INTERVAL = 100 // ms - dataLayer/pixel events throttle
const PREBID_CHECK_INTERVAL = 500 // ms - Prebid detection polling (was 100ms)
const GPT_CHECK_INTERVAL = 500 // ms - GPT detection polling (was 100ms)
const MAX_WAIT_TIME = 10000 // ms - max wait for Prebid/GPT detection

// Conditional logging
function log(...args: unknown[]) {
  if (DEBUG) console.log(...args)
}

declare global {
  interface Window {
    pbjs?: {
      version?: string
      adUnits?: unknown[]
      installedModules?: string[]
      getConfig: (key?: string) => unknown
      getBidResponses: () => Record<string, { bids: unknown[] }>
      getAllWinningBids?: () => unknown[]
      getAllPrebidWinningBids?: () => unknown[]
      getHighestCpmBids?: (adUnitCode?: string) => unknown[]
      getNoBids?: () => unknown[]
      getNoBidsForAdUnitCode?: (adUnitCode: string) => unknown[]
      getAdserverTargeting?: (adUnitCode?: string) => Record<string, Record<string, string>>
      getUserIds?: () => Record<string, unknown>
      getUserIdsAsEids?: () => unknown[]
      getConsentMetadata?: () => unknown
      getEvents?: () => unknown[]
      onEvent: (eventType: string, callback: (data: unknown) => void) => void
      aliasRegistry?: Record<string, string>
      bidderSettings?: Record<string, unknown>
    }
    googletag?: {
      apiReady?: boolean
      pubadsReady?: boolean
      cmd: Array<() => void>
      getVersion?: () => string
      pubads: () => {
        getSlots: () => GptSlotInterface[]
        getTargeting: (key: string) => string[]
        getTargetingKeys: () => string[]
        isInitialLoadDisabled?: () => boolean
        addEventListener: (eventType: string, callback: (event: unknown) => void) => void
        enableLazyLoad?: (config?: unknown) => void
        getPrivacySettingsToken?: () => string | null
      }
      openConsole?: (slotId?: string) => void
    }
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    // Meta Pixel (Facebook)
    fbq?: {
      (...args: unknown[]): void
      getState?: () => { pixels: { id: string }[] }
      queue?: unknown[]
    }
    // Twitter/X Pixel
    twq?: {
      (...args: unknown[]): void
      exe?: (...args: unknown[]) => void
      queue?: unknown[]
      version?: string
    }
    // TikTok Pixel
    ttq?: {
      (...args: unknown[]): void
      methods?: string[]
      setAndDefer?: (t: unknown, e: string) => void
      instance?: (id: string) => unknown
      instances?: Record<string, unknown>
      _i?: Record<string, unknown>
      load?: (pixelId: string, options?: unknown) => void
      page?: () => void
      track?: (eventName: string, params?: unknown) => void
      identify?: (params: unknown) => void
      enableCookie?: () => void
      disableCookie?: () => void
    }
    // LinkedIn Insight Tag
    _linkedin_partner_id?: string
    lintrk?: {
      (...args: unknown[]): void
      q?: unknown[]
    }
    // Pinterest Tag
    pintrk?: {
      (...args: unknown[]): void
      queue?: unknown[]
      version?: string
    }
    // Criteo OneTag
    criteo_q?: Array<{ event: string; [key: string]: unknown }>
    // Snap Pixel
    snaptr?: {
      (...args: unknown[]): void
      _: unknown[]
      version?: string
    }
  }
}

// GPT Slot インターフェース
interface GptSlotInterface {
  getSlotElementId: () => string
  getAdUnitPath: () => string
  getSizes: () => Array<{ getWidth: () => number | 'fluid'; getHeight: () => number | 'fluid' } | string>
  getTargeting: (key: string) => string[]
  getTargetingKeys: () => string[]
  getResponseInformation: () => {
    advertiserId: number | null
    campaignId: number | null
    creativeId: number | null
    lineItemId: number | null
    sourceAgnosticCreativeId: number | null
    sourceAgnosticLineItemId: number | null
    isBackfill: boolean
    creativeTemplateId: number | null
  } | null
}

;(function () {
  log('[WPD-Injected] Script loaded')

  // ========================================
  // Initialization Guard (prevent duplicate hooks)
  // ========================================
  const WPD_INITIALIZED_KEY = '__wpd_injected_initialized__'
  if ((window as unknown as Record<string, boolean>)[WPD_INITIALIZED_KEY]) {
    log('[WPD-Injected] Already initialized, skipping')
    return
  }
  (window as unknown as Record<string, boolean>)[WPD_INITIALIZED_KEY] = true

  // ========================================
  // Throttle utility
  // ========================================
  function throttle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
    let lastCall = 0
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    return ((...args: unknown[]) => {
      const now = Date.now()
      const remaining = delay - (now - lastCall)
      if (remaining <= 0) {
        lastCall = now
        fn(...args)
      } else if (!timeoutId) {
        timeoutId = setTimeout(() => {
          lastCall = Date.now()
          timeoutId = null
          fn(...args)
        }, remaining)
      }
    }) as T
  }

  // 関数を除外してシリアライズ可能にするヘルパー（軽量版）
  function safeClone<T>(obj: T, maxDepth = 5): T | null {
    if (obj === null || obj === undefined) return obj as T
    if (maxDepth <= 0) return null

    try {
      // Primitive types - no cloning needed
      const type = typeof obj
      if (type === 'string' || type === 'number' || type === 'boolean') {
        return obj
      }
      // For complex objects, use JSON (but limit depth via stringify replacer is complex)
      // Fallback to simple JSON clone for now
      return JSON.parse(JSON.stringify(obj))
    } catch {
      return null
    }
  }

  // ==========================================
  // Prebid.js Hooks
  // ==========================================
  let waitTime = 0

  // Prebid.jsが完全に初期化されているかチェック
  function isPrebidReady(): boolean {
    const pbjs = window.pbjs
    if (!pbjs) return false
    // getConfigが関数として存在するかチェック（スタブではなく本物のPrebid）
    return typeof pbjs.getConfig === 'function'
  }

  function waitForPrebid() {
    if (isPrebidReady()) {
      log('[WPD-Injected] Prebid.js found, version:', window.pbjs!.version)
      initPrebidHooks()
    } else if (waitTime < MAX_WAIT_TIME) {
      waitTime += PREBID_CHECK_INTERVAL
      setTimeout(waitForPrebid, PREBID_CHECK_INTERVAL)
    } else {
      log('[WPD-Injected] Prebid.js not found after', MAX_WAIT_TIME, 'ms')
      window.postMessage({ type: 'WPD_PREBID_NOT_FOUND' }, '*')
    }
  }

  function initPrebidHooks() {
    log('[WPD-Injected] Initializing Prebid hooks')
    const pbjs = window.pbjs!

    // ========================================
    // Phase 1: 即座に取得可能なデータを送信
    // pbjs検出時点で adUnits, config, modules は取得可能
    // ========================================
    sendInitialData()

    // onEventが存在しない場合はイベントリスナーをスキップ
    if (typeof pbjs.onEvent !== 'function') {
      log('[WPD-Injected] pbjs.onEvent not available, skipping event hooks')
      // イベントがない場合は500ms後にフルデータ収集
      setTimeout(() => collectFullPrebidData(), 500)
      return
    }

    // ========================================
    // Phase 2: auctionInit - Bidder一覧が確定
    // adUnitsからBidder情報を取得（オークション開始時）
    // イベントのdataにはadUnitsが含まれる（requestBidsに渡された場合でも）
    // ========================================
    pbjs.onEvent('auctionInit', (rawData: unknown) => {
      log('[WPD-Injected] auctionInit event')
      sendPrebidEvent('AUCTION_INIT', rawData)
      // auctionInitのdataからadUnitsを取得（requestBidsに直接渡された場合に対応）
      const data = rawData as { adUnits?: unknown[] } | null
      if (data && Array.isArray(data.adUnits) && data.adUnits.length > 0) {
        sendInitialDataWithAdUnits(data.adUnits)
      } else {
        sendInitialData()
      }
    })

    // ========================================
    // Phase 3: auctionEnd - 入札結果が確定
    // getBidResponses, getNoBids, getHighestCpmBids が利用可能
    // auctionEndのdataにもadUnitsが含まれる
    // ========================================
    pbjs.onEvent('auctionEnd', (rawData: unknown) => {
      log('[WPD-Injected] auctionEnd event')
      sendPrebidEvent('AUCTION_END', rawData)
      // auctionEndのdataからadUnitsを取得して渡す
      const data = rawData as { adUnits?: unknown[] } | null
      const eventAdUnits = (data && Array.isArray(data.adUnits)) ? data.adUnits : []
      setTimeout(() => collectFullPrebidData(eventAdUnits), 100)
    })

    // ========================================
    // Phase 4: bidWon - 勝利＆レンダリング完了
    // getAllWinningBids が更新される
    // ========================================
    pbjs.onEvent('bidWon', (data) => {
      log('[WPD-Injected] bidWon event')
      sendPrebidEvent('BID_WON', data)
      // bidWon後にwinning bidsを更新
      sendWinningBidsUpdate()
    })

    // その他のイベント（統計用）
    pbjs.onEvent('bidRequested', (data) => {
      sendPrebidEvent('BID_REQUESTED', data)
    })

    pbjs.onEvent('bidResponse', (data) => {
      sendPrebidEvent('BID_RESPONSE', data)
    })

    pbjs.onEvent('bidTimeout', (data) => {
      sendPrebidEvent('BID_TIMEOUT', data)
    })

    // Content Scriptからの再収集リクエストを受け付ける
    window.addEventListener('message', (event) => {
      if (event.source !== window) return
      if (event.data.type === 'WPD_COLLECT_PREBID') {
        log('[WPD-Injected] Received collect request from content script')
        collectFullPrebidData()
      }
    })

    // 初期データ送信後、少し待ってからフルデータも収集
    // （既にオークションが完了している可能性があるため）
    setTimeout(() => collectFullPrebidData(), 500)
  }

  /**
   * Phase 1: 即座に取得可能なデータを送信
   * - version, config, installedModules, adUnits, aliasRegistry, bidderSettings
   * - オークション前から利用可能
   */
  function sendInitialData() {
    const pbjs = window.pbjs
    if (!pbjs) return

    log('[WPD-Injected] Sending initial data')

    // User IDs (ID Module) - 初期化後から利用可能
    let userIds: Record<string, unknown> | null = null
    let userIdsAsEids: unknown[] = []
    try {
      if (typeof pbjs.getUserIds === 'function') {
        userIds = pbjs.getUserIds() || null
      }
      if (typeof pbjs.getUserIdsAsEids === 'function') {
        userIdsAsEids = pbjs.getUserIdsAsEids() || []
      }
    } catch (e) {
      log('[WPD-Injected] Error getting user IDs:', e)
    }

    // 同意管理メタデータ - CMP初期化後から利用可能
    let consentMetadata: unknown = null
    try {
      if (typeof pbjs.getConsentMetadata === 'function') {
        consentMetadata = pbjs.getConsentMetadata() || null
      }
    } catch (e) {
      log('[WPD-Injected] Error getting consent metadata:', e)
    }

    const data = {
      phase: 'initial' as const,
      version: pbjs.version || null,
      config: {
        timeout: pbjs.getConfig('bidderTimeout'),
        priceGranularity: pbjs.getConfig('priceGranularity'),
        consentManagement: !!pbjs.getConfig('consentManagement'),
        userSync: safeClone(pbjs.getConfig('userSync')),
        debug: !!pbjs.getConfig('debug'),
        useBidCache: pbjs.getConfig('useBidCache') !== false,
        deviceAccess: pbjs.getConfig('deviceAccess') !== false,
        s2sConfig: safeClone(pbjs.getConfig('s2sConfig')),
      },
      installedModules: pbjs.installedModules || [],
      adUnits: safeClone(pbjs.adUnits) || [],
      aliasRegistry: safeClone(pbjs.aliasRegistry) || {},
      bidderSettings: safeClone(pbjs.bidderSettings) || {},
      userIds: userIds ? {
        ids: safeClone(userIds),
        eids: safeClone(userIdsAsEids),
      } : null,
      consentMetadata: safeClone(consentMetadata),
    }

    log('[WPD-Injected] Initial data:', {
      version: data.version,
      adUnitsCount: data.adUnits?.length || 0,
      modulesCount: data.installedModules.length,
      biddersFromAdUnits: extractBiddersFromAdUnits(data.adUnits),
    })

    window.postMessage({
      type: 'WPD_PREBID_INITIAL',
      payload: data,
    }, '*')
  }

  /**
   * auctionInitイベントから取得したadUnitsを使って初期データを送信
   * requestBids({ adUnits: [...] }) で直接渡された場合に対応
   */
  function sendInitialDataWithAdUnits(eventAdUnits: unknown[]) {
    const pbjs = window.pbjs
    if (!pbjs) return

    log('[WPD-Injected] Sending initial data with event adUnits')

    // User IDs (ID Module)
    let userIds: Record<string, unknown> | null = null
    let userIdsAsEids: unknown[] = []
    try {
      if (typeof pbjs.getUserIds === 'function') {
        userIds = pbjs.getUserIds() || null
      }
      if (typeof pbjs.getUserIdsAsEids === 'function') {
        userIdsAsEids = pbjs.getUserIdsAsEids() || []
      }
    } catch (e) {
      log('[WPD-Injected] Error getting user IDs:', e)
    }

    // 同意管理メタデータ
    let consentMetadata: unknown = null
    try {
      if (typeof pbjs.getConsentMetadata === 'function') {
        consentMetadata = pbjs.getConsentMetadata() || null
      }
    } catch (e) {
      log('[WPD-Injected] Error getting consent metadata:', e)
    }

    // pbjs.adUnitsとeventAdUnitsをマージ（重複除去）
    const rawPbjsAdUnits = safeClone(pbjs.adUnits)
    const pbjsAdUnits = Array.isArray(rawPbjsAdUnits) ? rawPbjsAdUnits : []
    const rawEventAdUnits = safeClone(eventAdUnits)
    const eventAdUnitsCloned = Array.isArray(rawEventAdUnits) ? rawEventAdUnits : []
    const mergedAdUnits = mergeAdUnits(pbjsAdUnits, eventAdUnitsCloned)

    const data = {
      phase: 'initial' as const,
      version: pbjs.version || null,
      config: {
        timeout: pbjs.getConfig('bidderTimeout'),
        priceGranularity: pbjs.getConfig('priceGranularity'),
        consentManagement: !!pbjs.getConfig('consentManagement'),
        userSync: safeClone(pbjs.getConfig('userSync')),
        debug: !!pbjs.getConfig('debug'),
        useBidCache: pbjs.getConfig('useBidCache') !== false,
        deviceAccess: pbjs.getConfig('deviceAccess') !== false,
        s2sConfig: safeClone(pbjs.getConfig('s2sConfig')),
      },
      installedModules: pbjs.installedModules || [],
      adUnits: mergedAdUnits,
      aliasRegistry: safeClone(pbjs.aliasRegistry) || {},
      bidderSettings: safeClone(pbjs.bidderSettings) || {},
      userIds: userIds ? {
        ids: safeClone(userIds),
        eids: safeClone(userIdsAsEids),
      } : null,
      consentMetadata: safeClone(consentMetadata),
    }

    log('[WPD-Injected] Initial data with event adUnits:', {
      version: data.version,
      adUnitsCount: data.adUnits?.length || 0,
      pbjsAdUnitsCount: pbjsAdUnits.length,
      eventAdUnitsCount: eventAdUnitsCloned.length,
      biddersFromAdUnits: extractBiddersFromAdUnits(data.adUnits),
    })

    window.postMessage({
      type: 'WPD_PREBID_INITIAL',
      payload: data,
    }, '*')
  }

  /**
   * adUnitsをマージ（codeで重複除去）
   */
  function mergeAdUnits(arr1: unknown[], arr2: unknown[]): unknown[] {
    const codeSet = new Set<string>()
    const result: unknown[] = []

    const addUnits = (arr: unknown[]) => {
      for (const unit of arr) {
        const u = unit as { code?: string }
        if (u.code && !codeSet.has(u.code)) {
          codeSet.add(u.code)
          result.push(unit)
        }
      }
    }

    addUnits(arr1)
    addUnits(arr2)
    return result
  }

  /**
   * Phase 3: オークション後のフルデータを収集
   * - getBidResponses, getNoBids, getHighestCpmBids, getAdserverTargeting
   * - getAllPrebidWinningBids (まだレンダリングされていない勝者)
   * @param eventAdUnits auctionEndイベントから取得したadUnits（オプション）
   */
  function collectFullPrebidData(eventAdUnits: unknown[] = []) {
    const pbjs = window.pbjs
    if (!pbjs) return

    log('[WPD-Injected] Collecting full Prebid data')

    // getBidResponses() から全入札を抽出
    let allBids: unknown[] = []
    let bidResponses: Record<string, unknown> = {}
    try {
      bidResponses = pbjs.getBidResponses() || {}
      Object.entries(bidResponses).forEach(([_adUnitCode, adUnitData]) => {
        if (adUnitData && typeof adUnitData === 'object') {
          const bids = Array.isArray(adUnitData)
            ? adUnitData
            : (adUnitData as { bids?: unknown[] }).bids || []
          allBids.push(...bids)
        }
      })
    } catch (e) {
      log('[WPD-Injected] Error getting bids:', e)
    }

    // Prebid勝者（まだレンダリングされていない）
    let prebidWinningBids: unknown[] = []
    try {
      if (typeof pbjs.getAllPrebidWinningBids === 'function') {
        const rawPWB = pbjs.getAllPrebidWinningBids()
        prebidWinningBids = Array.isArray(rawPWB) ? rawPWB : []
      }
    } catch (e) {
      log('[WPD-Injected] Error getting prebid winning bids:', e)
    }

    // 入札なし情報
    let noBids: unknown[] = []
    try {
      if (typeof pbjs.getNoBids === 'function') {
        const raw = pbjs.getNoBids()
        noBids = Array.isArray(raw) ? raw : []
      }
    } catch (e) {
      log('[WPD-Injected] Error getting no bids:', e)
    }

    // 最高CPM入札
    let highestCpmBids: unknown[] = []
    try {
      if (typeof pbjs.getHighestCpmBids === 'function') {
        const rawHCB = pbjs.getHighestCpmBids()
        highestCpmBids = Array.isArray(rawHCB) ? rawHCB : []
      }
    } catch (e) {
      log('[WPD-Injected] Error getting highest CPM bids:', e)
    }

    // アドサーバーターゲティング
    let adserverTargeting: Record<string, Record<string, string>> = {}
    try {
      if (typeof pbjs.getAdserverTargeting === 'function') {
        adserverTargeting = pbjs.getAdserverTargeting() || {}
      }
    } catch (e) {
      log('[WPD-Injected] Error getting adserver targeting:', e)
    }

    // レンダリング済み勝者
    let winningBids: unknown[] = []
    try {
      if (typeof pbjs.getAllWinningBids === 'function') {
        const rawWB = pbjs.getAllWinningBids()
        winningBids = Array.isArray(rawWB) ? rawWB : []
      }
    } catch (e) {
      log('[WPD-Injected] Error getting winning bids:', e)
    }

    // イベント履歴
    let prebidEvents: unknown[] = []
    try {
      if (typeof pbjs.getEvents === 'function') {
        const rawPE = pbjs.getEvents()
        prebidEvents = Array.isArray(rawPE) ? rawPE : []
      }
    } catch (e) {
      log('[WPD-Injected] Error getting events:', e)
    }

    // adUnitsを再取得（動的に追加される場合があるため）
    // pbjs.adUnitsとeventAdUnitsをマージ
    const rawPbjsAdUnits2 = safeClone(pbjs.adUnits)
    const pbjsAdUnits = Array.isArray(rawPbjsAdUnits2) ? rawPbjsAdUnits2 : []
    const rawEventAdUnits2 = safeClone(eventAdUnits)
    const eventAdUnitsCloned = Array.isArray(rawEventAdUnits2) ? rawEventAdUnits2 : []
    const mergedAdUnits = mergeAdUnits(pbjsAdUnits, eventAdUnitsCloned)

    const data = {
      phase: 'auction_end' as const,
      adUnits: mergedAdUnits,
      bidResponses: safeClone(bidResponses),
      allBids: safeClone(allBids),
      winningBids: safeClone(winningBids),
      prebidWinningBids: safeClone(prebidWinningBids),
      noBids: safeClone(noBids),
      highestCpmBids: safeClone(highestCpmBids),
      adserverTargeting: safeClone(adserverTargeting),
      prebidEvents: safeClone(prebidEvents),
    }

    log('[WPD-Injected] Auction data:', {
      bidsCount: allBids.length,
      noBidsCount: noBids.length,
      winningBidsCount: winningBids.length,
      prebidWinningBidsCount: prebidWinningBids.length,
      adUnitsCount: mergedAdUnits.length,
      pbjsAdUnitsCount: pbjsAdUnits.length,
      eventAdUnitsCount: eventAdUnitsCloned.length,
    })

    window.postMessage({
      type: 'WPD_PREBID_AUCTION',
      payload: data,
    }, '*')
  }

  /**
   * Phase 4: bidWon後の勝利入札更新
   * - getAllWinningBids (レンダリング済みの勝者のみ)
   */
  function sendWinningBidsUpdate() {
    const pbjs = window.pbjs
    if (!pbjs) return

    let winningBids: unknown[] = []
    try {
      if (typeof pbjs.getAllWinningBids === 'function') {
        const rawWB = pbjs.getAllWinningBids()
        winningBids = Array.isArray(rawWB) ? rawWB : []
      }
    } catch (e) {
      log('[WPD-Injected] Error getting winning bids:', e)
    }

    log('[WPD-Injected] Winning bids update:', winningBids.length)

    window.postMessage({
      type: 'WPD_PREBID_WINNING',
      payload: {
        phase: 'bid_won' as const,
        winningBids: safeClone(winningBids),
      },
    }, '*')
  }

  /**
   * adUnitsからBidder一覧を抽出（デバッグ用）
   */
  function extractBiddersFromAdUnits(adUnits: unknown[]): string[] {
    const bidders = new Set<string>()
    if (!Array.isArray(adUnits)) return []

    adUnits.forEach((unit: unknown) => {
      const u = unit as { bids?: Array<{ bidder?: string }> }
      if (Array.isArray(u.bids)) {
        u.bids.forEach((bid) => {
          if (bid.bidder) bidders.add(bid.bidder)
        })
      }
    })
    return Array.from(bidders)
  }

  function sendPrebidEvent(eventType: string, data: unknown) {
    log('[WPD-Injected] Prebid event:', eventType)
    window.postMessage({
      type: 'WPD_PREBID_EVENT',
      payload: {
        eventType,
        timestamp: Date.now(),
        data: safeClone(data),
      },
    }, '*')
  }

  // ==========================================
  // dataLayer (GTM) Hooks
  // ==========================================
  function initDataLayerHooks() {
    log('[WPD-Injected] Initializing dataLayer hooks, existing:', !!window.dataLayer)
    if (!window.dataLayer) {
      window.dataLayer = []
    }

    const originalPush = window.dataLayer.push.bind(window.dataLayer)

    // Buffer for batching dataLayer events
    let pendingItems: Array<{ event: string; data: unknown; timestamp: number }> = []

    // Throttled function to send batched events
    const sendBatchedEvents = throttle(() => {
      if (pendingItems.length === 0) return
      const batch = pendingItems
      pendingItems = []
      batch.forEach((item) => {
        window.postMessage({
          type: 'WPD_DATALAYER_PUSH',
          payload: item,
        }, '*')
      })
    }, THROTTLE_INTERVAL)

    window.dataLayer.push = function (...args: unknown[]) {
      args.forEach((item) => {
        try {
          const itemObj = item as Record<string, unknown>
          pendingItems.push({
            timestamp: Date.now(),
            event: (itemObj.event as string) || 'push',
            data: safeClone(item),
          })
          sendBatchedEvents()
        } catch {
          // Circular reference or other serialization error
        }
      })
      return originalPush(...args)
    }

    // 既存のdataLayerをキャプチャ（最大100件に制限）
    // Array でない実装（カスタムオブジェクト等）に備えて Array.from でガード
    const existingItems = Array.isArray(window.dataLayer)
      ? window.dataLayer.slice(0, 100)
      : Array.from(window.dataLayer as unknown[]).slice(0, 100)
    existingItems.forEach((item) => {
      try {
        const itemObj = item as Record<string, unknown>
        pendingItems.push({
          timestamp: Date.now(),
          event: (itemObj.event as string) || 'existing',
          data: safeClone(item),
        })
      } catch {
        // Ignore serialization errors
      }
    })
    if (pendingItems.length > 0) {
      sendBatchedEvents()
    }
  }

  // ==========================================
  // Analytics (GA4, Pixels) Hooks
  // ==========================================

  // Shared throttled pixel event sender
  let pendingPixelEvents: Array<{
    pixelType: string
    pixelId: string
    event: { timestamp: number; eventName: string; params: unknown }
  }> = []

  const sendThrottledPixelEvents = throttle(() => {
    if (pendingPixelEvents.length === 0) return
    const batch = pendingPixelEvents
    pendingPixelEvents = []
    batch.forEach((item) => {
      window.postMessage({
        type: 'WPD_PIXEL_EVENT',
        payload: item,
      }, '*')
    })
  }, THROTTLE_INTERVAL)

  function queuePixelEvent(pixelType: string, pixelId: string, eventName: string, params: unknown) {
    pendingPixelEvents.push({
      pixelType,
      pixelId,
      event: {
        timestamp: Date.now(),
        eventName,
        params: safeClone(params) || {},
      },
    })
    sendThrottledPixelEvents()
  }

  // Shared throttled GA4 event sender
  let pendingGa4Events: Array<{ type: string; payload: unknown }> = []

  const sendThrottledGa4Events = throttle(() => {
    if (pendingGa4Events.length === 0) return
    const batch = pendingGa4Events
    pendingGa4Events = []
    batch.forEach((item) => {
      window.postMessage(item, '*')
    })
  }, THROTTLE_INTERVAL)

  function queueGa4Event(type: string, payload: unknown) {
    pendingGa4Events.push({ type, payload })
    sendThrottledGa4Events()
  }

  function initAnalyticsHooks() {
    log('[WPD-Injected] Initializing Analytics hooks')

    // GA4 gtag監視（全コマンド対応）
    initGtagHooks()

    // Facebook/Meta Pixel監視
    initFacebookPixelHooks()

    // Twitter/X Pixel監視
    initTwitterPixelHooks()

    // TikTok Pixel監視
    initTikTokPixelHooks()

    // LinkedIn Insight Tag監視
    initLinkedInHooks()

    // Pinterest Tag監視
    initPinterestHooks()

    // Criteo OneTag監視
    initCriteoHooks()

    // Snap Pixel監視
    initSnapPixelHooks()
  }

  // ==========================================
  // GA4 gtag Hooks (config, event, set, get, consent)
  // ==========================================
  function initGtagHooks() {
    if (typeof window.gtag !== 'function') {
      log('[WPD-Injected] gtag not found')
      return
    }

    log('[WPD-Injected] Hooking gtag')
    const originalGtag = window.gtag

    window.gtag = function (...args: unknown[]) {
      const command = args[0] as string
      const timestamp = Date.now()

      try {
        switch (command) {
          case 'config':
            queueGa4Event('WPD_GA4_CONFIG', {
              timestamp,
              targetId: args[1],
              config: safeClone(args[2]) || {},
            })
            break

          case 'event':
            queueGa4Event('WPD_GA4_EVENT', {
              timestamp,
              name: args[1],
              params: safeClone(args[2]) || {},
            })
            break

          case 'set':
            queueGa4Event('WPD_GA4_SET', {
              timestamp,
              params: safeClone(args[1]) || {},
            })
            break

          case 'get':
            // getはコールバック付きなのでキャプチャのみ
            queueGa4Event('WPD_GA4_GET', {
              timestamp,
              targetId: args[1],
              fieldName: args[2],
            })
            break

          case 'consent':
            queueGa4Event('WPD_GA4_CONSENT', {
              timestamp,
              consentArg: args[1], // 'default' or 'update'
              consentParams: safeClone(args[2]) || {},
            })
            break
        }
      } catch (e) {
        log('[WPD-Injected] Error capturing gtag:', e)
      }

      return originalGtag.apply(window, args)
    }
  }

  // ==========================================
  // Facebook/Meta Pixel Hooks
  // ==========================================
  function initFacebookPixelHooks() {
    if (typeof window.fbq !== 'function') {
      log('[WPD-Injected] fbq not found')
      return
    }

    log('[WPD-Injected] Hooking fbq')
    const originalFbq = window.fbq

    window.fbq = function (...args: unknown[]) {
      const command = args[0] as string

      try {
        const pixelId = originalFbq.getState?.()?.pixels[0]?.id || 'unknown'

        switch (command) {
          case 'init':
            queuePixelEvent('facebook', (args[1] as string) || pixelId, 'init', args[2])
            break
          case 'track':
          case 'trackCustom':
            queuePixelEvent('facebook', pixelId, args[1] as string, args[2])
            break
          case 'trackSingle':
          case 'trackSingleCustom':
            queuePixelEvent('facebook', (args[1] as string) || pixelId, args[2] as string, args[3])
            break
        }
      } catch (e) {
        log('[WPD-Injected] Error capturing fbq:', e)
      }

      return originalFbq.apply(window, args)
    } as typeof window.fbq

    // Preserve original properties
    if (originalFbq.getState) window.fbq.getState = originalFbq.getState
    if (originalFbq.queue) window.fbq.queue = originalFbq.queue
  }

  // ==========================================
  // Twitter/X Pixel Hooks
  // ==========================================
  function initTwitterPixelHooks() {
    if (typeof window.twq !== 'function') {
      log('[WPD-Injected] twq not found')
      return
    }

    log('[WPD-Injected] Hooking twq')
    const originalTwq = window.twq

    window.twq = function (...args: unknown[]) {
      const command = args[0] as string

      try {
        switch (command) {
          case 'init':
            queuePixelEvent('twitter', args[1] as string, 'init', args[2])
            break
          case 'config':
            queuePixelEvent('twitter', args[1] as string, 'config', {})
            break
          case 'track':
            queuePixelEvent('twitter', 'unknown', args[1] as string, args[2])
            break
          case 'event':
            queuePixelEvent('twitter', args[1] as string, args[2] as string, args[3])
            break
        }
      } catch (e) {
        log('[WPD-Injected] Error capturing twq:', e)
      }

      return originalTwq.apply(window, args)
    } as typeof window.twq

    // Preserve original properties
    if (originalTwq.exe) window.twq.exe = originalTwq.exe
    if (originalTwq.queue) window.twq.queue = originalTwq.queue
    if (originalTwq.version) window.twq.version = originalTwq.version
  }

  // ==========================================
  // TikTok Pixel Hooks
  // ==========================================
  function initTikTokPixelHooks() {
    if (!window.ttq) {
      log('[WPD-Injected] ttq not found')
      return
    }

    log('[WPD-Injected] Hooking ttq')
    const originalTtq = window.ttq

    // TikTok Pixelは特殊な構造を持つため、主要メソッドをフック
    const methodsToHook = ['page', 'track', 'identify']

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ttqAny = originalTtq as any

    methodsToHook.forEach((method) => {
      if (typeof ttqAny[method] === 'function') {
        const originalMethod = ttqAny[method]

        ttqAny[method] = function (...args: unknown[]) {
          try {
            const pixelId = window.ttq?._i ? Object.keys(window.ttq._i)[0] || 'unknown' : 'unknown'
            const eventName = method === 'page' ? 'PageView' : (args[0] as string) || method
            const params = method === 'page' ? {} : (args[1] || args[0])
            queuePixelEvent('tiktok', pixelId, eventName, params)
          } catch (e) {
            log('[WPD-Injected] Error capturing ttq.' + method + ':', e)
          }

          return originalMethod.apply(originalTtq, args)
        }
      }
    })
  }

  // ==========================================
  // LinkedIn Insight Tag Hooks
  // ==========================================
  function initLinkedInHooks() {
    const partnerId = window._linkedin_partner_id

    if (!window.lintrk && !partnerId) {
      log('[WPD-Injected] lintrk not found')
      return
    }

    // Partner IDが見つかったら送信
    if (partnerId) {
      queuePixelEvent('linkedin', partnerId, 'init', { partner_id: partnerId })
    }

    if (typeof window.lintrk === 'function') {
      log('[WPD-Injected] Hooking lintrk')
      const originalLintrk = window.lintrk

      window.lintrk = function (...args: unknown[]) {
        const command = args[0] as string

        try {
          if (command === 'track') {
            queuePixelEvent('linkedin', partnerId || 'unknown', 'conversion', args[1])
          }
        } catch (e) {
          log('[WPD-Injected] Error capturing lintrk:', e)
        }

        return originalLintrk.apply(window, args)
      } as typeof window.lintrk

      if (originalLintrk.q) window.lintrk.q = originalLintrk.q
    }
  }

  // ==========================================
  // Pinterest Tag Hooks
  // ==========================================
  function initPinterestHooks() {
    if (typeof window.pintrk !== 'function') {
      log('[WPD-Injected] pintrk not found')
      return
    }

    log('[WPD-Injected] Hooking pintrk')
    const originalPintrk = window.pintrk
    let pinterestPixelId = 'unknown'

    window.pintrk = function (...args: unknown[]) {
      const command = args[0] as string

      try {
        switch (command) {
          case 'load':
            pinterestPixelId = args[1] as string
            queuePixelEvent('pinterest', pinterestPixelId, 'load', args[2])
            break
          case 'page':
            queuePixelEvent('pinterest', pinterestPixelId, 'PageVisit', {})
            break
          case 'track':
            queuePixelEvent('pinterest', pinterestPixelId, args[1] as string, args[2])
            break
        }
      } catch (e) {
        log('[WPD-Injected] Error capturing pintrk:', e)
      }

      return originalPintrk.apply(window, args)
    } as typeof window.pintrk

    if (originalPintrk.queue) window.pintrk.queue = originalPintrk.queue
    if (originalPintrk.version) window.pintrk.version = originalPintrk.version
  }

  // ==========================================
  // Criteo OneTag Hooks
  // ==========================================
  function initCriteoHooks() {
    if (!window.criteo_q) {
      log('[WPD-Injected] criteo_q not found')
      return
    }

    log('[WPD-Injected] Hooking criteo_q')
    const originalCriteoQ = window.criteo_q
    let criteoAccountId = 'unknown'

    // 既存のイベントをキャプチャ（最大50件に制限）
    const existingItems = Array.isArray(originalCriteoQ) ? originalCriteoQ.slice(0, 50) : []
    existingItems.forEach((item) => {
      if (item.event === 'setAccount' && item.account) {
        criteoAccountId = String(item.account)
      }
      queuePixelEvent('criteo', criteoAccountId, item.event, item)
    })

    // pushメソッドをフック
    const originalPush = originalCriteoQ.push.bind(originalCriteoQ)
    window.criteo_q.push = function (...args: Array<{ event: string; [key: string]: unknown }>) {
      args.forEach((item) => {
        try {
          if (item.event === 'setAccount' && item.account) {
            criteoAccountId = String(item.account)
          }
          queuePixelEvent('criteo', criteoAccountId, item.event, item)
        } catch (e) {
          log('[WPD-Injected] Error capturing criteo_q:', e)
        }
      })
      return originalPush(...args)
    }
  }

  // ==========================================
  // Snap Pixel Hooks
  // ==========================================
  function initSnapPixelHooks() {
    if (typeof window.snaptr !== 'function') {
      log('[WPD-Injected] snaptr not found')
      return
    }

    log('[WPD-Injected] Hooking snaptr')
    const originalSnaptr = window.snaptr
    let snapPixelId = 'unknown'

    window.snaptr = function (...args: unknown[]) {
      const command = args[0] as string

      try {
        switch (command) {
          case 'init':
            snapPixelId = args[1] as string
            queuePixelEvent('snapchat', snapPixelId, 'init', args[2])
            break
          case 'track':
            queuePixelEvent('snapchat', snapPixelId, args[1] as string, args[2])
            break
        }
      } catch (e) {
        log('[WPD-Injected] Error capturing snaptr:', e)
      }

      return originalSnaptr.apply(window, args)
    } as typeof window.snaptr

    if (originalSnaptr._) window.snaptr._ = originalSnaptr._
    if (originalSnaptr.version) window.snaptr.version = originalSnaptr.version
  }

  // ==========================================
  // Google Publisher Tag (GPT) Hooks
  // ==========================================
  let gptWaitTime = 0

  // GPTが初期化されているかチェック
  function isGptReady(): boolean {
    return !!(window.googletag && window.googletag.apiReady)
  }

  function waitForGpt() {
    if (isGptReady()) {
      log('[WPD-Injected] GPT found, version:', window.googletag?.getVersion?.())
      initGptHooks()
    } else if (gptWaitTime < MAX_WAIT_TIME) {
      gptWaitTime += GPT_CHECK_INTERVAL
      setTimeout(waitForGpt, GPT_CHECK_INTERVAL)
    } else {
      log('[WPD-Injected] GPT not found after', MAX_WAIT_TIME, 'ms')
      window.postMessage({ type: 'WPD_GPT_NOT_FOUND' }, '*')
    }
  }

  function initGptHooks() {
    log('[WPD-Injected] Initializing GPT hooks')
    const googletag = window.googletag!

    // googletag.cmd を使って pubads が準備できた後に実行
    googletag.cmd.push(() => {
      log('[WPD-Injected] GPT pubads ready, pubadsReady:', googletag.pubadsReady)

      // 初期データを送信
      sendGptInitialData()

      // イベントリスナーを登録
      const pubads = googletag.pubads()

      // slotRequested - 広告リクエスト送信時
      pubads.addEventListener('slotRequested', (event) => {
        const slotEvent = event as { slot: GptSlotInterface }
        sendGptEvent('slotRequested', slotEvent.slot.getSlotElementId(), event)
      })

      // slotResponseReceived - 広告レスポンス受信時
      pubads.addEventListener('slotResponseReceived', (event) => {
        const slotEvent = event as { slot: GptSlotInterface }
        sendGptEvent('slotResponseReceived', slotEvent.slot.getSlotElementId(), event)
      })

      // slotRenderEnded - 広告レンダリング完了時（重要）
      pubads.addEventListener('slotRenderEnded', (event) => {
        const renderEvent = event as {
          slot: GptSlotInterface
          isEmpty: boolean
          size: [number, number] | null
          advertiserId: number | null
          campaignId: number | null
          creativeId: number | null
          lineItemId: number | null
          sourceAgnosticCreativeId: number | null
          sourceAgnosticLineItemId: number | null
          isBackfill: boolean
          creativeTemplateId: number | null
        }
        log('[WPD-Injected] slotRenderEnded:', renderEvent.slot.getSlotElementId(), 'isEmpty:', renderEvent.isEmpty)
        sendGptEvent('slotRenderEnded', renderEvent.slot.getSlotElementId(), {
          isEmpty: renderEvent.isEmpty,
          size: renderEvent.size,
          advertiserId: renderEvent.advertiserId,
          campaignId: renderEvent.campaignId,
          creativeId: renderEvent.creativeId,
          lineItemId: renderEvent.lineItemId,
          sourceAgnosticCreativeId: renderEvent.sourceAgnosticCreativeId,
          sourceAgnosticLineItemId: renderEvent.sourceAgnosticLineItemId,
          isBackfill: renderEvent.isBackfill,
          creativeTemplateId: renderEvent.creativeTemplateId,
        })

        // レンダリング後にスロットデータを更新
        setTimeout(() => sendGptSlotsUpdate(), 100)
      })

      // slotOnload - クリエイティブロード完了時
      pubads.addEventListener('slotOnload', (event) => {
        const slotEvent = event as { slot: GptSlotInterface }
        sendGptEvent('slotOnload', slotEvent.slot.getSlotElementId(), event)
      })

      // impressionViewable - ビューアブル判定時
      pubads.addEventListener('impressionViewable', (event) => {
        const slotEvent = event as { slot: GptSlotInterface }
        sendGptEvent('impressionViewable', slotEvent.slot.getSlotElementId(), event)
      })

      // slotVisibilityChanged - 可視性変化時
      pubads.addEventListener('slotVisibilityChanged', (event) => {
        const visEvent = event as { slot: GptSlotInterface; inViewPercentage: number }
        sendGptEvent('slotVisibilityChanged', visEvent.slot.getSlotElementId(), {
          inViewPercentage: visEvent.inViewPercentage,
        })
      })
    })

    // Content Scriptからの再収集リクエストを受け付ける
    window.addEventListener('message', (event) => {
      if (event.source !== window) return
      if (event.data.type === 'WPD_COLLECT_GPT') {
        log('[WPD-Injected] Received GPT collect request from content script')
        sendGptInitialData()
      }
    })

    // 少し待ってからスロットデータも収集（既にレンダリング済みの場合）
    setTimeout(() => sendGptSlotsUpdate(), 500)
  }

  /**
   * GPT初期データを送信
   */
  function sendGptInitialData() {
    const googletag = window.googletag
    if (!googletag) return

    log('[WPD-Injected] Sending GPT initial data')

    const pubads = googletag.pubads()
    const slots = pubads.getSlots()

    // ページレベルターゲティング
    const pageTargetingKeys = pubads.getTargetingKeys()
    const pageTargeting: Record<string, string[]> = {}
    pageTargetingKeys.forEach((key) => {
      pageTargeting[key] = pubads.getTargeting(key)
    })

    // スロット情報を収集
    const slotsData = slots.map((slot) => collectSlotData(slot))

    // 設定情報
    const config = {
      initialLoadDisabled: typeof pubads.isInitialLoadDisabled === 'function'
        ? pubads.isInitialLoadDisabled()
        : false,
      singleRequest: true, // SRAはデフォルトで有効（非推奨APIのため直接取得不可）
      lazyLoadEnabled: false, // enableLazyLoadが呼ばれたかは追跡が必要
      privacySettingsToken: typeof pubads.getPrivacySettingsToken === 'function'
        ? pubads.getPrivacySettingsToken()
        : null,
    }

    const data = {
      version: typeof googletag.getVersion === 'function' ? googletag.getVersion() : null,
      slots: slotsData,
      pageTargeting,
      config,
    }

    log('[WPD-Injected] GPT initial data:', {
      version: data.version,
      slotsCount: data.slots.length,
      pageTargetingKeys: Object.keys(pageTargeting),
    })

    window.postMessage({
      type: 'WPD_GPT_INITIAL',
      payload: data,
    }, '*')
  }

  /**
   * 個別スロットのデータを収集
   */
  function collectSlotData(slot: GptSlotInterface) {
    // ターゲティング
    const targetingKeys = slot.getTargetingKeys()
    const targeting: Record<string, string[]> = {}
    targetingKeys.forEach((key) => {
      targeting[key] = slot.getTargeting(key)
    })

    // サイズ
    const rawSizes = slot.getSizes()
    const sizes = rawSizes.map((size) => {
      if (typeof size === 'string') {
        return { width: 'fluid' as const, height: 'fluid' as const }
      }
      if (typeof size === 'object' && size !== null) {
        const sizeObj = size as { getWidth?: () => number | 'fluid'; getHeight?: () => number | 'fluid' }
        if (typeof sizeObj.getWidth === 'function' && typeof sizeObj.getHeight === 'function') {
          return {
            width: sizeObj.getWidth(),
            height: sizeObj.getHeight(),
          }
        }
        // 配列形式 [width, height]
        const arr = size as unknown as [number, number]
        if (Array.isArray(arr) && arr.length === 2) {
          return { width: arr[0], height: arr[1] }
        }
      }
      return { width: 0, height: 0 }
    })

    // レスポンス情報（レンダリング後のみ）
    let responseInfo = null
    try {
      const response = slot.getResponseInformation()
      if (response) {
        responseInfo = {
          advertiserId: response.advertiserId,
          campaignId: response.campaignId,
          creativeId: response.creativeId,
          lineItemId: response.lineItemId,
          sourceAgnosticCreativeId: response.sourceAgnosticCreativeId,
          sourceAgnosticLineItemId: response.sourceAgnosticLineItemId,
          isBackfill: response.isBackfill,
          creativeTemplateId: response.creativeTemplateId,
        }
      }
    } catch (e) {
      log('[WPD-Injected] Error getting response info:', e)
    }

    return {
      slotElementId: slot.getSlotElementId(),
      adUnitPath: slot.getAdUnitPath(),
      sizes,
      targeting,
      responseInfo,
    }
  }

  /**
   * スロットデータの更新を送信
   */
  function sendGptSlotsUpdate() {
    const googletag = window.googletag
    if (!googletag) return

    const pubads = googletag.pubads()
    const slots = pubads.getSlots()
    const slotsData = slots.map((slot) => collectSlotData(slot))

    log('[WPD-Injected] GPT slots update:', slotsData.length, 'slots')

    window.postMessage({
      type: 'WPD_GPT_SLOTS_UPDATE',
      payload: {
        slots: slotsData,
      },
    }, '*')
  }

  /**
   * GPTイベントを送信
   */
  function sendGptEvent(eventType: string, slotElementId: string, data: unknown) {
    log('[WPD-Injected] GPT event:', eventType, slotElementId)
    window.postMessage({
      type: 'WPD_GPT_EVENT',
      payload: {
        eventType,
        timestamp: Date.now(),
        slotElementId,
        data: safeClone(data),
      },
    }, '*')
  }

  // ==========================================
  // Prebid Query Handler (動的APIクエリ)
  // ==========================================
  type PrebidQueryType =
    | 'GET_BID_RESPONSES_FOR_AD_UNIT'
    | 'GET_NO_BIDS_FOR_AD_UNIT'
    | 'GET_HIGHEST_CPM_BIDS'
    | 'GET_ADSERVER_TARGETING'
    | 'GET_EVENTS'
    | 'DIAGNOSE_BIDDER'
    | 'ANALYZE_AD_UNIT'

  interface PrebidQueryRequest {
    queryType: PrebidQueryType
    params: Record<string, unknown>
    requestId: string
  }

  function handlePrebidQuery(request: PrebidQueryRequest) {
    const pbjs = window.pbjs
    if (!pbjs) {
      sendQueryResponse(request.requestId, false, null, 'Prebid.js not found on this page')
      return
    }

    try {
      let result: unknown = null

      switch (request.queryType) {
        case 'GET_BID_RESPONSES_FOR_AD_UNIT': {
          const adUnitCode = request.params.adUnitCode as string
          const allResponses = pbjs.getBidResponses() || {}
          if (adUnitCode && allResponses[adUnitCode]) {
            result = safeClone(allResponses[adUnitCode])
          } else if (adUnitCode) {
            result = { bids: [], message: `No bid responses for ad unit: ${adUnitCode}` }
          } else {
            result = safeClone(allResponses)
          }
          break
        }

        case 'GET_NO_BIDS_FOR_AD_UNIT': {
          const adUnitCode = request.params.adUnitCode as string
          const bidderCode = request.params.bidderCode as string | undefined
          let noBids: unknown[] = []

          if (typeof pbjs.getNoBidsForAdUnitCode === 'function' && adUnitCode) {
            const raw = pbjs.getNoBidsForAdUnitCode(adUnitCode)
            noBids = Array.isArray(raw) ? raw : []
          } else if (typeof pbjs.getNoBids === 'function') {
            const raw = pbjs.getNoBids()
            noBids = Array.isArray(raw) ? raw : []
            if (adUnitCode) {
              noBids = noBids.filter((nb: unknown) => {
                const bid = nb as { adUnitCode?: string }
                return bid.adUnitCode === adUnitCode
              })
            }
          }

          if (bidderCode) {
            noBids = noBids.filter((nb: unknown) => {
              const bid = nb as { bidder?: string }
              return bid.bidder === bidderCode
            })
          }

          result = safeClone(noBids)
          break
        }

        case 'GET_HIGHEST_CPM_BIDS': {
          const adUnitCode = request.params.adUnitCode as string | undefined
          if (typeof pbjs.getHighestCpmBids === 'function') {
            result = safeClone(pbjs.getHighestCpmBids(adUnitCode))
          } else {
            result = []
          }
          break
        }

        case 'GET_ADSERVER_TARGETING': {
          const adUnitCode = request.params.adUnitCode as string | undefined
          if (typeof pbjs.getAdserverTargeting === 'function') {
            result = safeClone(pbjs.getAdserverTargeting(adUnitCode))
          } else {
            result = {}
          }
          break
        }

        case 'GET_EVENTS': {
          const eventType = request.params.eventType as string | undefined
          const limit = (request.params.limit as number) || 100
          if (typeof pbjs.getEvents === 'function') {
            const rawEvt = pbjs.getEvents()
            let events = Array.isArray(rawEvt) ? rawEvt : []
            if (eventType) {
              events = events.filter((e: unknown) => {
                const evt = e as { eventType?: string }
                return evt.eventType === eventType
              })
            }
            // 最新のイベントを返す
            events = events.slice(-limit)
            result = safeClone(events)
          } else {
            result = []
          }
          break
        }

        case 'DIAGNOSE_BIDDER': {
          const bidderCode = request.params.bidderCode as string
          if (!bidderCode) {
            sendQueryResponse(request.requestId, false, null, 'bidderCode is required')
            return
          }

          // 診断データを収集
          const diagnosis: {
            bidderCode: string
            configured: boolean
            adUnitsCount: number
            bidCount: number
            noBidCount: number
            winCount: number
            timeoutCount: number
            averageCpm: number | null
            averageResponseTime: number | null
            bids: unknown[]
            noBids: unknown[]
            timeouts: unknown[]
          } = {
            bidderCode,
            configured: false,
            adUnitsCount: 0,
            bidCount: 0,
            noBidCount: 0,
            winCount: 0,
            timeoutCount: 0,
            averageCpm: null,
            averageResponseTime: null,
            bids: [],
            noBids: [],
            timeouts: [],
          }

          // AdUnitsでの設定確認
          const rawAdUnits = pbjs.adUnits
          const adUnits = Array.isArray(rawAdUnits) ? rawAdUnits : []
          adUnits.forEach((unit: unknown) => {
            const u = unit as { bids?: Array<{ bidder?: string }> }
            if (Array.isArray(u.bids)) {
              const hasBidder = u.bids.some((b) => b.bidder === bidderCode)
              if (hasBidder) {
                diagnosis.configured = true
                diagnosis.adUnitsCount++
              }
            }
          })

          // Bid Responses
          const bidResponses = pbjs.getBidResponses() || {}
          let totalCpm = 0
          let totalResponseTime = 0
          Object.values(bidResponses).forEach((adUnitData: unknown) => {
            const data = adUnitData as { bids?: unknown[] }
            const bids = Array.isArray(data) ? data : (data.bids || [])
            bids.forEach((bid: unknown) => {
              const b = bid as { bidder?: string; cpm?: number; timeToRespond?: number }
              if (b.bidder === bidderCode) {
                diagnosis.bidCount++
                diagnosis.bids.push(safeClone(bid))
                if (typeof b.cpm === 'number') {
                  totalCpm += b.cpm
                }
                if (typeof b.timeToRespond === 'number') {
                  totalResponseTime += b.timeToRespond
                }
              }
            })
          })

          if (diagnosis.bidCount > 0) {
            diagnosis.averageCpm = totalCpm / diagnosis.bidCount
            diagnosis.averageResponseTime = totalResponseTime / diagnosis.bidCount
          }

          // No Bids
          if (typeof pbjs.getNoBids === 'function') {
            const raw = pbjs.getNoBids()
            const noBids = Array.isArray(raw) ? raw : []
            noBids.forEach((nb: unknown) => {
              const b = nb as { bidder?: string }
              if (b.bidder === bidderCode) {
                diagnosis.noBidCount++
                diagnosis.noBids.push(safeClone(nb))
              }
            })
          }

          // Winning Bids
          if (typeof pbjs.getAllWinningBids === 'function') {
            const rawWinning = pbjs.getAllWinningBids()
            const winningBids = Array.isArray(rawWinning) ? rawWinning : []
            winningBids.forEach((wb: unknown) => {
              const b = wb as { bidder?: string }
              if (b.bidder === bidderCode) {
                diagnosis.winCount++
              }
            })
          }

          // Timeouts from events
          if (typeof pbjs.getEvents === 'function') {
            const rawEvents = pbjs.getEvents()
            const events = Array.isArray(rawEvents) ? rawEvents : []
            events.forEach((e: unknown) => {
              const evt = e as { eventType?: string; args?: unknown }
              if (evt.eventType === 'bidTimeout' && Array.isArray(evt.args)) {
                evt.args.forEach((timeout: unknown) => {
                  const t = timeout as { bidder?: string }
                  if (t.bidder === bidderCode) {
                    diagnosis.timeoutCount++
                    diagnosis.timeouts.push(safeClone(timeout))
                  }
                })
              }
            })
          }

          result = diagnosis
          break
        }

        case 'ANALYZE_AD_UNIT': {
          const adUnitCode = request.params.adUnitCode as string
          if (!adUnitCode) {
            sendQueryResponse(request.requestId, false, null, 'adUnitCode is required')
            return
          }

          const analysis: {
            adUnitCode: string
            found: boolean
            configuredBidders: string[]
            mediaTypes: unknown
            sizes: unknown
            bidResponses: unknown[]
            noBids: unknown[]
            highestBid: unknown
            targeting: unknown
            winner: unknown
          } = {
            adUnitCode,
            found: false,
            configuredBidders: [],
            mediaTypes: null,
            sizes: null,
            bidResponses: [],
            noBids: [],
            highestBid: null,
            targeting: null,
            winner: null,
          }

          // AdUnit設定を検索
          const rawAdUnits2 = pbjs.adUnits
          const adUnits = Array.isArray(rawAdUnits2) ? rawAdUnits2 : []
          const adUnit = adUnits.find((u: unknown) => {
            const unit = u as { code?: string }
            return unit.code === adUnitCode
          }) as { bids?: Array<{ bidder?: string }>; mediaTypes?: unknown; sizes?: unknown } | undefined

          if (adUnit) {
            analysis.found = true
            analysis.configuredBidders = (adUnit.bids || []).map((b) => b.bidder || 'unknown')
            analysis.mediaTypes = safeClone(adUnit.mediaTypes)
            analysis.sizes = safeClone(adUnit.sizes)
          }

          // Bid Responses
          const bidResponses = pbjs.getBidResponses() || {}
          if (bidResponses[adUnitCode]) {
            const data = bidResponses[adUnitCode] as { bids?: unknown[] }
            analysis.bidResponses = safeClone(Array.isArray(data) ? data : (data.bids || [])) || []
          }

          // No Bids
          if (typeof pbjs.getNoBids === 'function') {
            const rawNoBids = pbjs.getNoBids()
            const noBids = Array.isArray(rawNoBids) ? rawNoBids : []
            analysis.noBids = safeClone(noBids.filter((nb: unknown) => {
              const b = nb as { adUnitCode?: string }
              return b.adUnitCode === adUnitCode
            })) || []
          }

          // Highest CPM Bid
          if (typeof pbjs.getHighestCpmBids === 'function') {
            const rawHighest = pbjs.getHighestCpmBids(adUnitCode)
            const highestBids = Array.isArray(rawHighest) ? rawHighest : []
            analysis.highestBid = safeClone(highestBids[0]) || null
          }

          // Targeting
          if (typeof pbjs.getAdserverTargeting === 'function') {
            const targeting = pbjs.getAdserverTargeting(adUnitCode) || {}
            analysis.targeting = safeClone(targeting[adUnitCode]) || null
          }

          // Winner
          if (typeof pbjs.getAllWinningBids === 'function') {
            const rawWinners = pbjs.getAllWinningBids()
            const winners = Array.isArray(rawWinners) ? rawWinners : []
            const winner = winners.find((w: unknown) => {
              const b = w as { adUnitCode?: string }
              return b.adUnitCode === adUnitCode
            })
            analysis.winner = safeClone(winner) || null
          }

          result = analysis
          break
        }

        default:
          sendQueryResponse(request.requestId, false, null, `Unknown query type: ${request.queryType}`)
          return
      }

      sendQueryResponse(request.requestId, true, result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      log('[WPD-Injected] Error: Prebid query error:', errorMessage)
      sendQueryResponse(request.requestId, false, null, errorMessage)
    }
  }

  function sendQueryResponse(requestId: string, success: boolean, data: unknown, error?: string) {
    window.postMessage({
      type: 'WPD_PREBID_QUERY_RESULT',
      payload: {
        requestId,
        success,
        data,
        error,
      },
    }, '*')
  }

  // クエリリクエストをリッスン
  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    if (event.data.type === 'WPD_PREBID_QUERY') {
      log('[WPD-Injected] Received Prebid query:', event.data.payload?.queryType)
      handlePrebidQuery(event.data.payload as PrebidQueryRequest)
    }
  })

  // ==========================================
  // 初期化
  // ==========================================
  waitForPrebid()
  waitForGpt()
  initDataLayerHooks()
  initAnalyticsHooks()
})()

export {}
