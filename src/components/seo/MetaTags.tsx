import React from 'react'
import type { SeoData } from '@/shared/types/seo'
import { IconFileText, IconArrowOutOfBox as IconExternalLink, IconCheckmark1 as IconCheck, IconCrossMedium, IconExclamationTriangle as IconAlertTriangle } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
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
    <div className="flex min-h-8 items-center border-b border-border/30 py-1.5 last:border-b-0">
      <div className="flex w-24 shrink-0 items-center gap-1.5">
        {isEmpty ? (
          <IconCrossMedium size={12} className="text-destructive" />
        ) : isOverLimit ? (
          <IconAlertTriangle size={12} className="text-warning" />
        ) : (
          <IconCheck size={12} className="text-muted-foreground" />
        )}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex-1 min-w-0">
        {isEmpty ? (
          <span className="text-xs italic text-muted-foreground/50">Not set</span>
        ) : isUrl ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 break-all text-xs text-primary hover:underline"
          >
            <span className="truncate">{value}</span>
            <IconExternalLink size={10} className="shrink-0" />
          </a>
        ) : (
          <span className="break-words text-xs">{value}</span>
        )}
      </div>
      {maxLength && value && (
        <span className={`ml-2 shrink-0 text-xs tabular-nums ${isOverLimit ? 'text-warning' : 'text-muted-foreground'}`}>
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
