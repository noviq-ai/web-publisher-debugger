import React from 'react'
import type { SeoData } from '@/shared/types/seo'
import { IconSearch } from '@tabler/icons-react'
import { StatBox } from '@/components/common'

interface SeoHeaderProps {
  data: SeoData
}

export const SeoHeader: React.FC<SeoHeaderProps> = ({ data }) => {
  const errorCount = data.issues.filter((i) => i.type === 'error').length
  const warningCount = data.issues.filter((i) => i.type === 'warning').length

  return (
    <div className="p-3 bg-gradient-to-b from-green-500/10 to-transparent border-t-2 border-green-500/30">
      <div className="flex items-center gap-2 mb-3">
        <IconSearch size={16} className="text-green-500" />
        <span className="text-sm font-medium">SEO Analysis</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Errors" value={errorCount} variant={errorCount > 0 ? 'error' : 'default'} />
        <StatBox label="Warnings" value={warningCount} variant={warningCount > 0 ? 'warning' : 'default'} />
        <StatBox label="Schema" value={data.jsonLd.length} highlight={data.jsonLd.length > 0} />
        <StatBox label="Hreflang" value={data.hreflang.length} highlight={data.hreflang.length > 0} />
      </div>
    </div>
  )
}
