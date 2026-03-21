import React, { useState } from 'react'
import type { TechStackCategory } from '@/shared/types/techstack'
import { IconCode } from '@tabler/icons-react'

const LOGO_DEV_TOKEN = import.meta.env.VITE_LOGO_DEV_TOKEN

const CATEGORY_BG: Record<TechStackCategory, string> = {
  ad_network:           'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  analytics:            'bg-green-500/20 text-green-600 dark:text-green-400',
  tag_manager:          'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  cdn:                  'bg-sky-500/20 text-sky-600 dark:text-sky-400',
  js_library:           'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  frontend_framework:   'bg-violet-500/20 text-violet-600 dark:text-violet-400',
  cms:                  'bg-teal-500/20 text-teal-600 dark:text-teal-400',
  cdp:                  'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  cookie_consent:       'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  marketing_automation: 'bg-rose-500/20 text-rose-600 dark:text-rose-400',
  personalization:      'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  retargeting:          'bg-red-500/20 text-red-600 dark:text-red-400',
  security:             'bg-slate-500/20 text-slate-600 dark:text-slate-400',
  widget:               'bg-pink-500/20 text-pink-600 dark:text-pink-400',
  other:                'bg-muted text-muted-foreground',
}

function logoDevUrl(domain: string): string {
  const params = new URLSearchParams()
  if (LOGO_DEV_TOKEN) params.set('token', LOGO_DEV_TOKEN)
  return `https://img.logo.dev/${domain}?${params}`
}

interface TechStackIconProps {
  name: string
  category: TechStackCategory
  domain?: string
  className?: string
}

export const TechStackIcon: React.FC<TechStackIconProps> = ({ name, category, domain, className = 'h-5 w-5' }) => {
  const [imgError, setImgError] = useState(false)

  if (domain && !imgError) {
    return (
      <img
        src={logoDevUrl(domain)}
        alt={name}
        className={`${className} rounded`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div className={`${className} rounded flex items-center justify-center shrink-0 ${CATEGORY_BG[category]}`}>
      <IconCode size={12} />
    </div>
  )
}
