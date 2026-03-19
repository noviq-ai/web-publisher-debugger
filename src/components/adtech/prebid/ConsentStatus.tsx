import React from 'react'
import type { ConsentMetadata } from '@/shared/types/prebid'
import { IconShield } from '@tabler/icons-react'
import { Section, ConfigRow, StatusIndicator } from '@/components/common'

interface ConsentStatusProps {
  consent: ConsentMetadata | null
}

export const ConsentStatus: React.FC<ConsentStatusProps> = ({ consent }) => {
  if (!consent) return null

  return (
    <Section title="Consent Status" icon={<IconShield size={14} />}>
      <div className="space-y-0">
        <ConfigRow label="GDPR Applies" value={<StatusIndicator enabled={consent.gdprApplies} label={consent.gdprApplies ? 'Yes' : 'No'} />} />
        {consent.consentString && (
          <div className="py-1.5 border-b border-border/30">
            <div className="text-xs text-muted-foreground mb-1">TC String</div>
            <div className="text-[10px] font-mono bg-muted/50 p-1.5 rounded truncate" title={consent.consentString}>{consent.consentString}</div>
          </div>
        )}
        {consent.uspString && <ConfigRow label="USP String" value={<span className="font-mono">{consent.uspString}</span>} />}
        {consent.gppString && (
          <div className="py-1.5">
            <div className="text-xs text-muted-foreground mb-1">GPP String</div>
            <div className="text-[10px] font-mono bg-muted/50 p-1.5 rounded truncate" title={consent.gppString}>{consent.gppString}</div>
          </div>
        )}
      </div>
    </Section>
  )
}
