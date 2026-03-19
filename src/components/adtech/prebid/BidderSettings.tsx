import React, { useState, useMemo } from 'react'
import { IconTarget, IconChevronRight, IconCopy, IconCheck } from '@tabler/icons-react'
import { IconFolderSymlink, IconSettings2 } from '@tabler/icons-react'
import { Section } from '@/components/common'

interface BidderAliasesProps {
  aliases: Record<string, string>
}

const PALETTE = [
  { bg: 'var(--color-bg-info)',    fg: 'var(--color-text-info)' },
  { bg: 'var(--color-bg-success)', fg: 'var(--color-text-success)' },
  { bg: 'var(--color-bg-warning)', fg: 'var(--color-text-warning)' },
  { bg: 'var(--color-bg-danger)',  fg: 'var(--color-text-danger)' },
  { bg: 'var(--color-bg-secondary)', fg: 'var(--color-text-secondary)' },
]

function adapterColor(adapter: string) {
  let hash = 0
  for (let i = 0; i < adapter.length; i++) hash = (hash * 31 + adapter.charCodeAt(i)) & 0xffff
  return PALETTE[hash % PALETTE.length]
}

export const BidderAliases: React.FC<BidderAliasesProps> = ({ aliases }) => {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grouped' | 'flat'>('grouped')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  const entries = Object.entries(aliases)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q ? entries.filter(([alias, adapter]) => alias.toLowerCase().includes(q) || adapter.toLowerCase().includes(q)) : entries
  }, [entries, search])

  const grouped = useMemo(() => {
    const g: Record<string, string[]> = {}
    filtered.forEach(([alias, adapter]) => {
      if (!g[adapter]) g[adapter] = []
      g[adapter].push(alias)
    })
    return Object.entries(g).sort((a, b) => b[1].length - a[1].length)
  }, [filtered])

  const adapterCount = new Set(filtered.map(([, a]) => a)).size

  const toggleGroup = (adapter: string) => {
    setOpenGroups(prev => ({ ...prev, [adapter]: prev[adapter] === false ? true : false }))
  }

  const isOpen = (adapter: string) => openGroups[adapter] !== false

  const copyJSON = () => {
    const obj = Object.fromEntries(entries)
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2)).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (entries.length === 0) return null

  return (
    <Section title="Bidder Aliases" icon={<IconFolderSymlink size={14} />} count={entries.length}>
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Filter by alias or adapter name..."
        className="w-full text-[11px] px-2.5 py-1.5 rounded border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:border-primary mb-2"
      />

      {/* Tabs */}
      <div className="flex border-b border-border mb-2">
        {(['grouped', 'flat'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`text-[11px] px-3 py-1.5 border-b-2 transition-colors ${view === v ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {v === 'grouped' ? 'By adapter' : 'Flat list'}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground self-center pr-1">{filtered.length} / {adapterCount} adapters</span>
      </div>

      {/* Adapter chips */}
      <div className="flex flex-wrap gap-1 mb-2">
        {grouped.map(([adapter, aliases]) => {
          const col = adapterColor(adapter)
          return (
            <button
              key={adapter}
              onClick={() => setSearch(s => s === adapter ? '' : adapter)}
              className="text-[10px] px-2 py-0.5 rounded-full border-0 cursor-pointer transition-opacity hover:opacity-70"
              style={{ background: col.bg, color: col.fg }}
            >
              {adapter} <span style={{ opacity: 0.6 }}>{aliases.length}</span>
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="max-h-64 overflow-y-auto rounded border border-border/50">
        {view === 'grouped' ? (
          grouped.map(([adapter, aliasesList]) => {
            const col = adapterColor(adapter)
            const open = isOpen(adapter)
            return (
              <div key={adapter} className="border-b border-border/30 last:border-b-0">
                <button
                  onClick={() => toggleGroup(adapter)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] hover:bg-muted/40 transition-colors text-left"
                >
                  <IconChevronRight size={12} className={`text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: col.bg, color: col.fg }}>{adapter}</span>
                  <span className="text-muted-foreground text-[10px]">{aliasesList.length} alias{aliasesList.length > 1 ? 'es' : ''}</span>
                </button>
                {open && (
                  <div className="border-t border-border/20">
                    {aliasesList.map(alias => (
                      <div key={alias} className="pl-8 pr-3 py-1.5 text-[11px] font-medium hover:bg-muted/30 border-b border-border/10 last:border-b-0">
                        {alias}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        ) : (
          filtered.map(([alias, adapter]) => {
            const col = adapterColor(adapter)
            return (
              <div key={alias} className="flex items-center gap-2 px-3 py-1.5 text-[11px] border-b border-border/20 last:border-b-0 hover:bg-muted/30">
                <span className="font-medium flex-1 truncate">{alias}</span>
                <span className="text-muted-foreground">→</span>
                <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: col.bg, color: col.fg }}>{adapter}</span>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-1.5">
        <button onClick={copyJSON} className="flex items-center gap-1 text-[10px] text-primary hover:underline">
          {copied ? <><IconCheck size={12} />Copied!</> : <><IconCopy size={12} />Copy JSON</>}
        </button>
      </div>
    </Section>
  )
}

interface BidderSettingsProps {
  settings: Record<string, unknown>
}

export const BidderSettings: React.FC<BidderSettingsProps> = ({ settings }) => {
  if (Object.keys(settings).length === 0) return null

  return (
    <Section title="Bidder Settings" icon={<IconSettings2 size={14} />} count={Object.keys(settings).length}>
      <div className="space-y-2">
        {Object.entries(settings).map(([bidder, settingsData]) => (
          <div key={bidder} className="bg-muted/30 rounded-md p-2">
            <div className="text-xs font-medium mb-1">{bidder === 'standard' ? 'Standard (Default)' : bidder}</div>
            <pre className="text-[10px] font-mono bg-muted/50 p-2 rounded overflow-x-auto max-h-24 text-muted-foreground">{JSON.stringify(settingsData, null, 2)}</pre>
          </div>
        ))}
      </div>
    </Section>
  )
}

interface AdServerTargetingProps {
  targeting: Record<string, Record<string, string>>
}

export const AdServerTargeting: React.FC<AdServerTargetingProps> = ({ targeting }) => {
  if (Object.keys(targeting).length === 0) return null

  return (
    <Section title="Ad Server Targeting" icon={<IconTarget size={14} />} count={Object.keys(targeting).length}>
      <div className="space-y-2">
        {Object.entries(targeting).map(([adUnit, targetingData]) => (
          <div key={adUnit} className="bg-muted/30 rounded-md p-2">
            <div className="text-xs font-medium mb-1.5 truncate" title={adUnit}>{adUnit}</div>
            <div className="space-y-0.5">
              {Object.entries(targetingData).map(([key, value]) => (
                <div key={key} className="flex items-center text-[10px]">
                  <span className="text-muted-foreground w-20 shrink-0">{key}</span>
                  <span className="font-mono truncate" title={value}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
