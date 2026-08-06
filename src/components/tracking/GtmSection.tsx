import React from 'react'
import type { GtmData } from '@/shared/types/gtm'
import { GtmHeader, GtmDataLayer, GtmTags } from './gtm'

interface GtmSectionProps {
  data: GtmData
  headerAction: React.ReactNode
  headerContent: React.ReactNode
}

export const GtmSection: React.FC<GtmSectionProps> = ({ data, headerAction, headerContent }) => {
  return (
    <>
      <GtmHeader data={data} action={headerAction} />
      {headerContent}
      <GtmDataLayer events={data.dataLayerEvents} />
      <GtmTags tags={data.tagsFired} />
    </>
  )
}
