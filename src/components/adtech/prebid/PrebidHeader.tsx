import React from 'react'
import type { PrebidData } from '@/shared/types/prebid'
import { StatBox } from '@/components/common'
import { PrebidIcon } from './PrebidIcon'

interface PrebidHeaderProps {
  data: PrebidData
  action: React.ReactNode
}

export const PrebidHeader: React.FC<PrebidHeaderProps> = ({ data, action }) => {
  const totalBids = data.bidders.reduce((sum, b) => sum + b.bidCount, 0)

  return (
    <div className="border-b border-border/50 p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-muted/60">
          <PrebidIcon className="size-4" />
        </span>
        <span className="text-sm font-medium">Prebid.js</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{data.version || '?'}</span>
        {data.config.debug && (
          <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning">
            DEBUG
          </span>
        )}
        <div className="ml-auto">{action}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Timeout" value={`${data.config.timeout || '?'}ms`} />
        <StatBox label="Bidders" value={data.bidders.length} variant="info" />
        <StatBox label="Ad Units" value={data.adUnits.length} variant="info" />
        <StatBox label="Bids" value={totalBids} variant={totalBids > 0 ? 'success' : 'default'} />
      </div>
    </div>
  )
}
