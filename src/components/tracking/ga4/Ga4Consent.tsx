import React from 'react'
import type { Ga4Consent } from '@/shared/types/analytics'
import { IconShield } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section, ConfigRow } from '@/components/common'

interface Ga4ConsentProps {
  consent: Ga4Consent | null
}

export const Ga4ConsentSection: React.FC<Ga4ConsentProps> = ({ consent }) => {
  if (!consent) return null

  const consentLabels: Record<string, string> = {
    ad_storage: 'Ad Storage',
    ad_user_data: 'Ad User Data',
    ad_personalization: 'Ad Personalization',
    analytics_storage: 'Analytics Storage',
    wait_for_update: 'Wait for Update',
  }

  return (
    <Section title="Consent" icon={<IconShield className="h-4 w-4" />}>
      <div className="space-y-1">
        <ConfigRow
          label="Type"
          value={
            <span className={`rounded-full px-2 py-0.5 text-xs ${
              consent.type === 'default'
                ? 'bg-info/15 text-info'
                : 'bg-success/15 text-success'
            }`}>
              {consent.type}
            </span>
          }
        />
        {Object.entries(consent.params).map(([key, value]) => {
          if (key === 'wait_for_update' && typeof value === 'number') {
            return <ConfigRow key={key} label={consentLabels[key] || key} value={`${value}ms`} />
          }
          const isGranted = value === 'granted'
          return (
            <ConfigRow
              key={key}
              label={consentLabels[key] || key}
              value={
                <span className={`inline-flex items-center gap-1 ${
                  isGranted ? 'text-success' : 'text-destructive'
                }`}>
                  <span className={`size-1.5 rounded-full ${isGranted ? 'bg-success' : 'bg-destructive'}`} />
                  {String(value)}
                </span>
              }
            />
          )
        })}
      </div>
    </Section>
  )
}
