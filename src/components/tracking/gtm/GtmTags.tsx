import React from 'react'
import type { GtmTag } from '@/shared/types/gtm'
import { IconTag } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface GtmTagsProps {
  tags: GtmTag[]
}

export const GtmTags: React.FC<GtmTagsProps> = ({ tags }) => {
  if (tags.length === 0) return null

  return (
    <Section title="Tags Fired" icon={<IconTag className="h-4 w-4" />} count={tags.length}>
      <div className="space-y-1.5">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between rounded-lg border border-border/50 px-2.5 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{tag.name}</div>
              <div className="text-xs text-muted-foreground">{tag.type}</div>
            </div>
            <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-xs text-success">
              {tag.firedCount}x
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}
