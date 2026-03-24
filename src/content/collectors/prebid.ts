import type { PrebidData, PrebidEvent, BidderInfo, WinningBid, ConsentMetadata } from '../../shared/types/prebid'
import { safeSendMessage } from '../utils/safe-messaging'

const DEBUG = false
function log(...args: unknown[]) {
  if (DEBUG) console.log(...args)
}

const MSG_PREBID_DATA = 'PREBID_DATA'

// 収集データの初期状態
function createInitialData(): PrebidData {
  return {
    detected: false,
    version: null,
    config: {
      timeout: null,
      priceGranularity: null,
      consentManagement: false,
      userSync: null,
      debug: false,
      useBidCache: true,
      deviceAccess: true,
      s2sConfig: null,
    },
    installedModules: [],
    userIds: null,
    consentMetadata: null,
    bidders: [],
    adUnits: [],
    auctions: [],
    winningBids: [],
    prebidWinningBids: [],
    adserverTargeting: {},
    aliasRegistry: {},
    bidderSettings: {},
    events: [],
    collectedAt: Date.now(),
  }
}

let collectedData: PrebidData = createInitialData()

// Bidder統計を保持するMap（累積更新用）
const bidderStatsMap = new Map<string, BidderInfo>()

export function initPrebidCollector() {
  log('[WPD] initPrebidCollector called')

  // 注入スクリプトからのメッセージを受信
  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    if (!event.data.type?.startsWith('WPD_')) return

    log('[WPD] Received postMessage:', event.data.type)

    switch (event.data.type) {
      // Phase 1: 初期データ（Prebid検出時、auctionInit時）
      case 'WPD_PREBID_INITIAL':
        log('[WPD] Processing initial Prebid data')
        processInitialData(event.data.payload)
        break

      // Phase 3: オークション後データ
      case 'WPD_PREBID_AUCTION':
        log('[WPD] Processing auction data')
        processAuctionData(event.data.payload)
        break

      // Phase 4: 勝利入札更新（bidWon後）
      case 'WPD_PREBID_WINNING':
        log('[WPD] Processing winning bids update')
        processWinningBidsUpdate(event.data.payload)
        break

      // イベント
      case 'WPD_PREBID_EVENT':
        log('[WPD] Prebid event received:', event.data.payload?.eventType)
        collectedData.events.push(event.data.payload)
        notifyUpdate()
        break

      // 未検出
      case 'WPD_PREBID_NOT_FOUND':
        log('[WPD] Prebid.js not found on this page')
        collectedData.detected = false
        notifyUpdate()
        break

      // 後方互換性: 旧形式のデータ（WPD_PREBID_DATA）
      case 'WPD_PREBID_DATA':
        log('[WPD] Processing legacy Prebid data')
        processLegacyData(event.data.payload)
        break
    }
  })

  // 注入スクリプトを挿入
  injectScript()
}

function injectScript() {
  log('[WPD] Injecting script...')
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('injected.js')
  script.onload = () => {
    log('[WPD] Injected script loaded and removed')
    script.remove()
  }
  script.onerror = (e) => {
    console.error('[WPD] Failed to load injected script:', e)
  }
  ;(document.head || document.documentElement).appendChild(script)
}

// ========================================
// Phase 1: 初期データ処理
// adUnits, config, modules, aliasRegistry, bidderSettings
// Bidder一覧はここで確定（オークション前）
// ========================================
interface InitialPayload {
  version: string | null
  config: {
    timeout: number | null
    priceGranularity: string | null
    consentManagement: boolean
    userSync: unknown
    debug: boolean
    useBidCache: boolean
    deviceAccess: boolean
    s2sConfig: unknown
  }
  installedModules: string[]
  adUnits: Array<{
    code: string
    mediaTypes?: Record<string, unknown>
    sizes?: Array<[number, number]>
    bids?: Array<{ bidder: string }>
  }>
  aliasRegistry: Record<string, string>
  bidderSettings: Record<string, unknown>
  userIds: {
    ids: Record<string, unknown>
    eids: unknown[]
  } | null
  consentMetadata: unknown
}

