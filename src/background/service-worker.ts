import { MessageType, type Message, type TabData } from '../shared/types'

// Debug flag - set to true for development logging
const DEBUG = false
function log(...args: unknown[]) {
  if (DEBUG) console.log(...args)
}

log('[WPD-SW] Service Worker loaded')

// アップデート時にsync→localへ設定を移行してsyncをクリア
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    try {
      const syncResult = await chrome.storage.sync.get(['settings'])
      if (syncResult.settings) {
        const localResult = await chrome.storage.local.get(['settings'])
        if (!localResult.settings) {
          await chrome.storage.local.set({ settings: syncResult.settings })
        }
        await chrome.storage.sync.remove('settings')
        log('[WPD-SW] Migrated settings from sync to local')
      }
    } catch (e) {
      log('[WPD-SW] Migration error:', e)
    }
  }
})

// Side Panelをアクションクリックで開く設定
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('[WPD-SW] Side panel setup error:', error))

// タブごとのデータストア
const tabDataStore = new Map<number, TabData>()

// Side Panelとのポート接続
let sidePanelPort: chrome.runtime.Port | null = null

// サイドパネルが表示中のタブID（アクティベーション用）
let activePanelTabId: number | null = null

chrome.runtime.onConnect.addListener((port) => {
  log('[WPD-SW] Port connected:', port.name)
  if (port.name === 'sidepanel') {
    sidePanelPort = port
    port.onDisconnect.addListener(() => {
      log('[WPD-SW] Side panel disconnected')
      sidePanelPort = null
      // activePanelTabId はリセットしない
      // 再接続後もページ遷移時の自動 COLLECT_DATA が機能するように維持する
    })
  }
})

// メッセージリスナー
chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  const tabId = sender.tab?.id
  log('[WPD-SW] Received message:', message.type, 'from tabId:', tabId)

  switch (message.type) {
    case MessageType.SEO_DATA:
      if (tabId) {
        const existing = tabDataStore.get(tabId) || {}
        tabDataStore.set(tabId, { ...existing, seo: message.payload })
        log('[WPD-SW] SEO data stored for tab:', tabId)
        broadcastToSidePanel(tabId, message)
      }
      break

    case MessageType.PREBID_DATA:
      if (tabId) {
        const existing = tabDataStore.get(tabId) || {}
        tabDataStore.set(tabId, { ...existing, prebid: message.payload })
        log('[WPD-SW] Prebid data stored for tab:', tabId)
        broadcastToSidePanel(tabId, message)
      }
      break

    case MessageType.GPT_DATA:
      if (tabId) {
        const existing = tabDataStore.get(tabId) || {}
        tabDataStore.set(tabId, { ...existing, gpt: message.payload })
        log('[WPD-SW] GPT data stored for tab:', tabId)
        broadcastToSidePanel(tabId, message)
      }
      break

    case MessageType.GTM_DATA:
      if (tabId) {
        const existing = tabDataStore.get(tabId) || {}
        tabDataStore.set(tabId, { ...existing, gtm: message.payload })
        log('[WPD-SW] GTM data stored for tab:', tabId)
        broadcastToSidePanel(tabId, message)
      }
      break

    case MessageType.ANALYTICS_DATA:
      if (tabId) {
        const existing = tabDataStore.get(tabId) || {}
        tabDataStore.set(tabId, { ...existing, analytics: message.payload })
        log('[WPD-SW] Analytics data stored for tab:', tabId)
        broadcastToSidePanel(tabId, message)
      }
      break

    case MessageType.TECH_STACK_DATA:
      if (tabId) {
        const existing = tabDataStore.get(tabId) || {}
        tabDataStore.set(tabId, { ...existing, techStack: message.payload })
        log('[WPD-SW] TechStack data stored for tab:', tabId)
        broadcastToSidePanel(tabId, message)
      }
      break

    case MessageType.GET_TAB_DATA:
      {
        const requestedTabId = message.tabId
        activePanelTabId = requestedTabId ?? null
        const data = tabDataStore.get(requestedTabId!) || {}
        log('[WPD-SW] GET_TAB_DATA for tab:', requestedTabId, 'has seo:', !!data.seo)
        sendResponse(data)
      }
      return true // 非同期レスポンス

    case MessageType.REQUEST_REFRESH:
      {
        const targetTabId = message.tabId
        activePanelTabId = targetTabId ?? null
        log('[WPD-SW] REQUEST_REFRESH for tab:', targetTabId)
        if (targetTabId) {
          chrome.tabs.sendMessage(targetTabId, { type: MessageType.COLLECT_DATA }).catch((err) => {
            log('[WPD-SW] Failed to send COLLECT_DATA to tab:', err.message)
          })
        }
      }
      break

    case MessageType.PREBID_QUERY:
      {
        const queryTabId = message.tabId
        log('[WPD-SW] PREBID_QUERY for tab:', queryTabId, 'requestId:', message.payload?.requestId)
        if (queryTabId) {
          // Forward the query to the content script and wait for response
          chrome.tabs.sendMessage(queryTabId, {
            type: MessageType.PREBID_QUERY,
            payload: message.payload,
          }).then((response) => {
            log('[WPD-SW] PREBID_QUERY response received:', message.payload?.requestId, 'success:', response?.success)
            try {
              sendResponse(response)
              log('[WPD-SW] PREBID_QUERY sendResponse called successfully')
            } catch (e) {
              log('[WPD-SW] PREBID_QUERY sendResponse error:', e)
            }
          }).catch((err) => {
            log('[WPD-SW] PREBID_QUERY failed:', err.message)
            sendResponse({
              requestId: message.payload?.requestId,
              success: false,
              error: `Failed to query content script: ${err.message}`,
            })
          })
        } else {
          sendResponse({
            requestId: message.payload?.requestId,
            success: false,
            error: 'No tab ID provided for Prebid query',
          })
        }
      }
      return true // Async response
  }
})

// タブ閉鎖時のクリーンアップ
chrome.tabs.onRemoved.addListener((tabId) => {
  log('[WPD-SW] Tab removed:', tabId)
  tabDataStore.delete(tabId)
})

// タブ更新時にデータをリセット + ページ完了時に自動アクティベーション
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    log('[WPD-SW] Tab loading, clearing data:', tabId)
    tabDataStore.delete(tabId)
  }
  // ページ読み込み完了 + サイドパネル接続中 + 対象タブ → Content Scriptを自動アクティベーション
  if (changeInfo.status === 'complete' && sidePanelPort && tabId === activePanelTabId) {
    log('[WPD-SW] Tab complete, auto-activating content script:', tabId)
    chrome.tabs.sendMessage(tabId, { type: MessageType.COLLECT_DATA }).catch((err) => {
      log('[WPD-SW] Failed to auto-activate tab:', err.message)
    })
  }
})

// Side Panelへのブロードキャスト（ポート接続がある時のみ）
function broadcastToSidePanel(tabId: number, message: Message) {
  if (sidePanelPort) {
    log('[WPD-SW] Broadcasting to side panel:', message.type)
    sidePanelPort.postMessage({ ...message, tabId })
  } else {
    log('[WPD-SW] No side panel connected, skipping broadcast')
  }
}
