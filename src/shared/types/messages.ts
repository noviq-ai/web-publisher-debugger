import type { SeoData } from './seo'
import type { PrebidData } from './prebid'
import type { GptData } from './gpt'
import type { GtmData } from './gtm'
import type { AnalyticsData } from './analytics'
import type { TechStackData } from './techstack'

export enum MessageType {
  // Data collection
  SEO_DATA = 'SEO_DATA',
  PREBID_DATA = 'PREBID_DATA',
  GPT_DATA = 'GPT_DATA',
  GTM_DATA = 'GTM_DATA',
  ANALYTICS_DATA = 'ANALYTICS_DATA',
  TECH_STACK_DATA = 'TECH_STACK_DATA',

  // Commands
  COLLECT_DATA = 'COLLECT_DATA',
  REQUEST_REFRESH = 'REQUEST_REFRESH',
  GET_TAB_DATA = 'GET_TAB_DATA',

  // Prebid Query (dynamic API calls)
  PREBID_QUERY = 'PREBID_QUERY',
  PREBID_QUERY_RESULT = 'PREBID_QUERY_RESULT',

  // Events
  TAB_CHANGED = 'TAB_CHANGED',
}

// Prebid Query types
export type PrebidQueryType =
  | 'GET_BID_RESPONSES_FOR_AD_UNIT'
  | 'GET_NO_BIDS_FOR_AD_UNIT'
  | 'GET_HIGHEST_CPM_BIDS'
  | 'GET_ADSERVER_TARGETING'
  | 'GET_EVENTS'
  | 'DIAGNOSE_BIDDER'
  | 'ANALYZE_AD_UNIT'

export interface PrebidQueryRequest {
  queryType: PrebidQueryType
  params: Record<string, unknown>
  requestId: string
}

export interface PrebidQueryResponse {
  requestId: string
  success: boolean
  data?: unknown
  error?: string
}

export interface BaseMessage {
  type: MessageType
  tabId?: number
}

export interface SeoDataMessage extends BaseMessage {
  type: MessageType.SEO_DATA
  payload: SeoData
}

export interface PrebidDataMessage extends BaseMessage {
  type: MessageType.PREBID_DATA
  payload: PrebidData
}

export interface GptDataMessage extends BaseMessage {
  type: MessageType.GPT_DATA
  payload: GptData
}

export interface GtmDataMessage extends BaseMessage {
  type: MessageType.GTM_DATA
  payload: GtmData
}

export interface AnalyticsDataMessage extends BaseMessage {
  type: MessageType.ANALYTICS_DATA
  payload: AnalyticsData
}

export interface TechStackDataMessage extends BaseMessage {
  type: MessageType.TECH_STACK_DATA
  payload: TechStackData
}

export interface CollectDataMessage extends BaseMessage {
  type: MessageType.COLLECT_DATA
}

export interface RequestRefreshMessage extends BaseMessage {
  type: MessageType.REQUEST_REFRESH
  tabId: number
}

export interface GetTabDataMessage extends BaseMessage {
  type: MessageType.GET_TAB_DATA
  tabId: number
}

export interface PrebidQueryMessage extends BaseMessage {
  type: MessageType.PREBID_QUERY
  tabId: number
  payload: PrebidQueryRequest
}

export interface PrebidQueryResultMessage extends BaseMessage {
  type: MessageType.PREBID_QUERY_RESULT
  payload: PrebidQueryResponse
}

export type Message =
  | SeoDataMessage
  | PrebidDataMessage
  | GptDataMessage
  | GtmDataMessage
  | AnalyticsDataMessage
  | TechStackDataMessage
  | CollectDataMessage
  | RequestRefreshMessage
  | GetTabDataMessage
  | PrebidQueryMessage
  | PrebidQueryResultMessage

export interface TabData {
  seo?: SeoData
  prebid?: PrebidData
  gpt?: GptData
  gtm?: GtmData
  analytics?: AnalyticsData
  techStack?: TechStackData
}
