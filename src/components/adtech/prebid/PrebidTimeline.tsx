import React from 'react'
import type { PrebidEvent } from '@/shared/types/prebid'
import { IconBranch as IconListTree } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface PrebidTimelineProps {
  events: PrebidEvent[]
}

const getEventColor = (eventType: string): { bg: string; badge: string } => {
  const normalized = eventType.replace(/([A-Z])/g, '_$1').toUpperCase().replace(/^_/, '')
  switch (normalized) {
    case 'AUCTION_INIT':
      return { bg: 'bg-info', badge: 'bg-info/15 text-info' }
    case 'AUCTION_END':
      return { bg: 'bg-purple-500', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' }
    case 'BID_REQUESTED':
      return { bg: 'bg-warning', badge: 'bg-warning/15 text-warning' }
    case 'BID_RESPONSE':
      return { bg: 'bg-success', badge: 'bg-success/15 text-success' }
    case 'BID_WON':
      return { bg: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }
    case 'BID_TIMEOUT':
      return { bg: 'bg-destructive', badge: 'bg-destructive/15 text-destructive' }
    default:
      return { bg: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground' }
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
        <div className="relative mx-1">
          <div className="absolute inset-y-0 left-1.5 w-px -translate-x-1/2 bg-border" />
          <div className="space-y-0">
          {events.slice(-30).map((event, idx) => {
            const eventColor = getEventColor(event.eventType)
            const bidderInfo = extractBidderInfo(event.eventType, event.data)
            return (
              <div key={idx} className="relative flex items-start gap-3 py-1.5 pl-4">
                <div
                  className={`absolute left-0 top-2.5 size-3 rounded-full border-2 border-background ${eventColor.bg}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${eventColor.badge}`}>{event.eventType}</span>
                      {bidderInfo.bidder && (
                        <span className="rounded-full bg-info/15 px-2 py-0.5 text-xs font-medium text-info">{bidderInfo.bidder}</span>
                      )}
                      {bidderInfo.bidders && bidderInfo.bidders.length > 0 && (
                        <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs text-destructive">{bidderInfo.bidders.join(', ')}</span>
                      )}
                      {bidderInfo.cpm !== undefined && (
                        <span className="font-mono text-xs text-success">{bidderInfo.cpm.toFixed(2)} {bidderInfo.currency ?? 'USD'}</span>
                      )}
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {bidderInfo.adUnitCode && (
                    <div className="mt-0.5 truncate text-xs text-muted-foreground" title={bidderInfo.adUnitCode}>{bidderInfo.adUnitCode}</div>
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
