import React, { useState } from 'react'
import type { PixelData, PixelType, PixelEvent } from '@/shared/types/analytics'
import { PIXEL_INFO } from '@/shared/types/analytics'
import { IconChevronDownMedium as IconChevronDown, IconChevronRightMedium as IconChevronRight } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { PixelIcon } from './PixelIcon'

interface PixelsGridProps {
  pixels: PixelData[]
}

// All supported pixel types for display
const ALL_PIXEL_TYPES: PixelType[] = ['facebook', 'twitter', 'tiktok', 'linkedin', 'pinterest', 'criteo', 'snapchat']

export const PixelsGrid: React.FC<PixelsGridProps> = ({ pixels }) => {
  // Create a map of detected pixels
  const detectedPixels = new Map<PixelType, PixelData[]>()
  pixels.forEach((pixel) => {
    const existing = detectedPixels.get(pixel.type) || []
    existing.push(pixel)
    detectedPixels.set(pixel.type, existing)
  })

  return (
    <div className="grid grid-cols-2 items-start gap-2">
      {ALL_PIXEL_TYPES.map((type) => {
        const pixelData = detectedPixels.get(type)
        return (
          <PixelCard
            key={type}
            type={type}
            pixels={pixelData || []}
            detected={!!pixelData}
          />
        )
      })}
    </div>
  )
}

interface PixelCardProps {
  type: PixelType
  pixels: PixelData[]
  detected: boolean
}

const PixelCard: React.FC<PixelCardProps> = ({ type, pixels, detected }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const info = PIXEL_INFO[type]
  const totalEvents = pixels.reduce((sum, p) => sum + p.events.length, 0)

  return (
    <div
      className={`overflow-hidden rounded-lg border transition-[border-color,background-color,opacity] ${
        detected
          ? 'border-border bg-card'
          : 'border-border/30 bg-muted/20 opacity-50'
      }`}
    >
      <button
        className="flex w-full items-center gap-2 p-2 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
        onClick={() => detected && setIsExpanded(!isExpanded)}
        disabled={!detected}
        aria-expanded={detected ? isExpanded : undefined}
      >
        <PixelIcon type={type} className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{info.name}</div>
          {detected ? (
            <div className="text-xs text-muted-foreground">
              {pixels.length} ID{pixels.length > 1 ? 's' : ''} · {totalEvents} event{totalEvents !== 1 ? 's' : ''}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Not detected</div>
          )}
        </div>
        {detected && (
          isExpanded
            ? <IconChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            : <IconChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {isExpanded && detected && (
        <div className="border-t border-border/50 bg-muted/30 p-2 space-y-2">
          {pixels.map((pixel, idx) => (
            <PixelDetail key={idx} pixel={pixel} />
          ))}
        </div>
      )}
    </div>
  )
}

const PixelDetail: React.FC<{ pixel: PixelData }> = ({ pixel }) => {
  const [showEvents, setShowEvents] = useState(false)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
          {pixel.id}
        </span>
        {pixel.events.length > 0 && (
          <button
            className="rounded text-xs text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring/40"
            onClick={() => setShowEvents(!showEvents)}
          >
            {showEvents ? 'Hide' : 'Show'} events
          </button>
        )}
      </div>

      {showEvents && pixel.events.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-auto">
          {pixel.events.slice().reverse().map((event, idx) => (
            <EventRow key={idx} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

const EventRow: React.FC<{ event: PixelEvent }> = ({ event }) => {
  const [showParams, setShowParams] = useState(false)
  const hasParams = Object.keys(event.params).length > 0

  return (
    <div className="overflow-hidden rounded-lg border border-border/30">
      <button
        className="flex w-full items-center justify-between px-2 py-1.5 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
        onClick={() => hasParams && setShowParams(!showParams)}
        disabled={!hasParams}
        aria-expanded={hasParams ? showParams : undefined}
      >
        <span className="text-xs font-medium">{event.eventName}</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </button>
      {showParams && (
        <div className="border-t border-border/30 bg-muted/20 p-1.5">
          <pre className="max-h-20 overflow-auto text-xs text-muted-foreground">
            {JSON.stringify(event.params, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
