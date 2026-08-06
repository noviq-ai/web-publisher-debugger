import React, { useState } from 'react'
import { IconCode } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { PrebidIcon } from '@/components/adtech/prebid/PrebidIcon'

const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN

const LOCAL_ICON_PATHS: Record<string, string> = {
  'Google Publisher Tag': '/icons/google-ad-manager.svg',
  'Google Tag Manager': '/icons/google-tag-manager.svg',
  'Google Analytics 4': '/icons/google-analytics.svg',
  'Meta Pixel': '/icons/facebook.svg',
}

function logoDevUrl(domain: string): string {
  const params = new URLSearchParams()
  if (LOGO_DEV_TOKEN) params.set('token', LOGO_DEV_TOKEN)
  return `https://img.logo.dev/${domain}?${params}`
}

interface TechStackIconProps {
  name: string
  domain?: string
  className: string
}

export const TechStackIcon: React.FC<TechStackIconProps> = ({ name, domain, className }) => {
  const [imgError, setImgError] = useState(false)
  const localIconPath = LOCAL_ICON_PATHS[name]
  const iconSource = localIconPath ?? (domain ? logoDevUrl(domain) : null)

  if (name === 'Prebid.js') return <PrebidIcon className={className} />

  if (iconSource && !imgError) {
    return (
      <img
        src={iconSource}
        alt=""
        width={20}
        height={20}
        className={`${className} shrink-0 rounded object-contain`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div className={`${className} flex shrink-0 items-center justify-center rounded bg-muted text-muted-foreground`}>
      <IconCode size={12} />
    </div>
  )
}
