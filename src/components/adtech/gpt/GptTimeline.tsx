import React from 'react'
import type { GptEvent } from '@/shared/types/gpt'
import { IconBranch as IconListTree } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface GptTimelineProps {
  events: GptEvent[]
}

const getGptEventColor = (eventType: string): { bg: string; badge: string } => {
  switch (eventType) {
    case 'slotRequested':
      return { bg: 'bg-warning', badge: 'bg-warning/15 text-warning' }
    case 'slotResponseReceived':
      return { bg: 'bg-info', badge: 'bg-info/15 text-info' }
    case 'slotRenderEnded':
      return { bg: 'bg-success', badge: 'bg-success/15 text-success' }
    case 'slotOnload':
      return { bg: 'bg-purple-500', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' }
    case 'impressionViewable':
      return { bg: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }
    case 'slotVisibilityChanged':
      return { bg: 'bg-cyan-500', badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' }
    default:
      return { bg: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground' }
  }
}

export const GptTimeline: React.FC<GptTimelineProps> = ({ events }) => {
  if (events.length === 0) return null

  return (
    <Section title="Event Timeline" icon={<IconListTree size={14} />} count={events.length}>
      <div className="max-h-64 overflow-auto">
        <div className="relative mx-1">
          <div className="absolute inset-y-0 left-1.5 w-px -translate-x-1/2 bg-border" />
          <div className="space-y-0">
          {events.slice(-30).map((event, idx) => {
            const eventColor = getGptEventColor(event.eventType)
            return (
              <div key={idx} className="relative flex items-start gap-3 py-1.5 pl-4">
                <div
                  className={`absolute left-0 top-2.5 size-3 rounded-full border-2 border-background ${eventColor.bg}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${eventColor.badge}`}>{event.eventType}</span>
                    <span className="truncate text-xs text-muted-foreground" title={event.slotElementId}>{event.slotElementId}</span>
                  </div>
                  <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</div>
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
