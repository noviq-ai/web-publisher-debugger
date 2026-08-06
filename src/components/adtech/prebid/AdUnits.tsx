import React from 'react'
import type { AdUnitInfo } from '@/shared/types/prebid'
import { IconPackage as IconBox } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface AdUnitsProps {
  adUnits: AdUnitInfo[]
}

export const AdUnits: React.FC<AdUnitsProps> = ({ adUnits }) => {
  if (adUnits.length === 0) {
    return (
      <Section title="Ad Units" icon={<IconBox size={14} />} count={0}>
        <p className="text-xs text-muted-foreground py-2">No ad units found.</p>
      </Section>
    )
  }

  return (
    <Section title="Ad Units" icon={<IconBox size={14} />} count={adUnits.length}>
      <div className="space-y-2">
        {adUnits.map((unit, idx) => (
          <div key={idx} className="bg-muted/30 rounded-md p-2">
            <div className="text-xs font-medium mb-1.5 truncate" title={unit.code}>{unit.code}</div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1">
                <span className="w-12 text-xs text-muted-foreground">Types:</span>
                {unit.mediaTypes.map((type) => (
                  <span key={type} className="rounded bg-info/15 px-1.5 py-0.5 text-xs text-info">{type}</span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="w-12 text-xs text-muted-foreground">Sizes:</span>
                {unit.sizes.map((size, i) => (
                  <span key={i} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{size[0]}×{size[1]}</span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="w-12 text-xs text-muted-foreground">Bidders:</span>
                {unit.bidders.map((bidder) => (
                  <span key={bidder} className="rounded bg-muted px-1.5 py-0.5 text-xs">{bidder}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
