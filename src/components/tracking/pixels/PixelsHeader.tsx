import React from 'react'
import type { PixelData } from '@/shared/types/analytics'
import { IconEyeOpen as IconEye } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { StatBox, StatusIndicator } from '@/components/common'

interface PixelsHeaderProps {
  pixels: PixelData[]
  action: React.ReactNode
}

export const PixelsHeader: React.FC<PixelsHeaderProps> = ({ pixels, action }) => {
  const detected = pixels.length > 0
  const uniqueTypes = new Set(pixels.map((p) => p.type)).size
  const totalEvents = pixels.reduce((sum, p) => sum + p.events.length, 0)

  return (
    <div className="border-b border-border/50 p-3">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-info/15 text-info">
          <IconEye size={16} />
        </span>
        <span className="text-sm font-medium">Tracking Pixels</span>
        <StatusIndicator detected={detected} />
        <div className="ml-auto">{action}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Types" value={uniqueTypes} variant={uniqueTypes > 0 ? 'info' : 'default'} />
        <StatBox label="IDs" value={pixels.length} variant={pixels.length > 0 ? 'info' : 'default'} />
        <StatBox label="Events" value={totalEvents} variant={totalEvents > 0 ? 'success' : 'default'} />
      </div>
    </div>
  )
}
