import React, { useState } from 'react'
import type { BidderInfo } from '@/shared/types/prebid'
import { IconTrending1 as IconTrendingUp, IconClock, IconExclamationTriangle as IconAlertTriangle, IconChevronTopMedium as IconChevronUp, IconChevronDownMedium as IconChevronDown, IconSortArrowUpDown as IconSelector } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { IconStackedBarChartAxis2 as IconChartColumn, IconWreath as IconLaurelWreath } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
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

  const sortButtonClass = (align: string) =>
    `flex w-full items-center gap-0.5 px-1 py-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded focus-visible:ring-2 focus-visible:ring-ring/40 ${align}`

  return (
    <Section title="Bidder Performance" icon={<IconChartColumn size={14} />} count={bidders.length}>
      <div className="overflow-hidden">
        <table className="w-full table-fixed text-xs">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left">
                <button className={sortButtonClass('justify-start')} onClick={() => handleSort('code')}>Bidder <SortIcon col="code" sortKey={sortKey} sortDir={sortDir} /></button>
              </th>
              <th className="text-center">
                <button className={sortButtonClass('justify-center')} onClick={() => handleSort('bidCount')}>Bids <SortIcon col="bidCount" sortKey={sortKey} sortDir={sortDir} /></button>
              </th>
              <th className="text-center">
                <button className={sortButtonClass('justify-center')} onClick={() => handleSort('winRate')}>Wins <SortIcon col="winRate" sortKey={sortKey} sortDir={sortDir} /></button>
              </th>
              <th className="text-right">
                <button className={sortButtonClass('justify-end')} onClick={() => handleSort('avgBidCpm')}>Avg CPM <SortIcon col="avgBidCpm" sortKey={sortKey} sortDir={sortDir} /></button>
              </th>
              <th className="text-right">
                <button className={sortButtonClass('justify-end')} onClick={() => handleSort('avgResponseTime')}>Avg Time <SortIcon col="avgResponseTime" sortKey={sortKey} sortDir={sortDir} /></button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedBidders.map((bidder) => {
              const winRate = bidder.bidCount > 0 ? (bidder.winCount / bidder.bidCount * 100) : 0
              return (
                <tr key={bidder.code} className="border-b border-border/30 last:border-b-0 hover:bg-muted/30">
                  <td className="py-1.5 px-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate font-medium" title={bidder.code}>{bidder.code}</span>
                      {bidder.timeoutCount > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-destructive" title={`${bidder.timeoutCount} timeouts`}>
                          <IconAlertTriangle size={10} />
                          {bidder.timeoutCount}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-1.5 px-1 tabular-nums">{bidder.bidCount}</td>
                  <td className="text-center py-1.5 px-1">
                    <div className="flex items-center justify-center gap-1">
                      {bidder.winCount > 0 && <IconLaurelWreath size={12} className="text-warning" />}
                      <span className={`tabular-nums ${bidder.winCount > 0 ? 'text-success font-medium' : ''}`}>
                        {bidder.winCount}
                      </span>
                      <span className="text-xs text-muted-foreground">({winRate.toFixed(0)}%)</span>
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
