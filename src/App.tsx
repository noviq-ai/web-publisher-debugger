import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { useTabDataSync } from '@/hooks/useTabDataSync'
import { useTabDataStore } from '@/store/tabDataStore'
import { SeoPage, AdTechPage, TrackingPage, AiPage } from '@/panel'
import type { TabId } from '@/shared/types'
import { defaultSettings } from '@/shared/types'

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId | null>(null)

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['settings'], (result) => {
        const tab = result.settings?.defaultTab ?? defaultSettings.defaultTab
        setActiveTab(tab)
      })
    } else {
      const stored = localStorage.getItem('settings')
      if (stored) {
        const settings = JSON.parse(stored)
        setActiveTab(settings.defaultTab ?? defaultSettings.defaultTab)
      } else {
        setActiveTab(defaultSettings.defaultTab)
      }
    }
  }, [])

  // 副作用（ポート接続・タブ監視）をここで一度だけ起動
  const { reloadPage } = useTabDataSync()

  // ストアから status だけ取得（Layout のリフレッシュボタン用）
  const status = useTabDataStore((s) => s.status)

  const renderContent = () => {
    switch (activeTab) {
      case 'ai':
        return (
          <div className="flex-1 min-h-0 overflow-hidden">
            <AiPage />
          </div>
        )
      case 'seo':
        return (
          <div className="flex-1 overflow-y-auto">
            <SeoPage onReload={reloadPage} />
          </div>
        )
      case 'adtech':
        return (
          <div className="flex-1 overflow-y-auto">
            <AdTechPage onReload={reloadPage} />
          </div>
        )
      case 'tracking':
        return (
          <div className="flex-1 overflow-y-auto">
            <TrackingPage onReload={reloadPage} />
          </div>
        )
    }
  }

  // 設定読み込み中
  if (activeTab === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      status={status}
      onRefresh={reloadPage}
    >
      {renderContent()}
    </Layout>
  )
}
