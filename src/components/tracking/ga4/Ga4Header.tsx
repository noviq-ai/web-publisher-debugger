import React from 'react'
import type { Ga4Data } from '@/shared/types/analytics'
import { StatBox, StatusIndicator } from '@/components/common'

interface Ga4HeaderProps {
  data: Ga4Data | null
  action: React.ReactNode
}

export const Ga4Header: React.FC<Ga4HeaderProps> = ({ data, action }) => {
  const detected = !!data?.detected
  const measurementId = data?.measurementId ?? null
  const eventsCount = data?.events.length ?? 0
  const configsCount = data?.configs.length ?? 0
  const consentValue = data?.consent ? 'Set' : '-'

  return (
    <div className="border-b border-border/50 p-3">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-muted/60">
          <img src="/icons/google-analytics.svg" alt="" width={16} height={16} className="size-4" />
        </span>
        <span className="text-sm font-medium">Google Analytics 4</span>
        <StatusIndicator detected={detected} />
        {measurementId && <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">{measurementId}</span>}
        <div className="ml-auto">{action}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Events" value={eventsCount} variant={eventsCount > 0 ? 'success' : 'default'} />
        <StatBox label="Configs" value={configsCount} variant={configsCount > 0 ? 'info' : 'default'} />
        <StatBox label="Consent" value={consentValue} variant={data?.consent ? 'success' : 'warning'} />
      </div>
    </div>
  )
}
