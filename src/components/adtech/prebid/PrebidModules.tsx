import React from 'react'
import { IconFormHexagon as IconHexagons } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface PrebidModulesProps {
  modules: string[]
}

type Category = 'Bidder Adapter' | 'ID Module' | 'Analytics' | 'RTD' | 'Other'

const CATEGORIES: { label: Category; suffix: string; color: string }[] = [
  { label: 'Bidder Adapter', suffix: 'BidAdapter', color: 'bg-info/15 text-info' },
  { label: 'ID Module',      suffix: 'IdSystem',   color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { label: 'Analytics',      suffix: 'AnalyticsAdapter', color: 'bg-success/15 text-success' },
  { label: 'RTD',            suffix: 'RtdProvider', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
]

function categorize(module: string): { category: Category; color: string } {
  for (const { label, suffix, color } of CATEGORIES) {
    if (module.endsWith(suffix)) return { category: label, color }
  }
  return { category: 'Other', color: 'bg-muted text-muted-foreground' }
}

export const PrebidModules: React.FC<PrebidModulesProps> = ({ modules }) => {
  if (modules.length === 0) return null

  const grouped = modules.reduce<Record<Category, string[]>>((acc, m) => {
    const { category } = categorize(m)
    if (!acc[category]) acc[category] = []
    acc[category].push(m)
    return acc
  }, {} as Record<Category, string[]>)

  const order: Category[] = ['Bidder Adapter', 'ID Module', 'Analytics', 'RTD', 'Other']

  return (
    <Section title="Installed Modules" icon={<IconHexagons size={14} />} count={modules.length}>
      <div className="space-y-2">
        {order.filter(cat => grouped[cat]?.length > 0).map(cat => {
          const { color } = CATEGORIES.find(c => c.label === cat) ?? { color: 'bg-muted text-muted-foreground' }
          return (
            <div key={cat}>
              <div className="mb-1 text-xs font-medium text-muted-foreground">{cat} ({grouped[cat].length})</div>
              <div className="flex flex-wrap gap-1">
                {grouped[cat].sort().map(m => (
                  <span key={m} className={`rounded px-1.5 py-0.5 text-xs ${color}`}>{m}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
