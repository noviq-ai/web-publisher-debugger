import React from 'react'
import type { GtmData } from '@/shared/types/gtm'
import { StatBox } from '@/components/common'

interface GtmHeaderProps {
  data: GtmData
  action: React.ReactNode
}

export const GtmHeader: React.FC<GtmHeaderProps> = ({ data, action }) => {
  // Count unique event types
  const uniqueEvents = new Set(data.dataLayerEvents.map((e) => e.event)).size

  return (
    <div className="border-b border-border/50 p-3">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-muted/60">
          <img src="/icons/google-tag-manager.svg" alt="" width={16} height={16} className="size-4" />
        </span>
        <span className="text-sm font-medium">Google Tag Manager</span>
        {data.containerId && (
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">{data.containerId}</span>
        )}
        {data.containerVersion && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            v{data.containerVersion}
          </span>
        )}
        <div className="ml-auto">{action}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Events" value={data.dataLayerEvents.length} variant={data.dataLayerEvents.length > 0 ? 'success' : 'default'} />
        <StatBox label="Event Types" value={uniqueEvents} variant={uniqueEvents > 0 ? 'info' : 'default'} />
        <StatBox label="Tags Fired" value={data.tagsFired.length} variant={data.tagsFired.length > 0 ? 'success' : 'default'} />
      </div>
    </div>
  )
}
