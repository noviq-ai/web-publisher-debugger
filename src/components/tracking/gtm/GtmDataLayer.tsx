import React, { useState } from 'react'
import type { DataLayerEvent } from '@/shared/types/gtm'
import { IconChevronDownMedium as IconChevronDown, IconChevronRightMedium as IconChevronRight, IconLayersTwo as IconLayersUnion } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface GtmDataLayerProps {
  events: DataLayerEvent[]
}

export const GtmDataLayer: React.FC<GtmDataLayerProps> = ({ events }) => {
  if (events.length === 0) return null

  // Group events by type for summary
  const eventCounts = events.reduce(
    (acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <Section title="DataLayer Events" icon={<IconLayersUnion className="h-4 w-4" />} count={events.length} defaultOpen>
      {/* Event type summary */}
      <div className="flex flex-wrap gap-1 mb-3">
        {Object.entries(eventCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 8)
          .map(([event, count]) => (
            <span
              key={event}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {event} ({count})
            </span>
          ))}
        {Object.keys(eventCounts).length > 8 && (
          <span className="px-1.5 py-0.5 text-xs text-muted-foreground">
            +{Object.keys(eventCounts).length - 8} more
          </span>
        )}
      </div>

      {/* Event list */}
      <div className="space-y-1.5 max-h-64 overflow-auto">
        {events.slice().reverse().map((event, idx) => (
          <DataLayerEventItem key={idx} event={event} />
        ))}
      </div>
    </Section>
  )
}

const DataLayerEventItem: React.FC<{ event: DataLayerEvent }> = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false)
  const hasData = Object.keys(event.data).length > 0

  return (
    <div className="overflow-hidden rounded-lg border border-border/50">
      <button
        className="flex w-full items-center justify-between px-2.5 py-2 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!hasData}
        aria-expanded={hasData ? isOpen : undefined}
      >
        <span className="rounded-full bg-info/15 px-2 py-0.5 text-xs font-medium text-info">
          {event.event}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
          {hasData && (
            isOpen ? <IconChevronDown className="h-3 w-3 text-muted-foreground" /> : <IconChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </button>
      {isOpen && hasData && (
        <div className="border-t border-border/50 bg-muted/30 p-2">
          <pre className="max-h-32 overflow-auto text-xs text-muted-foreground">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
