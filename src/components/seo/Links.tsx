import React from 'react'
import { IconChainLink1 as IconLink, IconArrowOutOfBox as IconExternalLink, IconChevronRightMedium as IconArrowRight } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface LinksProps {
  internal: number
  external: number
  nofollow: number
}

const LinkStat: React.FC<{
  icon: React.ReactNode
  label: string
  value: number
}> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-md border border-border/60 px-2 py-1.5">
    <div className="text-muted-foreground">{icon}</div>
    <div className="flex-1">
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
    <div className="text-sm font-semibold tabular-nums">{value}</div>
  </div>
)

export const Links: React.FC<LinksProps> = ({ internal, external, nofollow }) => {
  const total = internal + external

  return (
    <Section
      title="Links"
      icon={<IconLink size={14} />}
      badge={
        total > 0 ? (
          <span className="text-xs text-muted-foreground">{total} total</span>
        ) : null
      }
    >
      <div className="space-y-1.5">
        <LinkStat
          icon={<IconArrowRight size={14} />}
          label="Internal Links"
          value={internal}
        />
        <LinkStat
          icon={<IconExternalLink size={14} />}
          label="External Links"
          value={external}
        />
        <LinkStat
          icon={<IconLink size={14} />}
          label="Nofollow Links"
          value={nofollow}
        />
      </div>

      {/* Visual bar */}
      {total > 0 && (
        <div className="mt-3 pt-2 border-t border-border/30">
          <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span>Distribution</span>
          </div>
          <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
            {internal > 0 && (
              <div
                className="h-full bg-foreground/70"
                style={{ width: `${(internal / total) * 100}%` }}
                title={`Internal: ${internal}`}
              />
            )}
            {external > 0 && (
              <div
                className="h-full bg-foreground/25"
                style={{ width: `${(external / total) * 100}%` }}
                title={`External: ${external}`}
              />
            )}
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Internal {Math.round((internal / total) * 100)}%</span>
            <span>External {Math.round((external / total) * 100)}%</span>
          </div>
        </div>
      )}
    </Section>
  )
}
