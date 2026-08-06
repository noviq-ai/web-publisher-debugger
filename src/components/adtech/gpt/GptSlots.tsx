import React from 'react'
import type { GptSlot } from '@/shared/types/gpt'
import { Badge } from '@/components/ui/badge'
import { IconTelevision as IconDeviceTv } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
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
                  ? 'bg-success/10 border border-success/20'
                  : slot.renderInfo?.isEmpty === true
                  ? 'bg-muted/40 border border-border/50'
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium truncate flex-1 mr-2" title={slot.slotElementId}>{slot.slotElementId}</span>
                {slot.renderInfo?.isEmpty === false && (
                  <Badge variant="secondary" className="h-5 rounded-full bg-success/20 px-2 text-xs text-success">Rendered</Badge>
                )}
                {slot.renderInfo?.isEmpty === true && (
                  <Badge variant="secondary" className="h-5 rounded-full px-2 text-xs">Empty</Badge>
                )}
              </div>
              <div className="mb-1.5 truncate text-xs text-muted-foreground" title={slot.adUnitPath}>{slot.adUnitPath}</div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="w-12 text-xs text-muted-foreground">Sizes:</span>
                  {slot.sizes.map((size, i) => (
                    <span key={i} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {size.width === 'fluid' ? 'fluid' : `${size.width}×${size.height}`}
                    </span>
                  ))}
                </div>
                {slot.responseInfo && (
                  <div className="mt-2 pt-1.5 border-t border-border/30">
                    <div className="mb-1 text-xs text-muted-foreground">Response Info:</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
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
                          <span className="text-warning">Backfill (AdSense)</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {Object.keys(slot.targeting).length > 0 && (
                  <div className="mt-1.5">
                    <div className="mb-0.5 text-xs text-muted-foreground">Targeting:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(slot.targeting).slice(0, 5).map(([key, values]) => (
                        <span key={key} className="rounded bg-info/15 px-1.5 py-0.5 text-xs text-info" title={`${key}=${values.join(',')}`}>
                          {key}={values.join(',')}
                        </span>
                      ))}
                      {Object.keys(slot.targeting).length > 5 && (
                        <span className="text-xs text-muted-foreground">+{Object.keys(slot.targeting).length - 5} more</span>
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
