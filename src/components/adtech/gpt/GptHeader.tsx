import React from 'react'
import type { GptData } from '@/shared/types/gpt'
import { StatBox } from '@/components/common'
import { GamIcon } from './GamIcon'

interface GptHeaderProps {
  data: GptData
  action: React.ReactNode
}

export const GptHeader: React.FC<GptHeaderProps> = ({ data, action }) => {
  const renderedSlots = data.slots.filter(s => s.renderInfo && !s.renderInfo.isEmpty).length
  const emptySlots = data.slots.filter(s => s.renderInfo && s.renderInfo.isEmpty).length

  return (
    <div className="border-b border-border/50 p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-muted/60">
          <GamIcon className="size-4" />
        </span>
        <span className="text-sm font-medium">Google Publisher Tag</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{data.version || '?'}</span>
        <div className="ml-auto">{action}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Total Slots" value={data.slots.length} variant="info" />
        <StatBox label="Rendered" value={renderedSlots} variant={renderedSlots > 0 ? 'success' : 'default'} />
        <StatBox label="Empty" value={emptySlots} variant={emptySlots > 0 ? 'warning' : 'default'} />
        <StatBox label="Events" value={data.events.length} />
      </div>
    </div>
  )
}
