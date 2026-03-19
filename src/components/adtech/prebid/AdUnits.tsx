import React from 'react'
import type { AdUnitInfo } from '@/shared/types/prebid'
import { IconBox } from '@tabler/icons-react'
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
                <span className="text-[10px] text-muted-foreground w-12">Types:</span>
                {unit.mediaTypes.map((type) => (
                  <span key={type} className="text-[10px] px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded">{type}</span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-muted-foreground w-12">Sizes:</span>
                {unit.sizes.map((size, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 bg-muted rounded font-mono">{size[0]}×{size[1]}</span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-muted-foreground w-12">Bidders:</span>
                {unit.bidders.map((bidder) => (
                  <span key={bidder} className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">{bidder}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
