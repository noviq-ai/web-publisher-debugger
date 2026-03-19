import React from 'react'
import type { PrebidData } from '@/shared/types/prebid'
import { IconSettings2 } from '@tabler/icons-react'
import { Section, ConfigRow, StatusIndicator } from '@/components/common'

interface PrebidConfigProps {
  config: PrebidData['config']
}

export const PrebidConfig: React.FC<PrebidConfigProps> = ({ config }) => {
  return (
    <Section title="Configuration" icon={<IconSettings2 size={14} />}>
      <div className="space-y-0">
        <ConfigRow label="Price Granularity" value={<span className="font-mono">{config.priceGranularity || 'medium'}</span>} />
        <ConfigRow label="Consent Management" value={<StatusIndicator enabled={config.consentManagement} />} />
        <ConfigRow label="User Sync" value={<StatusIndicator enabled={!!config.userSync} />} />
        <ConfigRow label="Bid Cache" value={<StatusIndicator enabled={config.useBidCache} />} />
        <ConfigRow label="Device Access" value={<StatusIndicator enabled={config.deviceAccess} />} />
        {config.s2sConfig && (
          <ConfigRow
            label="Server-to-Server"
            value={
              <span className="text-xs">
                <StatusIndicator enabled={config.s2sConfig.enabled} />
                {config.s2sConfig.bidders?.length > 0 && (
                  <span className="ml-1 text-muted-foreground">({config.s2sConfig.bidders.length} bidders)</span>
                )}
              </span>
            }
          />
        )}
      </div>
    </Section>
  )
}
