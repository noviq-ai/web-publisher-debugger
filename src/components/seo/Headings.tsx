import React from 'react'
import { IconTextIndentRight, IconExclamationTriangle } from '@central-icons-react/round-outlined-radius-2-stroke-1.5'
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
const HEADING_INDENT_STEP_PX = 16

interface HeadingSummaryProps {
  tag: typeof HEADING_TAGS[number]
  count: number
}

const HeadingSummary: React.FC<HeadingSummaryProps> = ({ tag, count }) => (
  <div className="min-w-0 px-1 py-2 text-center">
    <div className={cn('text-sm font-semibold tabular-nums', count === 0 && 'text-muted-foreground/50')}>
      {count}
    </div>
    <div className="font-mono text-xs uppercase text-muted-foreground">{tag}</div>
  </div>
)

export const Headings: React.FC<HeadingsProps> = ({ headings }) => {
  const hasAnyHeadings = HEADING_TAGS.some((tag) => headings[tag].length > 0)
  const totalHeadings = HEADING_TAGS.reduce((sum, tag) => sum + headings[tag].length, 0)
  const h1Count = headings.h1.length

  const badge = (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{totalHeadings} headings</span>
      {h1Count !== 1 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-1.5 py-0.5 text-xs text-warning">
          <IconExclamationTriangle size={12} aria-hidden="true" />
          {h1Count === 0 ? 'Missing H1' : `${h1Count} H1s`}
        </span>
      )}
    </div>
  )

  return (
    <Section title="Heading Structure" icon={<IconTextIndentRight size={14} />} badge={badge}>
      {!hasAnyHeadings ? (
        <p className="py-2 text-xs text-muted-foreground">No headings found</p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-6 divide-x divide-border/60 overflow-hidden rounded-lg border border-border/60 bg-card">
            {HEADING_TAGS.map((tag) => (
              <HeadingSummary key={tag} tag={tag} count={headings[tag].length} />
            ))}
          </div>

          <div className="max-h-56 overflow-y-auto">
            <div className="space-y-0.5">
              {HEADING_TAGS.map((tag) =>
                headings[tag].map((text, index) => {
                  const level = HEADING_TAGS.indexOf(tag)
                  return (
                    <div
                      key={`${tag}-${index}`}
                      className="flex min-w-0 items-center rounded-md py-1.5 pr-2 text-xs hover:bg-muted/50"
                      style={{ paddingLeft: `${level * HEADING_INDENT_STEP_PX}px` }}
                    >
                      <span
                        className={cn(
                          'w-8 shrink-0 font-mono uppercase text-muted-foreground',
                          tag === 'h1' && 'font-semibold text-foreground'
                        )}
                      >
                        {tag}
                      </span>
                      {text ? (
                        <span className={cn('min-w-0 truncate', tag === 'h1' && 'font-medium')} title={text}>
                          {text}
                        </span>
                      ) : (
                        <span className="truncate italic text-muted-foreground/60">Empty heading</span>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}
