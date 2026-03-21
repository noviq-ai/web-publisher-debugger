import type { TechStackItem } from '@/shared/types/techstack'
import { REGISTRY } from './registry'
import type { TechEntry } from './registry'

// ==========================================
// 汎用エバリュエーター
// ==========================================

function evaluate(
  entry: TechEntry,
  scriptSrcs: string[],
  detectedGlobals: Set<string>,
): boolean {
  const results = entry.checks.map((check) => {
    switch (check.type) {
      case 'script_url':
        return scriptSrcs.some((src) => check.patterns!.some((re) => re.test(src)))
      case 'dom':
        return !!document.querySelector(check.selector!)
      case 'meta': {
        const el = check.name
          ? document.querySelector<HTMLMetaElement>(`meta[name="${check.name}"]`)
          : document.querySelector<HTMLMetaElement>(`meta[property="${check.property!}"]`)
        if (!el) return false
        return check.contentPattern ? check.contentPattern.test(el.content) : true
      }
      case 'global':
        return detectedGlobals.has(check.name!)
    }
  })

  return entry.matchMode === 'all'
    ? results.every(Boolean)
    : results.some(Boolean)
}

// ==========================================
// 公開 API
// ==========================================

/**
 * content script コンテキストで tech stack を検出する。
 * @param detectedGlobals injected.ts が検出した技術名のセット（global check に使用）
 */
export function collectTechStackFromDOM(detectedGlobals: Set<string> = new Set()): TechStackItem[] {
  // スクリプト URL を収集
  const scriptSrcs: string[] = []
  document.querySelectorAll<HTMLScriptElement>('script[src]').forEach((el) => {
    if (el.src) scriptSrcs.push(el.src)
  })
  if (typeof performance !== 'undefined' && performance.getEntriesByType) {
    performance.getEntriesByType('resource').forEach((entry) => {
      const res = entry as PerformanceResourceTiming
      if (res.initiatorType === 'script') scriptSrcs.push(res.name)
    })
  }

  const items: TechStackItem[] = []
  const detectedNames = new Set<string>()

  for (const entry of REGISTRY) {
    if (detectedNames.has(entry.name)) continue
    if (!evaluate(entry, scriptSrcs, detectedGlobals)) continue
    detectedNames.add(entry.name)
    items.push({
      name: entry.name,
      category: entry.category,
      detectedBy: entry.checks.some((c) => c.type === 'global' && detectedGlobals.has(c.name!))
        ? 'global'
        : entry.checks.some((c) => c.type === 'script_url')
        ? 'script_url'
        : 'dom',
      domain: entry.domain,
    })
  }

  return items
}
