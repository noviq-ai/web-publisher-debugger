import React from 'react'
import type { WinningBid } from '@/shared/types/prebid'
import { Badge } from '@/components/ui/badge'
import { Trophy, Clock } from 'lucide-react'
import { Section } from '@/components/common'

interface WinningBidsProps {
  bids: WinningBid[]
  title?: string
  variant?: 'won' | 'pending'
}

export const WinningBids: React.FC<WinningBidsProps> = ({ bids, title = 'Winning Bids', variant = 'won' }) => {
  if (bids.length === 0) return null

  const isWon = variant === 'won'
  const bgClass = isWon ? 'bg-green-500/5 border-green-500/20' : 'bg-blue-500/5 border-blue-500/20'
  const cpmClass = isWon ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
  const badgeClass = isWon ? 'bg-green-600' : ''

  return (
    <Section title={title} icon={<Trophy className="h-3.5 w-3.5" />} count={bids.length} defaultOpen>
      <div className="space-y-2">
        {bids.map((bid, idx) => (
          <div key={idx} className={`border rounded-md p-2 ${bgClass}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium truncate flex-1 mr-2" title={bid.adUnitCode}>{bid.adUnitCode}</span>
              <Badge variant={isWon ? 'default' : 'secondary'} className={`text-[10px] px-1.5 py-0 h-4 ${badgeClass}`}>{bid.bidder}</Badge>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className={`font-medium ${cpmClass}`}>
                {bid.cpm.toFixed(2)} {bid.currency}
              </span>
              <span>{bid.width}×{bid.height}</span>
              <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{bid.timeToRespond}ms</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
