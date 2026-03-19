import React, { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { useMessageListener } from '@/hooks/useMessageListener'
import { SeoPage, AdTechPage, TrackingPage, AiPage } from '@/pages'
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
  const { seoData, prebidData, gptData, gtmData, analyticsData, isLoading, reloadPage, tabId } = useMessageListener()

  const renderContent = () => {
    switch (activeTab) {
      case 'ai':
        return (
          <div className="flex-1 min-h-0 overflow-hidden">
            <AiPage
              seoData={seoData}
              prebidData={prebidData}
              gtmData={gtmData}
              analyticsData={analyticsData}
              tabId={tabId}
            />
          </div>
        )
      case 'seo':
        return (
          <div className="flex-1 overflow-y-auto">
              <SeoPage data={seoData} isLoading={isLoading} onReload={reloadPage} />
          </div>
        )
      case 'adtech':
        return (
          <div className="flex-1 overflow-y-auto">
              <AdTechPage data={prebidData} gptData={gptData} isLoading={isLoading} onReload={reloadPage} />
          </div>
        )
      case 'tracking':
        return (
          <div className="flex-1 overflow-y-auto">
            <TrackingPage gtmData={gtmData} analyticsData={analyticsData} isLoading={isLoading} onReload={reloadPage} />
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
      isLoading={isLoading}
      onRefresh={reloadPage}
    >
      {renderContent()}
    </Layout>
  )
}
