import React from 'react'
import { useTabDataStore } from '@/store/tabDataStore'
import { Button } from '@/components/ui/button'
import { Section, StatBox } from '@/components/common'
import { IconRefresh, IconWifiOff, IconLayersSubtract } from '@tabler/icons-react'
import type { TechStackItem, TechStackCategory } from '@/shared/types/techstack'
import { TECH_STACK_CATEGORY_LABELS } from '@/shared/types/techstack'
import { TechStackIcon } from '@/components/techstack/TechStackIcon'

interface TechStackPageProps {
  onReload: () => void
}


const CATEGORY_ORDER: TechStackCategory[] = [
  'ad_network',
  'analytics',
  'tag_manager',
  'cdp',
  'marketing_automation',
  'personalization',
  'retargeting',
  'cookie_consent',
  'cdn',
  'frontend_framework',
  'cms',
  'js_library',
  'security',
  'widget',
  'other',
]

function groupByCategory(items: TechStackItem[]): Map<TechStackCategory, TechStackItem[]> {
  const map = new Map<TechStackCategory, TechStackItem[]>()
  for (const item of items) {
    const list = map.get(item.category) ?? []
    list.push(item)
    map.set(item.category, list)
  }
  return map
}

const TechStackCard: React.FC<{ item: TechStackItem }> = ({ item }) => (
  <div className="flex items-center gap-2 p-2 border rounded-lg bg-card">
    <TechStackIcon name={item.name} category={item.category} domain={item.domain} className="h-5 w-5" />
    <div className="min-w-0 flex-1">
      <div className="text-xs font-medium truncate">{item.name}</div>
      {item.version && (
        <div className="text-[10px] text-muted-foreground">{item.version}</div>
      )}
    </div>
  </div>
)

export const TechStackPage: React.FC<TechStackPageProps> = ({ onReload }) => {
  const data = useTabDataStore((s) => s.techStackData)
  const status = useTabDataStore((s) => s.status)

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-muted-foreground">Connecting...</div>
        <p className="text-[10px] text-muted-foreground/70 text-center max-w-48">
          If the page was already loaded before opening this panel, reload to capture tech stack data.
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <IconWifiOff size={32} className="text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Could not collect data.</p>
        <p className="text-xs text-muted-foreground/70 text-center max-w-48">
          This may be a restricted page (chrome://, file://) or the page has not finished loading.
        </p>
        <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
          <IconRefresh size={14} />
          Reload Page
        </Button>
      </div>
    )
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <IconLayersSubtract size={32} className="mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          {status === 'loading' ? 'Detecting tech stack...' : 'No technologies detected'}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1 mb-4">
          Tech stack data will appear once the page is analyzed
        </p>
        {status !== 'loading' && (
          <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
            <IconRefresh size={14} />
            Reload Page
          </Button>
        )}
      </div>
    )
  }

  const grouped = groupByCategory(data.items)
  const categoriesPresent = CATEGORY_ORDER.filter((c) => grouped.has(c))

  return (
    <div className="divide-y divide-border/50">
      {/* Header */}
      <div className="p-3 bg-linear-to-b from-violet-500/10 to-transparent border-t-2 border-violet-500/30">
        <div className="flex items-center gap-2 mb-3">
          <IconLayersSubtract size={16} className="text-violet-500" />
          <span className="text-sm font-medium">Tech Stack</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <StatBox label="Total" value={data.items.length} highlight={data.items.length > 0} />
          <StatBox label="Ad Network" value={grouped.get('ad_network')?.length ?? 0} />
          <StatBox label="Analytics" value={grouped.get('analytics')?.length ?? 0} />
          <StatBox label="Categories" value={categoriesPresent.length} />
        </div>
      </div>

      {/* Category sections */}
      {categoriesPresent.map((cat) => {
        const items = grouped.get(cat)!
        return (
          <Section
            key={cat}
            title={TECH_STACK_CATEGORY_LABELS[cat]}
            count={items.length}
            defaultOpen={cat === 'ad_network' || cat === 'analytics' || cat === 'tag_manager'}
          >
            <div className="grid grid-cols-2 gap-1.5">
              {items.map((item) => (
                <TechStackCard key={item.name} item={item} />
              ))}
            </div>
          </Section>
        )
      })}
    </div>
  )
}
