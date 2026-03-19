import React from 'react'
import { IconHeading } from '@tabler/icons-react'
import { cn } from '@/shared/lib/utils'
import { Section } from '@/components/common'

interface HeadingsProps {
  headings: {
    h1: string[]
    h2: string[]
    h3: string[]
    h4: string[]
    h5: string[]
    h6: string[]
  }
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

const HeadingTag: React.FC<{ tag: string; count: number }> = ({ tag, count }) => (
  <span
    className={cn(
      'text-[10px] font-mono px-1.5 py-0.5 rounded',
      tag === 'h1' && 'bg-green-500/20 text-green-600',
      tag === 'h2' && 'bg-blue-500/20 text-blue-600',
      tag === 'h3' && 'bg-purple-500/20 text-purple-600',
      tag === 'h4' && 'bg-orange-500/20 text-orange-600',
      tag === 'h5' && 'bg-pink-500/20 text-pink-600',
      tag === 'h6' && 'bg-gray-500/20 text-gray-600'
    )}
  >
    {tag.toUpperCase()} ({count})
  </span>
)

export const Headings: React.FC<HeadingsProps> = ({ headings }) => {
  const hasAnyHeadings = HEADING_TAGS.some((tag) => headings[tag].length > 0)
  const totalHeadings = HEADING_TAGS.reduce((sum, tag) => sum + headings[tag].length, 0)

  return (
    <Section
      title="Heading Structure"
      icon={<IconHeading size={14} />}
      badge={
        totalHeadings > 0 ? (
          <span className="text-[10px] text-muted-foreground">{totalHeadings} headings</span>
        ) : null
      }
    >
      {!hasAnyHeadings ? (
        <p className="text-xs text-muted-foreground py-2">No headings found</p>
      ) : (
        <div className="space-y-2">
          {/* Summary */}
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-border/30">
            {HEADING_TAGS.map((tag) => {
              const count = headings[tag].length
              if (count === 0) return null
              return <HeadingTag key={tag} tag={tag} count={count} />
            })}
          </div>

          {/* Heading list */}
          <div className="max-h-48 overflow-auto">
            <div className="relative">
              <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-green-500/50 to-green-500/10" />
              <div className="space-y-0.5">
                {HEADING_TAGS.map((tag) =>
                  headings[tag].map((text, idx) => {
                    const indent = HEADING_TAGS.indexOf(tag)
                    return (
                      <div
                        key={`${tag}-${idx}`}
                        className="relative pl-4 py-0.5 text-[11px]"
                        style={{ marginLeft: `${indent * 12}px` }}
                      >
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-green-500/50 bg-background" />
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'shrink-0 font-mono text-[9px] px-1 py-0.5 rounded',
                              tag === 'h1' && 'bg-green-500/10 text-green-600',
                              tag === 'h2' && 'bg-blue-500/10 text-blue-600',
                              tag === 'h3' && 'bg-purple-500/10 text-purple-600',
                              tag === 'h4' && 'bg-orange-500/10 text-orange-600',
                              tag === 'h5' && 'bg-pink-500/10 text-pink-600',
                              tag === 'h6' && 'bg-gray-500/10 text-gray-600'
                            )}
                          >
                            {tag}
                          </span>
                          {text ? (
                            <span className="truncate" title={text}>
                              {text}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60 italic">Empty heading</span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}
