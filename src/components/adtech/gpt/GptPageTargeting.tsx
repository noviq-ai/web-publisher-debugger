import React from 'react'
import { IconTarget } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
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
          <div key={key} className="flex min-w-0 items-start justify-between gap-2 border-b border-border/30 py-1 text-xs last:border-b-0">
            <span className="text-muted-foreground shrink-0 w-24">{key}</span>
            <span className="min-w-0 truncate text-right font-mono" title={values.join(', ')}>{values.join(', ')}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}
