import type { AnalyticsData, PixelData, PixelEvent, PixelType, Ga4Config, Ga4Consent } from '../../shared/types/analytics'
import { safeSendMessage } from '../utils/safe-messaging'

const DEBUG = false
function log(...args: unknown[]) {
  if (DEBUG) console.log(...args)
}

const MSG_ANALYTICS_DATA = 'ANALYTICS_DATA'

let analyticsData: AnalyticsData = {
  ga4: null,
  pixels: [],
  collectedAt: Date.now(),
}

export function initAnalyticsCollector() {
  // GA4検出
  detectGa4()

  // Pixel検出
  detectPixels()

  // 注入スクリプト経由のイベント監視
  window.addEventListener('message', (event) => {
    if (event.source !== window) return

    const { type, payload } = event.data

    // GA4 Events
    if (type === 'WPD_GA4_EVENT') {
      ensureGa4Data()
      if (analyticsData.ga4) {
        analyticsData.ga4.events.push(payload)
        notifyUpdate()
      }
    }

    // GA4 Config
    if (type === 'WPD_GA4_CONFIG') {
      ensureGa4Data()
      if (analyticsData.ga4) {
        // Measurement IDを更新
        if (payload.targetId?.startsWith('G-')) {
          analyticsData.ga4.measurementId = payload.targetId
        }
        analyticsData.ga4.configs.push({
          timestamp: payload.timestamp,
          targetId: payload.targetId,
          config: payload.config,
        } as Ga4Config)
        notifyUpdate()
      }
    }

    // GA4 Set
    if (type === 'WPD_GA4_SET') {
      ensureGa4Data()
      if (analyticsData.ga4) {
        // setは特別なイベントとして記録
        analyticsData.ga4.events.push({
          timestamp: payload.timestamp,
          name: '__set__',
          params: payload.params,
        })
        notifyUpdate()
      }
    }

    // GA4 Consent
    if (type === 'WPD_GA4_CONSENT') {
      ensureGa4Data()
      if (analyticsData.ga4) {
        analyticsData.ga4.consent = {
          timestamp: payload.timestamp,
          type: payload.consentArg,
          params: payload.consentParams,
        } as Ga4Consent
        notifyUpdate()
      }
    }

    // Pixel Events (all pixel types)
    if (type === 'WPD_PIXEL_EVENT') {
      const { pixelType, pixelId, event: pixelEvent } = payload
      addOrUpdatePixel(pixelType, pixelId, pixelEvent)
      notifyUpdate()
    }
  })
}

function ensureGa4Data() {
  if (!analyticsData.ga4) {
    analyticsData.ga4 = {
      detected: true,
      measurementId: null,
      events: [],
      configs: [],
      consent: null,
    }
  }
}

function addOrUpdatePixel(pixelType: PixelType, pixelId: string, pixelEvent: PixelEvent) {
  let pixel = analyticsData.pixels.find((p) => p.type === pixelType && p.id === pixelId)
  if (!pixel) {
    pixel = { type: pixelType, id: pixelId, events: [] }
    analyticsData.pixels.push(pixel)
  }
  pixel.events.push(pixelEvent)
}

function detectGa4() {
  // GA4スクリプトを検索
  const ga4Script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
  if (ga4Script) {
    const src = ga4Script.getAttribute('src') || ''
    const match = src.match(/[?&]id=(G-[A-Z0-9]+)/)
    analyticsData.ga4 = {
      detected: true,
      measurementId: match ? match[1] : null,
      events: [],
      configs: [],
      consent: null,
    }
  }

  // インラインスクリプトも確認
  const scripts = document.querySelectorAll('script')
  scripts.forEach((script) => {
    const text = script.textContent || ''
    const match = text.match(/G-[A-Z0-9]+/)
    if (match && !analyticsData.ga4) {
      analyticsData.ga4 = {
        detected: true,
        measurementId: match[0],
        events: [],
        configs: [],
        consent: null,
      }
    }
  })
}

