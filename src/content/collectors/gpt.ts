// GPT (Google Publisher Tag) Data Collector
const DEBUG = false
function log(...args: unknown[]) {
  if (DEBUG) console.log(...args)
}

import { safeSendMessage } from '../utils/safe-messaging'
import type {
  GptData,
  GptSlot,
  GptEvent,
  GptEventType,
  GptResponseInfo,
  GptSize,
} from '../../shared/types/gpt'

// GPT Collectorの状態
let gptData: GptData = createInitialGptData()
let listeners: Array<(data: GptData) => void> = []

function createInitialGptData(): GptData {
  return {
    detected: false,
    version: null,
    slots: [],
    pageTargeting: {},
    config: {
      initialLoadDisabled: false,
      singleRequest: false,
      lazyLoadEnabled: false,
      privacySettingsToken: null,
    },
    events: [],
    collectedAt: Date.now(),
  }
}

// 初期データの処理
interface GptInitialPayload {
  version: string | null
  slots: Array<{
    slotElementId: string
    adUnitPath: string
    sizes: Array<{ width: number | 'fluid'; height: number | 'fluid' }>
    targeting: Record<string, string[]>
    responseInfo: GptResponseInfo | null
  }>
  pageTargeting: Record<string, string[]>
  config: {
    initialLoadDisabled: boolean
    singleRequest: boolean
    lazyLoadEnabled: boolean
    privacySettingsToken: string | null
  }
}

export function processGptInitialData(payload: GptInitialPayload): void {
  log('[GPT Collector] Processing initial data:', payload)

  gptData.detected = true
  gptData.version = payload.version
  gptData.pageTargeting = payload.pageTargeting
  gptData.config = payload.config

  // スロットデータを変換
  gptData.slots = payload.slots.map((slot) => ({
    slotElementId: slot.slotElementId,
    adUnitPath: slot.adUnitPath,
    sizes: slot.sizes as GptSize[],
    targeting: slot.targeting,
    responseInfo: slot.responseInfo,
    renderInfo: null,
  }))

  gptData.collectedAt = Date.now()
  notifyListeners()
}

// スロット更新の処理
interface GptSlotsUpdatePayload {
  slots: Array<{
    slotElementId: string
    adUnitPath: string
    sizes: Array<{ width: number | 'fluid'; height: number | 'fluid' }>
    targeting: Record<string, string[]>
    responseInfo: GptResponseInfo | null
  }>
}

export function processGptSlotsUpdate(payload: GptSlotsUpdatePayload): void {
  log('[GPT Collector] Processing slots update:', payload.slots.length, 'slots')

  // 既存のスロットを更新または追加
  payload.slots.forEach((newSlot) => {
    const existingIndex = gptData.slots.findIndex(
      (s) => s.slotElementId === newSlot.slotElementId
    )

    const slotData: GptSlot = {
      slotElementId: newSlot.slotElementId,
      adUnitPath: newSlot.adUnitPath,
      sizes: newSlot.sizes as GptSize[],
      targeting: newSlot.targeting,
      responseInfo: newSlot.responseInfo,
      renderInfo: existingIndex >= 0 ? gptData.slots[existingIndex].renderInfo : null,
    }

    if (existingIndex >= 0) {
      gptData.slots[existingIndex] = slotData
    } else {
      gptData.slots.push(slotData)
    }
  })

  gptData.collectedAt = Date.now()
  notifyListeners()
}

// イベントの処理
interface GptEventPayload {
  eventType: string
  timestamp: number
  slotElementId: string
  data: unknown
}

export function processGptEvent(payload: GptEventPayload): void {
  log('[GPT Collector] Processing event:', payload.eventType, payload.slotElementId)

  const event: GptEvent = {
    eventType: payload.eventType as GptEventType,
    timestamp: payload.timestamp,
    slotElementId: payload.slotElementId,
    data: payload.data,
  }

  gptData.events.push(event)

  // slotRenderEndedイベントの場合、renderInfoを更新
  if (payload.eventType === 'slotRenderEnded') {
    const renderData = payload.data as {
      isEmpty: boolean
      size: [number, number] | null
      advertiserId?: number | null
      campaignId?: number | null
      creativeId?: number | null
      lineItemId?: number | null
      sourceAgnosticCreativeId?: number | null
      sourceAgnosticLineItemId?: number | null
      isBackfill?: boolean
      creativeTemplateId?: number | null
    }

    const slotIndex = gptData.slots.findIndex(
      (s) => s.slotElementId === payload.slotElementId
    )

    if (slotIndex >= 0) {
      gptData.slots[slotIndex].renderInfo = {
        isEmpty: renderData.isEmpty,
        size: renderData.size,
        renderedAt: payload.timestamp,
      }

      // responseInfoも更新（イベントから取得できる場合）
      if (renderData.advertiserId !== undefined) {
        gptData.slots[slotIndex].responseInfo = {
          advertiserId: renderData.advertiserId,
          campaignId: renderData.campaignId ?? null,
          creativeId: renderData.creativeId ?? null,
          lineItemId: renderData.lineItemId ?? null,
          sourceAgnosticCreativeId: renderData.sourceAgnosticCreativeId ?? null,
          sourceAgnosticLineItemId: renderData.sourceAgnosticLineItemId ?? null,
          isBackfill: renderData.isBackfill ?? false,
          creativeTemplateId: renderData.creativeTemplateId ?? null,
        }
      }
    }
  }

  gptData.collectedAt = Date.now()
  notifyListeners()
}

// GPT Not Found の処理
export function processGptNotFound(): void {
  log('[GPT Collector] GPT not found')
  gptData.detected = false
  notifyListeners()
}

// 現在のデータを取得
export function getGptData(): GptData {
  return { ...gptData }
}

// リスナー登録
export function subscribeGpt(listener: (data: GptData) => void): () => void {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

// リスナーに通知 + Service Workerに送信
function notifyListeners(): void {
  const data = getGptData()
  listeners.forEach((listener) => {
    try {
      listener(data)
    } catch (e) {
      console.error('[GPT Collector] Listener error:', e)
    }
  })

  // Service Workerにも送信
  safeSendMessage({
    type: 'GPT_DATA',
    payload: data,
  })
}

// データをリセット
export function resetGptData(): void {
  gptData = createInitialGptData()
  notifyListeners()
}

// GPT Collectorを初期化（Content Scriptから呼ばれる）
export function initGptCollector(): void {
  log('[GPT Collector] Initializing')

  // injected.jsからのメッセージをリッスン
  window.addEventListener('message', (event) => {
    if (event.source !== window) return

    switch (event.data.type) {
      case 'WPD_GPT_INITIAL':
        processGptInitialData(event.data.payload)
        break
      case 'WPD_GPT_SLOTS_UPDATE':
        processGptSlotsUpdate(event.data.payload)
        break
      case 'WPD_GPT_EVENT':
        processGptEvent(event.data.payload)
        break
      case 'WPD_GPT_NOT_FOUND':
        processGptNotFound()
        break
    }
  })
}

// GPTデータの再収集をリクエスト
export function requestGptDataCollection(): void {
  log('[GPT Collector] Requesting data collection')
  window.postMessage({ type: 'WPD_COLLECT_GPT' }, '*')
}
