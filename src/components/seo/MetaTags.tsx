import React from 'react'
import type { SeoData } from '@/shared/types/seo'
import { IconFileText, IconExternalLink, IconCheck, IconX, IconAlertTriangle } from '@tabler/icons-react'
import { Section } from '@/components/common'

interface MetaTagsProps {
  data: SeoData
}

interface MetaRowProps {
  label: string
  value: string | null
  maxLength?: number
  isUrl?: boolean
}

const MetaRow: React.FC<MetaRowProps> = ({ label, value, maxLength, isUrl }) => {
  const isEmpty = !value
  const isOverLimit = maxLength && value && value.length > maxLength
  const charCount = value?.length || 0

  return (
    <div className="flex items-start py-1.5 border-b border-border/30 last:border-b-0">
      <div className="flex items-center gap-1.5 w-24 shrink-0">
        {isEmpty ? (
          <IconX size={12} className="text-red-500" />
        ) : isOverLimit ? (
          <IconAlertTriangle size={12} className="text-yellow-500" />
        ) : (
          <IconCheck size={12} className="text-green-500" />
        )}
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">
        {isEmpty ? (
          <span className="text-[11px] text-muted-foreground/50 italic">Not set</span>
        ) : isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 break-all"
          >
            <span className="truncate">{value}</span>
            <IconExternalLink size={10} className="shrink-0" />
          </a>
        ) : (
          <span className="text-[11px] break-words">{value}</span>
        )}
      </div>
      {maxLength && value && (
        <span className={`text-[10px] ml-2 tabular-nums shrink-0 ${isOverLimit ? 'text-yellow-500' : 'text-muted-foreground'}`}>
          {charCount}/{maxLength}
        </span>
      )}
    </div>
  )
}

export const MetaTags: React.FC<MetaTagsProps> = ({ data }) => {
  return (
    <Section title="Meta Tags" icon={<IconFileText size={14} />} defaultOpen>
      <div className="space-y-0">
        <MetaRow label="Title" value={data.title} maxLength={60} />
        <MetaRow label="Description" value={data.description} maxLength={160} />
        <MetaRow label="Canonical" value={data.canonical} isUrl />
        <MetaRow label="Robots" value={data.robots} />
        <MetaRow label="Viewport" value={data.viewport} />
        <MetaRow label="Charset" value={data.charset} />
      </div>
    </Section>
  )
}
