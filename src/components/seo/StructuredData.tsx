import React, { useState } from 'react'
import { IconCode, IconChevronRight, IconCheck, IconX } from '@tabler/icons-react'
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
    <div className="border border-border/50 rounded overflow-hidden">
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
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {item.type}
        </Badge>
        <div className="flex-1" />
        {item.isValid ? (
          <div className="flex items-center gap-1 text-[10px] text-green-600">
            <IconCheck size={12} />
            <span>Valid</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-destructive">
            <IconX size={12} />
            <span>Invalid</span>
          </div>
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-border/50">
          <pre className="text-[10px] p-2 overflow-auto max-h-40 bg-muted/30 font-mono">
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
            <span className="text-[10px] text-muted-foreground">{items.length}</span>
            {validCount > 0 && (
              <span className="text-[10px] px-1 py-0 bg-green-500/20 text-green-600 rounded">
                {validCount} valid
              </span>
            )}
            {invalidCount > 0 && (
              <span className="text-[10px] px-1 py-0 bg-destructive/20 text-destructive rounded">
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
