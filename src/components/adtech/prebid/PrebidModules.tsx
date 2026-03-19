import React from 'react'
import { IconHexagons } from '@tabler/icons-react'
import { Section } from '@/components/common'

interface PrebidModulesProps {
  modules: string[]
}

type Category = 'Bidder Adapter' | 'ID Module' | 'Analytics' | 'RTD' | 'Other'

const CATEGORIES: { label: Category; suffix: string; color: string }[] = [
  { label: 'Bidder Adapter', suffix: 'BidAdapter', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { label: 'ID Module',      suffix: 'IdSystem',   color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { label: 'Analytics',      suffix: 'AnalyticsAdapter', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
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
              <div className="text-[10px] font-medium text-muted-foreground mb-1">{cat} ({grouped[cat].length})</div>
              <div className="flex flex-wrap gap-1">
                {grouped[cat].sort().map(m => (
                  <span key={m} className={`text-[10px] px-1.5 py-0.5 rounded ${color}`}>{m}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
