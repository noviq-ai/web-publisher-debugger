import React from 'react'
import type { BidderInfo } from '@/shared/types/prebid'
import { Users, TrendingUp, Clock, AlertTriangle, Trophy } from 'lucide-react'
import { Section } from '@/components/common'

interface BiddersTableProps {
  bidders: BidderInfo[]
}

export const BiddersTable: React.FC<BiddersTableProps> = ({ bidders }) => {
  if (bidders.length === 0) {
    return (
      <Section title="Bidders" icon={<Users className="h-3.5 w-3.5" />} count={0}>
        <p className="text-xs text-muted-foreground py-2">Waiting for auction data...</p>
      </Section>
    )
  }

  // Sort by win rate descending
  const sortedBidders = [...bidders].sort((a, b) => {
    const aWinRate = a.bidCount > 0 ? a.winCount / a.bidCount : 0
    const bWinRate = b.bidCount > 0 ? b.winCount / b.bidCount : 0
    return bWinRate - aWinRate
  })

  return (
    <Section title="Bidder Performance" icon={<Users className="h-3.5 w-3.5" />} count={bidders.length}>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-1.5 px-1 font-medium text-muted-foreground">Bidder</th>
              <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Bids</th>
              <th className="text-center py-1.5 px-1 font-medium text-muted-foreground">Wins</th>
              <th className="text-right py-1.5 px-1 font-medium text-muted-foreground">Avg CPM</th>
              <th className="text-right py-1.5 px-1 font-medium text-muted-foreground">Avg Time</th>
            </tr>
          </thead>
          <tbody>
            {sortedBidders.map((bidder) => {
              const winRate = bidder.bidCount > 0 ? (bidder.winCount / bidder.bidCount * 100) : 0
              return (
                <tr key={bidder.code} className="border-b border-border/30 last:border-b-0 hover:bg-muted/30">
                  <td className="py-1.5 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{bidder.code}</span>
                      {bidder.timeoutCount > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] text-red-500" title={`${bidder.timeoutCount} timeouts`}>
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {bidder.timeoutCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-1.5 px-1 tabular-nums">{bidder.bidCount}</td>
                  <td className="text-center py-1.5 px-1">
                    <div className="flex items-center justify-center gap-1">
                      {bidder.winCount > 0 && <Trophy className="h-3 w-3 text-yellow-500" />}
                      <span className={`tabular-nums ${bidder.winCount > 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                        {bidder.winCount}
                      </span>
                      <span className="text-muted-foreground text-[9px]">({winRate.toFixed(0)}%)</span>
                    </div>
                  </td>
                  <td className="text-right py-1.5 px-1">
                    <span className="flex items-center justify-end gap-0.5 tabular-nums">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      {bidder.bidCount > 0 ? `${bidder.avgBidCpm.toFixed(2)} ${bidder.currency}` : '-'}
                    </span>
                  </td>
                  <td className="text-right py-1.5 px-1">
                    <span className="flex items-center justify-end gap-0.5 tabular-nums text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {bidder.avgResponseTime.toFixed(0)}ms
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
