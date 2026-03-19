import React from 'react'
import type { GptSlot } from '@/shared/types/gpt'
import { Badge } from '@/components/ui/badge'
import { IconDeviceTv } from '@tabler/icons-react'
import { Section } from '@/components/common'

interface GptSlotsProps {
  slots: GptSlot[]
}

export const GptSlots: React.FC<GptSlotsProps> = ({ slots }) => {
  return (
    <Section title="Ad Slots" icon={<IconDeviceTv size={14} />} count={slots.length} defaultOpen>
      {slots.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No slots defined.</p>
      ) : (
        <div className="space-y-2">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className={`rounded-md p-2 ${
                slot.renderInfo?.isEmpty === false
                  ? 'bg-green-500/5 border border-green-500/20'
                  : slot.renderInfo?.isEmpty === true
                  ? 'bg-gray-500/5 border border-gray-500/20'
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium truncate flex-1 mr-2" title={slot.slotElementId}>{slot.slotElementId}</span>
                {slot.renderInfo?.isEmpty === false && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-green-600">Rendered</Badge>
                )}
                {slot.renderInfo?.isEmpty === true && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Empty</Badge>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground mb-1.5 truncate" title={slot.adUnitPath}>{slot.adUnitPath}</div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-muted-foreground w-12">Sizes:</span>
                  {slot.sizes.map((size, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono">
                      {size.width === 'fluid' ? 'fluid' : `${size.width}×${size.height}`}
                    </span>
                  ))}
                </div>
                {slot.responseInfo && (
                  <div className="mt-2 pt-1.5 border-t border-border/30">
                    <div className="text-[10px] text-muted-foreground mb-1">Response Info:</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
                      {slot.responseInfo.lineItemId && (
                        <>
                          <span className="text-muted-foreground">Line Item:</span>
                          <span className="font-mono">{slot.responseInfo.lineItemId}</span>
                        </>
                      )}
                      {slot.responseInfo.creativeId && (
                        <>
                          <span className="text-muted-foreground">Creative:</span>
                          <span className="font-mono">{slot.responseInfo.creativeId}</span>
                        </>
                      )}
                      {slot.responseInfo.advertiserId && (
                        <>
                          <span className="text-muted-foreground">Advertiser:</span>
                          <span className="font-mono">{slot.responseInfo.advertiserId}</span>
                        </>
                      )}
                      {slot.responseInfo.campaignId && (
                        <>
                          <span className="text-muted-foreground">Campaign:</span>
                          <span className="font-mono">{slot.responseInfo.campaignId}</span>
                        </>
                      )}
                      {slot.responseInfo.isBackfill && (
                        <>
                          <span className="text-muted-foreground">Type:</span>
                          <span className="text-yellow-600 dark:text-yellow-400">Backfill (AdSense)</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {Object.keys(slot.targeting).length > 0 && (
                  <div className="mt-1.5">
                    <div className="text-[10px] text-muted-foreground mb-0.5">Targeting:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(slot.targeting).slice(0, 5).map(([key, values]) => (
                        <span key={key} className="text-[10px] px-1 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded" title={`${key}=${values.join(',')}`}>
                          {key}={values.join(',')}
                        </span>
                      ))}
                      {Object.keys(slot.targeting).length > 5 && (
                        <span className="text-[10px] text-muted-foreground">+{Object.keys(slot.targeting).length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
