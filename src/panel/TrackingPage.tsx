import React, { useCallback, useMemo } from 'react'
import { useTabDataStore } from '@/store/tabDataStore'
import { IconLiveActivity as IconActivity, IconArrowRotateLeftRight as IconRefresh, IconWifiNoSignal as IconWifiOff } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Button } from '@/components/ui/button'
import { Ga4Section } from '@/components/tracking/Ga4Section'
import { GtmSection } from '@/components/tracking/GtmSection'
import { PixelsSection } from '@/components/tracking/PixelsSection'
import { AiSummaryButton, AiSummaryCard } from '@/components/ai-summary'
import { useAiSummary } from '@/hooks/useAiSummary'
import { resolvePreferredResponseLanguage } from '@/ai/browser-ai/shared'
import { streamTrackingSummary } from '@/ai/browser-ai/summaries/tracking'

interface TrackingPageProps {
  onReload: () => void
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ onReload }) => {
  const gtmData = useTabDataStore((s) => s.gtmData)
  const analyticsData = useTabDataStore((s) => s.analyticsData)
  const status = useTabDataStore((s) => s.status)
  const currentTabId = useTabDataStore((s) => s.currentTabId)
  const preferredResponseLanguage = useMemo(() => resolvePreferredResponseLanguage(typeof chrome === 'undefined' || !chrome.i18n ? null : chrome.i18n.getUILanguage(), navigator.languages), [])
  const streamSummary = useCallback((abortSignal: AbortSignal) => {
    if (!analyticsData && !gtmData) throw new Error('Tracking data is unavailable')
    return streamTrackingSummary(analyticsData, gtmData, abortSignal, preferredResponseLanguage)
  }, [analyticsData, gtmData, preferredResponseLanguage])
  const aiSummary = useAiSummary({ sourceKey: currentTabId === null ? null : String(currentTabId), streamSummary })

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent motion-reduce:animate-none" />
        <div className="text-sm text-muted-foreground">Connecting…</div>
        <p className="max-w-48 text-center text-xs text-muted-foreground/70">
          If the page was already loaded before opening this panel, reload to capture tracking data.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <IconWifiOff size={32} className="text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Could not collect data.</p>
        <p className="text-xs text-muted-foreground/70 text-center max-w-48">
          This may be a restricted page (chrome://, file://) or the page has not finished loading.
        </p>
        <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
          <IconRefresh className="h-3.5 w-3.5" />
          Reload Page
        </Button>
      </div>
    )
  }

  const hasGtm = gtmData && gtmData.detected
  const ga4Data = analyticsData?.ga4 ?? null
  const hasGa4 = ga4Data?.detected
  const hasPixels = analyticsData?.pixels && analyticsData.pixels.length > 0

  const showEmptyHeader = !hasGtm && !hasGa4 && !hasPixels

  return (
    <div className="divide-y divide-border/50">
      {showEmptyHeader && (
        <div className="text-center py-8 px-4">
          <IconActivity className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No tracking detected</p>
          <p className="text-xs text-muted-foreground/70 mt-1 mb-4">
            GTM, GA4, and pixel data will appear when detected
          </p>
          <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
            <IconRefresh className="h-3.5 w-3.5" />
            Reload Page
          </Button>
        </div>
      )}

      {hasGa4 && <Ga4Section data={ga4Data} headerAction={<AiSummaryButton availability={aiSummary.availability} status={aiSummary.status} onGenerate={() => void aiSummary.generate()} onStop={aiSummary.stop} />} headerContent={aiSummary.status !== 'idle' ? <AiSummaryCard status={aiSummary.status} summary={aiSummary.summary} error={aiSummary.error} onCopy={() => void aiSummary.copy()} onRegenerate={() => void aiSummary.generate()} onClose={aiSummary.close} /> : null} />}
      {hasGtm && <GtmSection data={gtmData} headerAction={!hasGa4 ? <AiSummaryButton availability={aiSummary.availability} status={aiSummary.status} onGenerate={() => void aiSummary.generate()} onStop={aiSummary.stop} /> : null} headerContent={!hasGa4 && aiSummary.status !== 'idle' ? <AiSummaryCard status={aiSummary.status} summary={aiSummary.summary} error={aiSummary.error} onCopy={() => void aiSummary.copy()} onRegenerate={() => void aiSummary.generate()} onClose={aiSummary.close} /> : null} />}
      {hasPixels && <PixelsSection pixels={analyticsData?.pixels ?? []} headerAction={!hasGa4 && !hasGtm ? <AiSummaryButton availability={aiSummary.availability} status={aiSummary.status} onGenerate={() => void aiSummary.generate()} onStop={aiSummary.stop} /> : null} headerContent={!hasGa4 && !hasGtm && aiSummary.status !== 'idle' ? <AiSummaryCard status={aiSummary.status} summary={aiSummary.summary} error={aiSummary.error} onCopy={() => void aiSummary.copy()} onRegenerate={() => void aiSummary.generate()} onClose={aiSummary.close} /> : null} />}
    </div>
  )
}
