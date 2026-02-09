import type { GtmData, DataLayerEvent } from '../../shared/types/gtm'
import { safeSendMessage } from '../utils/safe-messaging'

const DEBUG = false
function log(...args: unknown[]) {
  if (DEBUG) console.log(...args)
}

const MSG_GTM_DATA = 'GTM_DATA'

let gtmData: GtmData = {
  detected: false,
  containerId: null,
  containerVersion: null,
  dataLayerEvents: [],
  tagsFired: [],
  variables: [],
  collectedAt: Date.now(),
}

export function initGtmCollector() {
  // GTM検出
  detectGtm()

  // dataLayer監視（注入スクリプト経由）
  window.addEventListener('message', (event) => {
    if (event.source !== window) return

    if (event.data.type === 'WPD_DATALAYER_PUSH') {
      gtmData.dataLayerEvents.push(event.data.payload)
      notifyUpdate()
    }
  })
}

function detectGtm() {
  // GTMスクリプトを検索
  const gtmScript = document.querySelector('script[src*="googletagmanager.com/gtm.js"]')
  if (gtmScript) {
    const src = gtmScript.getAttribute('src') || ''
    const match = src.match(/[?&]id=(GTM-[A-Z0-9]+)/)
    gtmData.detected = true
    gtmData.containerId = match ? match[1] : null
  }

  // インラインGTMスクリプトも確認
  const scripts = document.querySelectorAll('script')
  scripts.forEach((script) => {
    const text = script.textContent || ''
    const match = text.match(/GTM-[A-Z0-9]+/)
    if (match && !gtmData.containerId) {
      gtmData.detected = true
      gtmData.containerId = match[0]
    }
  })
}

function notifyUpdate() {
  log('[WPD] GTM notifyUpdate')
  gtmData.collectedAt = Date.now()
  safeSendMessage({
    type: MSG_GTM_DATA,
    payload: gtmData,
  })
}

export function getGtmData(): GtmData {
  return gtmData
}

export function addDataLayerEvent(event: DataLayerEvent) {
  gtmData.dataLayerEvents.push(event)
  notifyUpdate()
}