function detectPixels() {
  const scripts = document.querySelectorAll('script')
  const bodyHtml = document.body?.innerHTML || ''

  // Facebook/Meta Pixel
  const fbScript = document.querySelector('script[src*="connect.facebook.net"]')
  if (fbScript) {
    scripts.forEach((script) => {
      const text = script.textContent || ''
      const match = text.match(/fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/)
      if (match && !analyticsData.pixels.find(p => p.type === 'facebook' && p.id === match[1])) {
        analyticsData.pixels.push({
          type: 'facebook',
          id: match[1],
          events: [],
        })
      }
    })
  }

  // Twitter/X Pixel
  const twitterScript = document.querySelector('script[src*="static.ads-twitter.com"]')
  if (twitterScript) {
    scripts.forEach((script) => {
      const text = script.textContent || ''
      const match = text.match(/twq\s*\(\s*['"]init['"]\s*,\s*['"]([^'"]+)['"]/)
      if (match && !analyticsData.pixels.find(p => p.type === 'twitter' && p.id === match[1])) {
        analyticsData.pixels.push({
          type: 'twitter',
          id: match[1],
          events: [],
        })
      }
    })
  }

  // TikTok Pixel
  const tiktokMatch = bodyHtml.match(/ttq\.load\s*\(\s*['"]([^'"]+)['"]/)
  if (tiktokMatch && !analyticsData.pixels.find(p => p.type === 'tiktok' && p.id === tiktokMatch[1])) {
    analyticsData.pixels.push({
      type: 'tiktok',
      id: tiktokMatch[1],
      events: [],
    })
  }

  // LinkedIn Insight Tag
  scripts.forEach((script) => {
    const text = script.textContent || ''
    const match = text.match(/_linkedin_partner_id\s*=\s*['"]?(\d+)['"]?/)
    if (match && !analyticsData.pixels.find(p => p.type === 'linkedin' && p.id === match[1])) {
      analyticsData.pixels.push({
        type: 'linkedin',
        id: match[1],
        events: [],
      })
    }
  })

  // Pinterest Tag
  const pinterestScript = document.querySelector('script[src*="pintrk"]') ||
    document.querySelector('script[src*="s.pinimg.com"]')
  if (pinterestScript) {
    scripts.forEach((script) => {
      const text = script.textContent || ''
      const match = text.match(/pintrk\s*\(\s*['"]load['"]\s*,\s*['"](\d+)['"]/)
      if (match && !analyticsData.pixels.find(p => p.type === 'pinterest' && p.id === match[1])) {
        analyticsData.pixels.push({
          type: 'pinterest',
          id: match[1],
          events: [],
        })
      }
    })
  }

  // Criteo OneTag
  const criteoScript = document.querySelector('script[src*="dynamic.criteo.com"]')
  if (criteoScript) {
    scripts.forEach((script) => {
      const text = script.textContent || ''
      const match = text.match(/setAccount['"]\s*,\s*account\s*:\s*['"]?(\d+)['"]?/) ||
        text.match(/a=(\d+)/)
      if (match && !analyticsData.pixels.find(p => p.type === 'criteo' && p.id === match[1])) {
        analyticsData.pixels.push({
          type: 'criteo',
          id: match[1],
          events: [],
        })
      }
    })
  }

  // Snap Pixel
  const snapScript = document.querySelector('script[src*="sc-static.net"]')
  if (snapScript) {
    scripts.forEach((script) => {
      const text = script.textContent || ''
      const match = text.match(/snaptr\s*\(\s*['"]init['"]\s*,\s*['"]([^'"]+)['"]/)
      if (match && !analyticsData.pixels.find(p => p.type === 'snapchat' && p.id === match[1])) {
        analyticsData.pixels.push({
          type: 'snapchat',
          id: match[1],
          events: [],
        })
      }
    })
  }
}

function notifyUpdate() {
  log('[WPD] Analytics notifyUpdate')
  analyticsData.collectedAt = Date.now()
  safeSendMessage({
    type: MSG_ANALYTICS_DATA,
    payload: analyticsData,
  })
}

export function getAnalyticsData(): AnalyticsData {
  return analyticsData
}

export function addPixelEvent(pixelType: PixelData['type'], pixelId: string, event: PixelEvent) {
  addOrUpdatePixel(pixelType, pixelId, event)
  notifyUpdate()
}
