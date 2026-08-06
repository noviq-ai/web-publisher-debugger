import React from 'react'
import type { PixelData } from '@/shared/types/analytics'
import { PixelsGrid } from './pixels/PixelsGrid'
import { PixelsHeader } from './pixels/PixelsHeader'

interface PixelsSectionProps {
  pixels: PixelData[]
  headerAction: React.ReactNode
  headerContent: React.ReactNode
}

export const PixelsSection: React.FC<PixelsSectionProps> = ({ pixels, headerAction, headerContent }) => {
  return (
    <>
      <PixelsHeader pixels={pixels} action={headerAction} />
      {headerContent}
      <div className="p-3">
        <PixelsGrid pixels={pixels} />
      </div>
    </>
  )
}