function processInitialData(payload: InitialPayload) {
  collectedData.detected = true
  collectedData.version = payload.version
  collectedData.installedModules = payload.installedModules || []
  collectedData.aliasRegistry = payload.aliasRegistry || {}
  collectedData.bidderSettings = payload.bidderSettings || {}

  // Config処理
  collectedData.config = {
    timeout: payload.config.timeout as number | null,
    priceGranularity: payload.config.priceGranularity as string | null,
    consentManagement: payload.config.consentManagement,
    userSync: payload.config.userSync ? {
      enabled: true,
      syncsPerBidder: 0,
      filterSettings: payload.config.userSync,
    } : null,
    debug: payload.config.debug,
    useBidCache: payload.config.useBidCache,
    deviceAccess: payload.config.deviceAccess,
    s2sConfig: processS2SConfig(payload.config.s2sConfig),
  }

  // AdUnits処理
  const adUnitsArray = Array.isArray(payload.adUnits) ? payload.adUnits : []
  collectedData.adUnits = adUnitsArray.map((unit) => ({
    code: unit.code,
    mediaTypes: Object.keys(unit.mediaTypes || {}),
    sizes: unit.sizes || [],
    bidders: unit.bids?.map((b) => b.bidder) || [],
  }))

  // ★ 重要: adUnitsからBidder一覧を抽出（オークション前から利用可能）
  extractBiddersFromAdUnits(adUnitsArray)

  // installedModulesからもBidderを抽出（フォールバック）
  if (bidderStatsMap.size === 0) {
    extractBiddersFromModules(payload.installedModules)
  }

  // User IDs処理
  if (payload.userIds && payload.userIds.ids) {
    const eidsArray = Array.isArray(payload.userIds.eids) ? payload.userIds.eids : []
    collectedData.userIds = {
      ids: payload.userIds.ids,
      eids: eidsArray.map((eid: unknown) => {
        const e = eid as { source?: string; uids?: unknown[] }
        return {
          source: e.source || '',
          uids: Array.isArray(e.uids) ? e.uids as Array<{ id: string; atype?: number; ext?: unknown }> : [],
        }
      }),
    }
  }

  // 同意メタデータ処理
  if (payload.consentMetadata) {
    collectedData.consentMetadata = processConsentMetadata(payload.consentMetadata)
  }

  // Bidder一覧を更新
  collectedData.bidders = Array.from(bidderStatsMap.values())
  collectedData.collectedAt = Date.now()

  notifyUpdate()
}

// ========================================
// Phase 3: オークション後データ処理
// bidResponses, noBids, winningBids, adserverTargeting
// ========================================
interface AuctionPayload {
  adUnits?: Array<{
    code: string
    mediaTypes?: Record<string, unknown>
    sizes?: Array<[number, number]>
    bids?: Array<{ bidder: string }>
  }>
  bidResponses?: Record<string, { bids?: unknown[] } | unknown[]>
  allBids?: Array<{
    bidder: string
    cpm: number
    currency?: string
    width?: number
    height?: number
    adId?: string
    status?: string
    requestTimestamp?: number
    responseTimestamp?: number
    timeToRespond?: number
  }>
  winningBids?: Array<{
    adUnitCode: string
    bidder: string
    cpm: number
    currency?: string
    width?: number
    height?: number
    adId?: string
    timeToRespond?: number
  }>
  prebidWinningBids?: Array<{
    adUnitCode: string
    bidder: string
    cpm: number
    currency?: string
    width?: number
    height?: number
    adId?: string
    timeToRespond?: number
  }>
  noBids?: Array<{
    bidder: string
    adUnitCode?: string
  }>
  highestCpmBids?: Array<{
    bidder: string
    cpm: number
    adUnitCode?: string
  }>
  adserverTargeting?: Record<string, Record<string, string>>
  prebidEvents?: unknown[]
}

