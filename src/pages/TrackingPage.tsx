import React from 'react'
import type { GtmData } from '@/shared/types/gtm'
import type { AnalyticsData } from '@/shared/types/analytics'
import { IconActivity, IconRefresh } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Ga4Section } from '@/components/tracking/Ga4Section'
import { GtmSection } from '@/components/tracking/GtmSection'
import { PixelsSection } from '@/components/tracking/PixelsSection'

interface TrackingPageProps {
  gtmData: GtmData | null
  analyticsData: AnalyticsData | null
  isLoading: boolean
  onReload: () => void
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ gtmData, analyticsData, isLoading, onReload }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-sm text-muted-foreground">Loading tracking data...</div>
        <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
          <IconRefresh className="h-3.5 w-3.5" />
          Reload Page
        </Button>
        <p className="text-[10px] text-muted-foreground/70 text-center max-w-48">
          If the page was already loaded before opening this panel, reload to capture tracking data.
        </p>
      </div>
    )
  }

  const hasGtm = gtmData && gtmData.detected
  const ga4Data = analyticsData?.ga4 ?? null
  const hasGa4 = ga4Data?.detected
  const hasPixels = analyticsData?.pixels && analyticsData.pixels.length > 0

  // Always show pixels section (even if not detected)
  const showPixelsSection = true
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

      <Ga4Section data={ga4Data} />
      {hasGtm && <GtmSection data={gtmData} />}
      {showPixelsSection && <PixelsSection pixels={analyticsData?.pixels || []} />}
    </div>
  )
}
