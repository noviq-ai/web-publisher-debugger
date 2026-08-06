import React from 'react'
import type { GptData } from '@/shared/types/gpt'
import {
  GptHeader,
  GptTimeline,
  GptConfig,
  GptPageTargeting,
  GptSlots,
} from './gpt'

interface GptSectionProps {
  data: GptData
  headerAction: React.ReactNode
  headerContent: React.ReactNode
}

export const GptSection: React.FC<GptSectionProps> = ({ data, headerAction, headerContent }) => {
  return (
    <>
      {/* Header with stats */}
      <GptHeader data={data} action={headerAction} />
      {headerContent}

      {/* Event Timeline - 重要なので2番目 */}
      <GptTimeline events={data.events} />

      {/* Ad Slots */}
      <GptSlots slots={data.slots} />

      {/* Configuration */}
      <GptConfig config={data.config} />

      {/* Page Targeting */}
      <GptPageTargeting targeting={data.pageTargeting} />
    </>
  )
}
