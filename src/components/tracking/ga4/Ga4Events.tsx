import React, { useState } from 'react'
import type { Ga4Event } from '@/shared/types/analytics'
import { IconLiveActivity as IconActivity, IconChevronDownMedium as IconChevronDown, IconChevronRightMedium as IconChevronRight } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface Ga4EventsProps {
  events: Ga4Event[]
}

export const Ga4Events: React.FC<Ga4EventsProps> = ({ events }) => {
  if (events.length === 0) return null

  return (
    <Section title="Events" icon={<IconActivity className="h-4 w-4" />} count={events.length} defaultOpen>
      <div className="space-y-1.5 max-h-64 overflow-auto">
        {events.slice().reverse().map((event, idx) => (
          <EventItem key={idx} event={event} />
        ))}
      </div>
    </Section>
  )
}

const EventItem: React.FC<{ event: Ga4Event }> = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false)
  const hasParams = Object.keys(event.params).length > 0
  const isSetEvent = event.name === '__set__'

  return (
    <div className="overflow-hidden rounded-lg border border-border/50">
      <button
        className="flex w-full items-center justify-between px-2.5 py-2 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!hasParams}
        aria-expanded={hasParams ? isOpen : undefined}
      >
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isSetEvent
              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
              : 'bg-info/15 text-info'
          }`}>
            {isSetEvent ? 'set' : event.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
          {hasParams && (
            isOpen ? <IconChevronDown className="h-3 w-3 text-muted-foreground" /> : <IconChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
      </button>
      {isOpen && hasParams && (
        <div className="border-t border-border/50 bg-muted/30 p-2">
          <pre className="max-h-32 overflow-auto text-xs text-muted-foreground">
            {JSON.stringify(event.params, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
