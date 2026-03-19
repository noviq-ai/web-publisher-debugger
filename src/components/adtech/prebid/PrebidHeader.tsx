import React from 'react'
import type { PrebidData } from '@/shared/types/prebid'
import { IconBolt } from '@tabler/icons-react'
import { StatBox } from '@/components/common'

interface PrebidHeaderProps {
  data: PrebidData
}

export const PrebidHeader: React.FC<PrebidHeaderProps> = ({ data }) => {
  const totalBids = data.bidders.reduce((sum, b) => sum + b.bidCount, 0)

  return (
    <div className="p-3 bg-gradient-to-b from-blue-500/10 to-transparent border-t-2 border-blue-500/30">
      <div className="flex items-center gap-2 mb-3">
        <IconBolt size={16} className="text-blue-500" />
        <span className="text-sm font-medium">Prebid.js</span>
        <span className="text-xs text-muted-foreground">{data.version || '?'}</span>
        {data.config.debug && (
          <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded">
            DEBUG
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Timeout" value={`${data.config.timeout || '?'}ms`} />
        <StatBox label="Bidders" value={data.bidders.length} />
        <StatBox label="Ad Units" value={data.adUnits.length} />
        <StatBox label="Bids" value={totalBids} highlight={totalBids > 0} />
      </div>
    </div>
  )
}
