import React from 'react'
import type { WinningBid } from '@/shared/types/prebid'
import { Badge } from '@/components/ui/badge'
import { IconClock } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { IconWreathSimple as IconLaurelWreath1, IconWreath as IconLaurelWreath } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface WinningBidsProps {
  bids: WinningBid[]
  title?: string
  variant?: 'won' | 'pending'
}

export const WinningBids: React.FC<WinningBidsProps> = ({ bids, title = 'Winning Bids', variant = 'won' }) => {
  if (bids.length === 0) return null

  const isWon = variant === 'won'
  const bgClass = isWon ? 'bg-success/10 border-success/20' : 'bg-info/10 border-info/20'
  const cpmClass = isWon ? 'text-success' : 'text-info'
  const badgeClass = isWon ? 'bg-success text-white' : 'bg-info/20 text-info'

  return (
    <Section title={title} icon={isWon ? <IconLaurelWreath1 size={14} /> : <IconLaurelWreath size={14} />} count={bids.length}>
      <div className="space-y-2">
        {bids.map((bid, idx) => (
          <div key={idx} className={`border rounded-md p-2 ${bgClass}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium truncate flex-1 mr-2" title={bid.adUnitCode}>{bid.adUnitCode}</span>
              <Badge variant="secondary" className={`h-5 rounded-full px-2 text-xs ${badgeClass}`}>{bid.bidder}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className={`font-medium ${cpmClass}`}>
                {bid.cpm.toFixed(2)} {bid.currency}
              </span>
              <span>{bid.width}×{bid.height}</span>
              <span className="flex items-center gap-0.5"><IconClock size={12} />{bid.timeToRespond}ms</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
