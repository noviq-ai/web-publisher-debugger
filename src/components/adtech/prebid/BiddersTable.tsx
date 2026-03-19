import React, { useState } from 'react'
import type { BidderInfo } from '@/shared/types/prebid'
import { IconTrendingUp, IconClock, IconAlertTriangle, IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react'
import { IconChartColumn, IconLaurelWreath } from '@tabler/icons-react'
import { Section } from '@/components/common'

interface BiddersTableProps {
  bidders: BidderInfo[]
}

type SortKey = 'code' | 'bidCount' | 'winRate' | 'avgBidCpm' | 'avgResponseTime'
type SortDir = 'asc' | 'desc'

const SortIcon: React.FC<{ col: SortKey; sortKey: SortKey; sortDir: SortDir }> = ({ col, sortKey, sortDir }) => {
  if (col !== sortKey) return <IconSelector size={12} className="opacity-30" />
  return sortDir === 'asc' ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />
}

export const BiddersTable: React.FC<BiddersTableProps> = ({ bidders }) => {
  const [sortKey, setSortKey] = useState<SortKey>('winRate')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  if (bidders.length === 0) {
    return (
      <Section title="Bidders" icon={<IconChartColumn size={14} />} count={0}>
        <p className="text-xs text-muted-foreground py-2">Waiting for auction data...</p>
      </Section>
    )
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedBidders = [...bidders].sort((a, b) => {
    const aWinRate = a.bidCount > 0 ? a.winCount / a.bidCount : 0
    const bWinRate = b.bidCount > 0 ? b.winCount / b.bidCount : 0
    let diff = 0
    switch (sortKey) {
      case 'code': diff = a.code.localeCompare(b.code); break
      case 'bidCount': diff = a.bidCount - b.bidCount; break
      case 'winRate': diff = aWinRate - bWinRate; break
      case 'avgBidCpm': diff = a.avgBidCpm - b.avgBidCpm; break
      case 'avgResponseTime': diff = a.avgResponseTime - b.avgResponseTime; break
    }
    return sortDir === 'asc' ? diff : -diff
  })

  const thClass = (_key: SortKey, align: string) =>
    `${align} py-1.5 px-1 font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors`

  return (
    <Section title="Bidder Performance" icon={<IconChartColumn size={14} />} count={bidders.length}>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border/50">
              <th className={thClass('code', 'text-left')} onClick={() => handleSort('code')}>
                <span className="flex items-center gap-0.5">Bidder <SortIcon col="code" sortKey={sortKey} sortDir={sortDir} /></span>
              </th>
              <th className={thClass('bidCount', 'text-center')} onClick={() => handleSort('bidCount')}>
                <span className="flex items-center justify-center gap-0.5">Bids <SortIcon col="bidCount" sortKey={sortKey} sortDir={sortDir} /></span>
              </th>
              <th className={thClass('winRate', 'text-center')} onClick={() => handleSort('winRate')}>
                <span className="flex items-center justify-center gap-0.5">Wins <SortIcon col="winRate" sortKey={sortKey} sortDir={sortDir} /></span>
              </th>
              <th className={thClass('avgBidCpm', 'text-right')} onClick={() => handleSort('avgBidCpm')}>
                <span className="flex items-center justify-end gap-0.5">Avg CPM <SortIcon col="avgBidCpm" sortKey={sortKey} sortDir={sortDir} /></span>
              </th>
              <th className={thClass('avgResponseTime', 'text-right')} onClick={() => handleSort('avgResponseTime')}>
                <span className="flex items-center justify-end gap-0.5">Avg Time <SortIcon col="avgResponseTime" sortKey={sortKey} sortDir={sortDir} /></span>
              </th>
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
                          <IconAlertTriangle size={10} />
                          {bidder.timeoutCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-1.5 px-1 tabular-nums">{bidder.bidCount}</td>
                  <td className="text-center py-1.5 px-1">
                    <div className="flex items-center justify-center gap-1">
                      {bidder.winCount > 0 && <IconLaurelWreath size={12} className="text-yellow-500" />}
                      <span className={`tabular-nums ${bidder.winCount > 0 ? 'text-green-600 dark:text-green-400 font-medium' : ''}`}>
                        {bidder.winCount}
                      </span>
                      <span className="text-muted-foreground text-[9px]">({winRate.toFixed(0)}%)</span>
                    </div>
                  </td>
                  <td className="text-right py-1.5 px-1">
                    <span className="flex items-center justify-end gap-0.5 tabular-nums">
                      <IconTrendingUp size={12} className="text-muted-foreground" />
                      {bidder.bidCount > 0 ? `${bidder.avgBidCpm.toFixed(2)} ${bidder.currency}` : '-'}
                    </span>
                  </td>
                  <td className="text-right py-1.5 px-1">
                    <span className="flex items-center justify-end gap-0.5 tabular-nums text-muted-foreground">
                      <IconClock size={12} />
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
