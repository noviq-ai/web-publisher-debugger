import React from 'react'
import type { PrebidData } from '@/shared/types/prebid'
import type { GptData } from '@/shared/types/gpt'
import { Zap, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PrebidSection } from '@/components/adtech/PrebidSection'
import { GptSection } from '@/components/adtech/GptSection'

interface AdTechPageProps {
  data: PrebidData | null
  gptData: GptData | null
  isLoading: boolean
  onReload: () => void
}

export const AdTechPage: React.FC<AdTechPageProps> = ({ data, gptData, isLoading, onReload }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-sm text-muted-foreground">Loading AdTech data...</div>
        <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Reload Page
        </Button>
        <p className="text-[10px] text-muted-foreground/70 text-center max-w-48">
          If the page was already loaded before opening this panel, reload to capture AdTech data.
        </p>
      </div>
    )
  }

  const hasPrebid = data && data.detected
  const hasGpt = gptData && gptData.detected

  if (!hasPrebid && !hasGpt) {
    return (
      <div className="text-center py-12 px-4">
        <Zap className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No AdTech detected</p>
        <p className="text-xs text-muted-foreground/70 mt-1 mb-4">
          Prebid.js / Google Publisher Tag data will appear when detected
        </p>
        <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Reload Page
        </Button>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {hasPrebid && <PrebidSection data={data} />}
      {hasGpt && <GptSection data={gptData} />}
    </div>
  )
}
