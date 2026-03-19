import React from 'react'
import type { GptEvent } from '@/shared/types/gpt'
import { IconListTree } from '@tabler/icons-react'
import { Section } from '@/components/common'

interface GptTimelineProps {
  events: GptEvent[]
}

const getGptEventColor = (eventType: string): { bg: string; badge: string; shadow: string } => {
  switch (eventType) {
    case 'slotRequested':
      return { bg: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', shadow: 'rgba(234, 179, 8, 0.5)' }
    case 'slotResponseReceived':
      return { bg: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', shadow: 'rgba(59, 130, 246, 0.5)' }
    case 'slotRenderEnded':
      return { bg: 'bg-green-500', badge: 'bg-green-500/10 text-green-600 dark:text-green-400', shadow: 'rgba(34, 197, 94, 0.5)' }
    case 'slotOnload':
      return { bg: 'bg-purple-500', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', shadow: 'rgba(168, 85, 247, 0.5)' }
    case 'impressionViewable':
      return { bg: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', shadow: 'rgba(16, 185, 129, 0.5)' }
    case 'slotVisibilityChanged':
      return { bg: 'bg-cyan-500', badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', shadow: 'rgba(6, 182, 212, 0.5)' }
    default:
      return { bg: 'bg-muted-foreground', badge: 'bg-muted text-muted-foreground', shadow: 'rgba(100, 100, 100, 0.3)' }
  }
}

export const GptTimeline: React.FC<GptTimelineProps> = ({ events }) => {
  if (events.length === 0) return null

  return (
    <Section title="Event Timeline" icon={<IconListTree size={14} />} count={events.length} defaultOpen>
      <div className="max-h-64 overflow-auto">
        <div className="relative">
          <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-orange-500/50 to-orange-500/10" />
          <div className="space-y-0">
          {events.slice(-30).map((event, idx, arr) => {
            const eventColor = getGptEventColor(event.eventType)
            const isLast = idx === arr.length - 1
            return (
              <div key={idx} className="relative flex items-start gap-3 py-1.5 pl-4">
                <div
                  className={`absolute left-0 top-2 w-3 h-3 rounded-full border-2 border-background ${eventColor.bg} ${isLast ? 'ring-2 ring-offset-1 ring-offset-background' : ''}`}
                  style={{ boxShadow: isLast ? `0 0 8px ${eventColor.shadow}` : undefined }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${eventColor.badge}`}>{event.eventType}</span>
                    <span className="text-[10px] text-muted-foreground truncate" title={event.slotElementId}>{event.slotElementId}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">{new Date(event.timestamp).toLocaleTimeString()}</div>
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
