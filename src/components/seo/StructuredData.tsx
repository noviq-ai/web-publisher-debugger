import React, { useState } from 'react'
import { IconCode, IconChevronRightMedium as IconChevronRight, IconCheckmark1 as IconCheck, IconCrossMedium } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Badge } from '@/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import { Section } from '@/components/common'

interface JsonLdItem {
  type: string
  raw: unknown
  isValid: boolean
}

interface StructuredDataProps {
  items: JsonLdItem[]
}

const StructuredDataItem: React.FC<{ item: JsonLdItem }> = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="overflow-hidden rounded-md border border-border/60">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-2 hover:bg-muted/50 transition-colors text-left"
      >
        <IconChevronRight
          size={12}
          className={cn(
            'text-muted-foreground transition-transform',
            isExpanded && 'rotate-90'
          )}
        />
        <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-xs">
          {item.type}
        </Badge>
        <div className="flex-1" />
        {item.isValid ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconCheck size={12} />
            <span>Valid</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <IconCrossMedium size={12} />
            <span>Invalid</span>
          </div>
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-border/50">
          <pre className="max-h-40 overflow-auto bg-muted/30 p-2 font-mono text-xs">
            {JSON.stringify(item.raw, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export const StructuredData: React.FC<StructuredDataProps> = ({ items }) => {
  const validCount = items.filter((i) => i.isValid).length
  const invalidCount = items.filter((i) => !i.isValid).length

  return (
    <Section
      title="Structured Data"
      icon={<IconCode size={14} />}
      badge={
        items.length > 0 ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{items.length}</span>
            {validCount > 0 && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {validCount} valid
              </span>
            )}
            {invalidCount > 0 && (
              <span className="rounded-full bg-destructive/20 px-1.5 py-0.5 text-xs text-destructive">
                {invalidCount} invalid
              </span>
            )}
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No structured data found</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((item, idx) => (
            <StructuredDataItem key={idx} item={item} />
          ))}
        </div>
      )}
    </Section>
  )
}
