import React from 'react'
import type { SeoData } from '@/shared/types/seo'
import { IconMagnifyingGlass as IconSearch } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { StatBox } from '@/components/common'

interface SeoHeaderProps {
  data: SeoData
  action: React.ReactNode
}

export const SeoHeader: React.FC<SeoHeaderProps> = ({ data, action }) => {
  const errorCount = data.issues.filter((i) => i.type === 'error').length
  const warningCount = data.issues.filter((i) => i.type === 'warning').length

  return (
    <div className="border-b border-border/50 p-3">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex size-7 items-center justify-center rounded-lg bg-info/15 text-info">
          <IconSearch size={16} />
        </span>
        <span className="text-sm font-medium">SEO Analysis</span>
        <div className="ml-auto">{action}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Errors" value={errorCount} variant={errorCount > 0 ? 'error' : 'default'} />
        <StatBox label="Warnings" value={warningCount} variant={warningCount > 0 ? 'warning' : 'default'} />
        <StatBox label="Schema" value={data.jsonLd.length} variant={data.jsonLd.length > 0 ? 'info' : 'default'} />
        <StatBox label="Hreflang" value={data.hreflang.length} variant={data.hreflang.length > 0 ? 'success' : 'default'} />
      </div>
    </div>
  )
}