function processAuctionData(payload: AuctionPayload) {
  // adUnitsが含まれている場合は更新（動的に追加される場合に対応）
  const adUnitsArray = Array.isArray(payload.adUnits) ? payload.adUnits : []
  if (adUnitsArray.length > 0) {
    collectedData.adUnits = adUnitsArray.map((unit) => ({
      code: unit.code,
      mediaTypes: Object.keys(unit.mediaTypes || {}),
      sizes: unit.sizes || [],
      bidders: unit.bids?.map((b) => b.bidder) || [],
    }))

    // Bidder一覧も更新
    extractBiddersFromAdUnits(adUnitsArray)
  }

  // 入札レスポンスからBidder統計を更新
  const allBidsArray = Array.isArray(payload.allBids) ? payload.allBids : []
  allBidsArray.forEach((bid) => {
    updateBidderStats(bid.bidder, {
      cpm: bid.cpm,
      timeToRespond: bid.timeToRespond || 0,
      status: bid.status,
      currency: bid.currency,
    })
  })

  // noBidsからタイムアウト/入札なしを集計
  const noBidsArray = Array.isArray(payload.noBids) ? payload.noBids : []
  noBidsArray.forEach((noBid) => {
    const existing = bidderStatsMap.get(noBid.bidder)
    if (existing) {
      existing.timeoutCount++
    } else {
      bidderStatsMap.set(noBid.bidder, {
        code: noBid.bidder,
        bidCount: 0,
        winCount: 0,
        avgBidCpm: 0,
        avgResponseTime: 0,
        timeoutCount: 1,
        currency: 'USD',
      })
    }
  })

  // 勝利入札の処理（レンダリング済み）
  const winningBidsArray = Array.isArray(payload.winningBids) ? payload.winningBids : []
  collectedData.winningBids = winningBidsArray.map(processWinningBid)

  // Prebid勝者（未レンダリング）
  const prebidWinningBidsArray = Array.isArray(payload.prebidWinningBids) ? payload.prebidWinningBids : []
  collectedData.prebidWinningBids = prebidWinningBidsArray.map(processWinningBid)

  // ターゲティング
  collectedData.adserverTargeting = payload.adserverTargeting || {}

  // pbjs.getEvents() の履歴でイベントタイムラインを補完
  // リアルタイムで onEvent が取れなかった場合（拡張をオークション後に開いた等）に対応
  if (Array.isArray(payload.prebidEvents) && payload.prebidEvents.length > 0 && collectedData.events.length === 0) {
    collectedData.events = payload.prebidEvents.map((e: unknown) => {
      const evt = e as { eventType?: string; timestamp?: number; args?: unknown }
      return {
        eventType: evt.eventType || 'UNKNOWN',
        timestamp: evt.timestamp || Date.now(),
        data: evt.args ?? evt,
      }
    })
  }

  // Bidder一覧を更新
  collectedData.bidders = Array.from(bidderStatsMap.values())
  collectedData.collectedAt = Date.now()

  notifyUpdate()
}

// ========================================
// Phase 4: 勝利入札更新（bidWon後）
// ========================================
interface WinningPayload {
  winningBids?: Array<{
    adUnitCode: string
    bidder: string
    cpm: number
    currency?: string
    width?: number
    height?: number
    adId?: string
    timeToRespond?: number
  }>
}

function processWinningBidsUpdate(payload: WinningPayload) {
  const winningBidsArray = Array.isArray(payload.winningBids) ? payload.winningBids : []
  collectedData.winningBids = winningBidsArray.map(processWinningBid)

  // 勝者のBidder統計を更新
  winningBidsArray.forEach((wb) => {
    const existing = bidderStatsMap.get(wb.bidder)
    if (existing) {
      // winCountは累積しないように注意（同じbidが複数回来る可能性）
      // 実際のwinCountはwinningBidsの数から計算
    }
  })

  // winCountを再計算
  bidderStatsMap.forEach((stats) => {
    stats.winCount = collectedData.winningBids.filter(wb => wb.bidder === stats.code).length
  })

  collectedData.bidders = Array.from(bidderStatsMap.values())
  collectedData.collectedAt = Date.now()

  notifyUpdate()
}

// ========================================
// ヘルパー関数
// ========================================

/**
 * adUnitsからBidder一覧を抽出してbidderStatsMapに登録
 * これはオークション前（addAdUnits後）から利用可能
 */
function extractBiddersFromAdUnits(adUnits: Array<{ bids?: Array<{ bidder: string }> }>) {
  adUnits.forEach((unit) => {
    const bids = Array.isArray(unit.bids) ? unit.bids : []
    bids.forEach((bid) => {
      if (bid.bidder && !bidderStatsMap.has(bid.bidder)) {
        bidderStatsMap.set(bid.bidder, {
          code: bid.bidder,
          bidCount: 0,
          winCount: 0,
          avgBidCpm: 0,
          avgResponseTime: 0,
          timeoutCount: 0,
          currency: 'USD',
        })
      }
    })
  })
}

/**
 * installedModulesからBidAdapterを抽出（フォールバック）
 */
function extractBiddersFromModules(modules: string[]) {
  if (!Array.isArray(modules)) return

  modules
    .filter(m => m.endsWith('BidAdapter'))
    .forEach(m => {
      const bidderCode = m.replace('BidAdapter', '')
      if (!bidderStatsMap.has(bidderCode)) {
        bidderStatsMap.set(bidderCode, {
          code: bidderCode,
          bidCount: 0,
          winCount: 0,
          avgBidCpm: 0,
          avgResponseTime: 0,
          timeoutCount: 0,
          currency: 'USD',
        })
      }
    })
}

/**
 * Bidder統計を更新（累積）
 */
