import React, { useCallback, useMemo } from 'react'
import { useTabDataStore } from '@/store/tabDataStore'
import { Button } from '@/components/ui/button'
import { Section, StatBox } from '@/components/common'
import {
  IconArrowRotateLeftRight as IconRefresh,
  IconChart7,
  IconCloud,
  IconCode,
  IconLayersThree as IconLayersSubtract,
  IconMegaphone2,
  IconPackage,
  IconPuzzle,
  IconShield,
  IconTag,
  IconTarget,
  IconWifiNoSignal as IconWifiOff,
  IconWindowSparkle,
} from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import type { TechStackItem, TechStackCategory } from '@/shared/types/techstack'
import { TECH_STACK_CATEGORY_LABELS } from '@/shared/types/techstack'
import { TechStackIcon } from '@/components/techstack/TechStackIcon'
import { AiSummaryButton, AiSummaryCard } from '@/components/ai-summary'
import { useAiSummary } from '@/hooks/useAiSummary'
import { resolvePreferredResponseLanguage } from '@/ai/browser-ai/shared'
import { streamTechStackSummary } from '@/ai/browser-ai/summaries/tech-stack'

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

const DETECTION_LABELS: Record<TechStackItem['detectedBy'], string> = {
  global: 'Global',
  script_url: 'Script',
  dom: 'DOM',
}

function categoryIcon(category: TechStackCategory): React.ReactNode {
  switch (category) {
    case 'ad_network': return <IconMegaphone2 size={14} />
    case 'analytics': return <IconChart7 size={14} />
    case 'tag_manager': return <IconTag size={14} />
    case 'cdn': return <IconCloud size={14} />
    case 'frontend_framework':
    case 'js_library': return <IconCode size={14} />
    case 'cms': return <IconWindowSparkle size={14} />
    case 'cookie_consent':
    case 'security': return <IconShield size={14} />
    case 'retargeting':
    case 'personalization': return <IconTarget size={14} />
    case 'widget': return <IconPuzzle size={14} />
    case 'cdp':
    case 'marketing_automation':
    case 'other': return <IconPackage size={14} />
  }
}

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
  <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-card p-2.5">
    <TechStackIcon name={item.name} domain={item.domain} className="size-5" />
    <div className="min-w-0 flex-1">
      <div className="text-xs font-medium truncate">{item.name}</div>
      <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
        <span>{DETECTION_LABELS[item.detectedBy]}</span>
        {item.version && <><span aria-hidden="true">·</span><span className="truncate font-mono">{item.version}</span></>}
      </div>
    </div>
  </div>
)

export const TechStackPage: React.FC<TechStackPageProps> = ({ onReload }) => {
  const data = useTabDataStore((s) => s.techStackData)
  const status = useTabDataStore((s) => s.status)
  const currentTabId = useTabDataStore((s) => s.currentTabId)
  const preferredResponseLanguage = useMemo(() => resolvePreferredResponseLanguage(typeof chrome === 'undefined' || !chrome.i18n ? null : chrome.i18n.getUILanguage(), navigator.languages), [])
  const streamSummary = useCallback((abortSignal: AbortSignal) => {
    if (!data) throw new Error('Tech stack data is unavailable')
    return streamTechStackSummary(data, abortSignal, preferredResponseLanguage)
  }, [data, preferredResponseLanguage])
  const aiSummary = useAiSummary({ sourceKey: currentTabId === null ? null : String(currentTabId), streamSummary })

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent motion-reduce:animate-none" />
        <div className="text-sm text-muted-foreground">Connecting…</div>
        <p className="max-w-48 text-center text-xs text-muted-foreground/70">
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
          {status === 'loading' ? 'Detecting tech stack…' : 'No technologies detected'}
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
      <div className="border-b border-border/50 p-3">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-info/15 text-info">
            <IconLayersSubtract size={16} />
          </span>
          <span className="text-sm font-medium">Tech Stack</span>
          <div className="ml-auto"><AiSummaryButton availability={aiSummary.availability} status={aiSummary.status} onGenerate={() => void aiSummary.generate()} onStop={aiSummary.stop} /></div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <StatBox label="Total" value={data.items.length} variant="success" />
          <StatBox label="Ad Network" value={grouped.get('ad_network')?.length ?? 0} variant="info" />
          <StatBox label="Analytics" value={grouped.get('analytics')?.length ?? 0} variant="info" />
          <StatBox label="Categories" value={categoriesPresent.length} />
        </div>
      </div>
      {aiSummary.status !== 'idle' && <AiSummaryCard status={aiSummary.status} summary={aiSummary.summary} error={aiSummary.error} onCopy={() => void aiSummary.copy()} onRegenerate={() => void aiSummary.generate()} onClose={aiSummary.close} />}

      {categoriesPresent.map((cat) => {
        const items = grouped.get(cat)!
        return (
          <Section
            key={cat}
            title={TECH_STACK_CATEGORY_LABELS[cat]}
            icon={categoryIcon(cat)}
            count={items.length}
            defaultOpen={cat === 'ad_network'}
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
