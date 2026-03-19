import React from 'react'
import { IconLink, IconExternalLink, IconArrowRight } from '@tabler/icons-react'
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
  color: string
}> = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-muted/30">
    <div className={`text-${color}`}>{icon}</div>
    <div className="flex-1">
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
    <div className={`text-sm font-semibold tabular-nums text-${color}`}>{value}</div>
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
          <span className="text-[10px] text-muted-foreground">{total} total</span>
        ) : null
      }
    >
      <div className="space-y-1.5">
        <LinkStat
          icon={<IconArrowRight size={14} />}
          label="Internal Links"
          value={internal}
          color="blue-500"
        />
        <LinkStat
          icon={<IconExternalLink size={14} />}
          label="External Links"
          value={external}
          color="green-500"
        />
        <LinkStat
          icon={<IconLink size={14} />}
          label="Nofollow Links"
          value={nofollow}
          color="orange-500"
        />
      </div>

      {/* Visual bar */}
      {total > 0 && (
        <div className="mt-3 pt-2 border-t border-border/30">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
            <span>Distribution</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            {internal > 0 && (
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${(internal / total) * 100}%` }}
                title={`Internal: ${internal}`}
              />
            )}
            {external > 0 && (
              <div
                className="bg-green-500 h-full"
                style={{ width: `${(external / total) * 100}%` }}
                title={`External: ${external}`}
              />
            )}
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
            <span>Internal {Math.round((internal / total) * 100)}%</span>
            <span>External {Math.round((external / total) * 100)}%</span>
          </div>
        </div>
      )}
    </Section>
  )
}
