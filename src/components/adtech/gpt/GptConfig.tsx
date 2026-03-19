import React from 'react'
import type { GptData } from '@/shared/types/gpt'
import { IconSettings2 } from '@tabler/icons-react'
import { Section, ConfigRow, StatusIndicator } from '@/components/common'

interface GptConfigProps {
  config: GptData['config']
}

export const GptConfig: React.FC<GptConfigProps> = ({ config }) => {
  return (
    <Section title="Configuration" icon={<IconSettings2 size={14} />}>
      <div className="space-y-0">
        <ConfigRow label="Initial Load" value={<StatusIndicator enabled={!config.initialLoadDisabled} label={config.initialLoadDisabled ? 'Disabled' : 'Enabled'} />} />
        <ConfigRow label="Single Request (SRA)" value={<StatusIndicator enabled={config.singleRequest} />} />
        <ConfigRow label="Lazy Load" value={<StatusIndicator enabled={config.lazyLoadEnabled} />} />
      </div>
    </Section>
  )
}
