import React, { useCallback, useMemo } from 'react'
import { useTabDataStore } from '@/store/tabDataStore'
import { IconBolt, IconArrowRotateLeftRight as IconRefresh, IconWifiNoSignal as IconWifiOff } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Button } from '@/components/ui/button'
import { PrebidSection } from '@/components/adtech/PrebidSection'
import { GptSection } from '@/components/adtech/GptSection'
import { AiSummaryButton, AiSummaryCard } from '@/components/ai-summary'
import { useAiSummary } from '@/hooks/useAiSummary'
import { resolvePreferredResponseLanguage } from '@/ai/browser-ai/shared'
import { streamAdTechSummary } from '@/ai/browser-ai/summaries/adtech'

interface AdTechPageProps {
  onReload: () => void
}

export const AdTechPage: React.FC<AdTechPageProps> = ({ onReload }) => {
  const data = useTabDataStore((s) => s.prebidData)
  const gptData = useTabDataStore((s) => s.gptData)
  const status = useTabDataStore((s) => s.status)
  const currentTabId = useTabDataStore((s) => s.currentTabId)
  const preferredResponseLanguage = useMemo(() => resolvePreferredResponseLanguage(typeof chrome === 'undefined' || !chrome.i18n ? null : chrome.i18n.getUILanguage(), navigator.languages), [])
  const streamSummary = useCallback((abortSignal: AbortSignal) => {
    if (!data && !gptData) throw new Error('AdTech data is unavailable')
    return streamAdTechSummary(data, gptData, abortSignal, preferredResponseLanguage)
  }, [data, gptData, preferredResponseLanguage])
  const aiSummary = useAiSummary({ sourceKey: currentTabId === null ? null : String(currentTabId), streamSummary })

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-muted-foreground">Connecting…</div>
        <p className="max-w-48 text-center text-xs text-muted-foreground/70">
          If the page was already loaded before opening this panel, reload to capture AdTech data.
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
          <IconRefresh size={14} />
          Reload Page
        </Button>
      </div>
    )
  }

  const hasPrebid = data && data.detected
  const hasGpt = gptData && gptData.detected

  if (!hasPrebid && !hasGpt) {
    return (
      <div className="text-center py-12 px-4">
        <IconBolt size={32} className="mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No AdTech detected</p>
        <p className="text-xs text-muted-foreground/70 mt-1 mb-4">
          Prebid.js / Google Publisher Tag data will appear when detected
        </p>
        <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
          <IconRefresh size={14} />
          Reload Page
        </Button>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {hasPrebid && <PrebidSection data={data} headerAction={<AiSummaryButton availability={aiSummary.availability} status={aiSummary.status} onGenerate={() => void aiSummary.generate()} onStop={aiSummary.stop} />} headerContent={aiSummary.status !== 'idle' ? <AiSummaryCard status={aiSummary.status} summary={aiSummary.summary} error={aiSummary.error} onCopy={() => void aiSummary.copy()} onRegenerate={() => void aiSummary.generate()} onClose={aiSummary.close} /> : null} />}
      {hasGpt && <GptSection data={gptData} headerAction={!hasPrebid ? <AiSummaryButton availability={aiSummary.availability} status={aiSummary.status} onGenerate={() => void aiSummary.generate()} onStop={aiSummary.stop} /> : null} headerContent={!hasPrebid && aiSummary.status !== 'idle' ? <AiSummaryCard status={aiSummary.status} summary={aiSummary.summary} error={aiSummary.error} onCopy={() => void aiSummary.copy()} onRegenerate={() => void aiSummary.generate()} onClose={aiSummary.close} /> : null} />}
    </div>
  )
}