function updateBidderStats(bidderCode: string, stats: { cpm: number; timeToRespond: number; status?: string; currency?: string }) {
  const existing = bidderStatsMap.get(bidderCode) || {
    code: bidderCode,
    bidCount: 0,
    winCount: 0,
    avgBidCpm: 0,
    avgResponseTime: 0,
    timeoutCount: 0,
    currency: 'USD',
  }

  existing.bidCount++
  existing.avgBidCpm =
    (existing.avgBidCpm * (existing.bidCount - 1) + stats.cpm) / existing.bidCount
  if (stats.currency) existing.currency = stats.currency

  if (stats.timeToRespond > 0) {
    existing.avgResponseTime =
      (existing.avgResponseTime * (existing.bidCount - 1) + stats.timeToRespond) / existing.bidCount
  }

  bidderStatsMap.set(bidderCode, existing)
}

/**
 * 勝利入札を処理
 */
function processWinningBid(wb: {
  adUnitCode: string
  bidder: string
  cpm: number
  currency?: string
  width?: number
  height?: number
  adId?: string
  timeToRespond?: number
}): WinningBid {
  return {
    adUnitCode: wb.adUnitCode,
    bidder: wb.bidder,
    cpm: wb.cpm,
    currency: wb.currency || 'USD',
    width: wb.width || 0,
    height: wb.height || 0,
    adId: wb.adId || '',
    timeToRespond: wb.timeToRespond || 0,
  }
}

/**
 * S2S設定を処理
 */
function processS2SConfig(s2sConfig: unknown) {
  if (!s2sConfig) return null
  const s2s = s2sConfig as Record<string, unknown>
  return {
    enabled: !!s2s.enabled,
    endpoint: (s2s.endpoint as string) || null,
    bidders: (s2s.bidders as string[]) || [],
  }
}

/**
 * 同意メタデータを処理
 */
function processConsentMetadata(consentMetadata: unknown): ConsentMetadata {
  const cm = consentMetadata as Record<string, unknown>
  return {
    gdprApplies: !!cm.gdprApplies,
    consentString: (cm.consentString as string) || null,
    vendorData: cm.vendorData || null,
    uspString: (cm.uspString as string) || null,
    gppString: (cm.gppString as string) || null,
  }
}

/**
 * 後方互換性: 旧形式のデータを処理
 */
function processLegacyData(raw: unknown) {
  const payload = raw as InitialPayload & AuctionPayload
  processInitialData(payload)
  processAuctionData(payload)
}

const MAX_EVENTS_TO_SEND = 50

/**
 * UI表示に必要なフィールドだけ残してイベントデータを軽量化する。
 * PrebidTimeline.tsx の extractBidderInfo が参照するフィールドのみ保持。
 */
function slimEventData(eventType: string, data: unknown): unknown {
  if (!data || typeof data !== 'object') return undefined

  switch (eventType) {
    case 'BID_REQUESTED': {
      const d = data as Record<string, unknown>
      const bids = Array.isArray(d.bids)
        ? (d.bids as Array<Record<string, unknown>>).map(b => ({ adUnitCode: b.adUnitCode }))
        : undefined
      return { bidderCode: d.bidderCode, bids }
    }
    case 'BID_RESPONSE': {
      const d = data as Record<string, unknown>
      return { bidderCode: d.bidderCode, cpm: d.cpm, currency: d.currency, adUnitCode: d.adUnitCode }
    }
    case 'BID_WON': {
      const d = data as Record<string, unknown>
      return { bidder: d.bidder, cpm: d.cpm, currency: d.currency, adUnitCode: d.adUnitCode }
    }
    case 'BID_TIMEOUT': {
      if (Array.isArray(data)) {
        return (data as Array<Record<string, unknown>>).map(b => ({ bidder: b.bidder }))
      }
      return undefined
    }
    case 'AUCTION_INIT':
    case 'AUCTION_END': {
      const d = data as Record<string, unknown>
      const adUnits = Array.isArray(d.adUnits) ? d.adUnits : undefined
      return { adUnits: adUnits ? new Array(adUnits.length) : undefined }
    }
    default:
      return undefined
  }
}

function notifyUpdate() {
  log('[WPD] Prebid notifyUpdate, bidders:', collectedData.bidders.length)
  safeSendMessage({
    type: MSG_PREBID_DATA,
    payload: {
      ...collectedData,
      events: collectedData.events.slice(-MAX_EVENTS_TO_SEND).map(e => ({
        ...e,
        data: slimEventData(e.eventType, e.data),
      })),
    },
  })
}

export function getPrebidData(): PrebidData {
  return collectedData
}

export function addPrebidEvent(event: PrebidEvent) {
  collectedData.events.push(event)
  notifyUpdate()
}

// injected.jsにPrebidデータの再収集をリクエスト
export function requestPrebidDataCollection() {
  log('[WPD] Requesting Prebid data collection from injected script')
  window.postMessage({ type: 'WPD_COLLECT_PREBID' }, '*')
}
