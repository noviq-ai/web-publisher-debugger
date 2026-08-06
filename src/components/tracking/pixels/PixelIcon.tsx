import React from 'react'
import type { PixelType } from '@/shared/types/analytics'
import { IconTarget } from '@central-icons-react/round-outlined-radius-2-stroke-1.5'

interface PixelIconProps {
  type: PixelType
  className: string
}

const SERVICE_ICON_PATHS: Partial<Record<PixelType, string>> = {
  facebook: '/icons/facebook.svg',
  twitter: '/icons/x.svg',
  tiktok: '/icons/tiktok.svg',
  linkedin: '/icons/linkedin.svg',
  pinterest: '/icons/pinterest.svg',
  criteo: '/icons/criteo.svg',
  snapchat: '/icons/snapchat.svg',
}

export const PixelIcon: React.FC<PixelIconProps> = ({ type, className }) => {
  const iconPath = SERVICE_ICON_PATHS[type]
  if (iconPath) return <img src={iconPath} alt="" width={20} height={20} className={`${className} object-contain`} />

  return <IconTarget className={className} />
}
