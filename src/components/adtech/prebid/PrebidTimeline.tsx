import React from 'react'
import type { PrebidEvent } from '@/shared/types/prebid'
import { IconListTree } from '@tabler/icons-react'
import { Section } from '@/components/common'

interface PrebidTimelineProps {
  events: PrebidEvent[]
}

const getEventColor = (eventType: string): { bg: string; badge: string; shadow: string } => {
  switch (eventType) {
    case 'AUCTION_INIT':
      return { bg: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', shadow: 'rgba(59, 130, 246, 0.5)' }
    case 'AUCTION_END':
      return { bg: 'bg-purple-500', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', shadow: 'rgba(168, 85, 247, 0.5)' }
    case 'BID_REQUESTED':
      return { bg: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', shadow: 'rgba(234, 179, 8, 0.5)' }
    case 'BID_RESPONSE':
      return { bg: 'bg-green-500', badge: 'bg-green-500/10 text-green-600 dark:text-green-400', shadow: 'rgba(34, 197, 94, 0.5)' }
    case 'BID_WON':
      return { bg: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', shadow: 'rgba(16, 185, 129, 0.5)' }
    case 'BID_TIMEOUT':
      return { bg: 'bg-red-500', badge: 'bg-red-500/10 text-red-600 dark:text-red-400', shadow: 'rgba(239, 68, 68, 0.5)' }
    default:
      return { bg: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground', shadow: 'rgba(100, 100, 100, 0.3)' }
  }
}

interface EventBidderInfo {
  bidder?: string
  bidders?: string[]
  cpm?: number
  currency?: string
  adUnitCode?: string
}

const extractBidderInfo = (eventType: string, data: unknown): EventBidderInfo => {
  if (!data || typeof data !== 'object') return {}

  const d = data as Record<string, unknown>

  switch (eventType) {
    case 'BID_REQUESTED':
      return {
        bidder: d.bidderCode as string | undefined,
        adUnitCode: (d.bids as Array<{ adUnitCode?: string }>)?.[0]?.adUnitCode,
      }
    case 'BID_RESPONSE':
      return {
        bidder: d.bidderCode as string | undefined,
        cpm: d.cpm as number | undefined,
        currency: d.currency as string | undefined,
        adUnitCode: d.adUnitCode as string | undefined,
      }
    case 'BID_WON':
      return {
        bidder: d.bidder as string | undefined,
        cpm: d.cpm as number | undefined,
        currency: d.currency as string | undefined,
        adUnitCode: d.adUnitCode as string | undefined,
      }
    case 'BID_TIMEOUT':
      if (Array.isArray(d)) {
        const bidders = (d as Array<{ bidder?: string }>).map(b => b.bidder).filter(Boolean) as string[]
        return { bidders }
      }
      return {}
    case 'AUCTION_INIT':
    case 'AUCTION_END':
      const adUnits = d.adUnits as unknown[] | undefined
      return {
        adUnitCode: adUnits?.length ? `${adUnits.length} ad units` : undefined,
      }
    default:
      return {}
  }
}

export const PrebidTimeline: React.FC<PrebidTimelineProps> = ({ events }) => {
  if (events.length === 0) return null

  return (
    <Section title="Event Timeline" icon={<IconListTree size={14} />} count={events.length} defaultOpen>
      <div className="max-h-64 overflow-auto">
        <div className="relative">
          <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/50 to-blue-500/10" />
          <div className="space-y-0">
          {events.slice(-30).map((event, idx, arr) => {
            const eventColor = getEventColor(event.eventType)
            const isLast = idx === arr.length - 1
            const bidderInfo = extractBidderInfo(event.eventType, event.data)
            return (
              <div key={idx} className="relative flex items-start gap-3 py-1.5 pl-4">
                <div
                  className={`absolute left-0 top-2 w-3 h-3 rounded-full border-2 border-background ${eventColor.bg} ${isLast ? 'ring-2 ring-offset-1 ring-offset-background' : ''}`}
                  style={{ boxShadow: isLast ? `0 0 8px ${eventColor.shadow}` : undefined }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${eventColor.badge}`}>{event.eventType}</span>
                      {bidderInfo.bidder && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded font-medium">{bidderInfo.bidder}</span>
                      )}
                      {bidderInfo.bidders && bidderInfo.bidders.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded">{bidderInfo.bidders.join(', ')}</span>
                      )}
                      {bidderInfo.cpm !== undefined && (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-mono">{bidderInfo.cpm.toFixed(2)} {bidderInfo.currency ?? 'USD'}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {bidderInfo.adUnitCode && (
                    <div className="text-[10px] text-muted-foreground truncate mt-0.5" title={bidderInfo.adUnitCode}>{bidderInfo.adUnitCode}</div>
                  )}
                </div>
              </div>
            )
          })}
          </div>
        </div>
      </div>
    </Section>
  )
}
