export interface PrebidData {
  detected: boolean
  version: string | null

  // 設定
  config: {
    timeout: number | null
    priceGranularity: string | null
    consentManagement: boolean
    userSync: UserSyncConfig | null
    debug: boolean
    useBidCache: boolean
    deviceAccess: boolean
    s2sConfig: S2SConfig | null
  }

  // インストール済みモジュール
  installedModules: string[]

  // User IDs (ID Module)
  userIds: UserIdInfo | null

  // 同意管理情報
  consentMetadata: ConsentMetadata | null

  // Bidders
  bidders: BidderInfo[]

  // Ad Units
  adUnits: AdUnitInfo[]

  // オークション結果
  auctions: AuctionResult[]

  // 勝利入札（GAM含む全勝者）
  winningBids: WinningBid[]

  // Prebid勝者のみ（GAM除く）
  prebidWinningBids: WinningBid[]

  // アドサーバーターゲティング
  adserverTargeting: Record<string, Record<string, string>>

  // Bidderエイリアス（aliasRegistry）
  aliasRegistry: Record<string, string>

  // Bidder設定
  bidderSettings: Record<string, unknown>

  // イベントログ
  events: PrebidEvent[]

  collectedAt: number
}

// Server-to-Server設定
export interface S2SConfig {
  enabled: boolean
  endpoint: string | null
  bidders: string[]
}

// User ID情報
export interface UserIdInfo {
  ids: Record<string, unknown>
  eids: EidInfo[]
}

// Extended ID形式
export interface EidInfo {
  source: string
  uids: Array<{
    id: string
    atype?: number
    ext?: unknown
  }>
}

// 同意管理メタデータ
export interface ConsentMetadata {
  gdprApplies: boolean
  consentString: string | null
  vendorData: unknown
  uspString: string | null
  gppString: string | null
}

// 勝利入札
export interface WinningBid {
  adUnitCode: string
  bidder: string
  cpm: number
  currency: string
  width: number
  height: number
  adId: string
  timeToRespond: number
}

export interface BidderInfo {
  code: string
  bidCount: number
  winCount: number
  avgBidCpm: number
  avgResponseTime: number
  timeoutCount: number
  currency: string
}

export interface AdUnitInfo {
  code: string
  mediaTypes: string[]
  sizes: Array<[number, number]>
  bidders: string[]
}

export interface AuctionResult {
  auctionId: string
  timestamp: number
  adUnitCode: string
  bids: BidResponse[]
  winningBid: BidResponse | null
  timeout: boolean
}

export interface BidResponse {
  bidder: string
  cpm: number
  currency: string
  width: number
  height: number
  responseTime: number
  status: 'rendered' | 'available' | 'timeout' | 'rejected'
  adId: string
}

export interface PrebidEvent {
  eventType: string
  timestamp: number
  data: unknown
}

export interface UserSyncConfig {
  enabled: boolean
  syncsPerBidder: number
  filterSettings: unknown
}
