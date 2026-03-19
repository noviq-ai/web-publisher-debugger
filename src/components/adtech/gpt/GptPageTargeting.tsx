import React from 'react'
import { IconTarget } from '@tabler/icons-react'
import { Section } from '@/components/common'

interface GptPageTargetingProps {
  targeting: Record<string, string[]>
}

export const GptPageTargeting: React.FC<GptPageTargetingProps> = ({ targeting }) => {
  if (Object.keys(targeting).length === 0) return null

  return (
    <Section title="Page Targeting" icon={<IconTarget size={14} />} count={Object.keys(targeting).length}>
      <div className="space-y-0">
        {Object.entries(targeting).map(([key, values]) => (
          <div key={key} className="flex items-start justify-between py-1 text-xs border-b border-border/30 last:border-b-0">
            <span className="text-muted-foreground shrink-0 w-24">{key}</span>
            <span className="font-mono text-right truncate" title={values.join(', ')}>{values.join(', ')}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}
