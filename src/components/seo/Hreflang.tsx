import React from 'react'
import { IconGlobe, IconExternalLink } from '@tabler/icons-react'
import { Section } from '@/components/common'

interface HreflangItem {
  lang: string
  href: string
}

interface HreflangProps {
  items: HreflangItem[]
}

// Language code to flag emoji mapping (common languages)
const langToFlag: Record<string, string> = {
  en: '🇺🇸',
  'en-us': '🇺🇸',
  'en-gb': '🇬🇧',
  'en-au': '🇦🇺',
  'en-ca': '🇨🇦',
  ja: '🇯🇵',
  'ja-jp': '🇯🇵',
  zh: '🇨🇳',
  'zh-cn': '🇨🇳',
  'zh-tw': '🇹🇼',
  'zh-hk': '🇭🇰',
  ko: '🇰🇷',
  'ko-kr': '🇰🇷',
  de: '🇩🇪',
  'de-de': '🇩🇪',
  'de-at': '🇦🇹',
  'de-ch': '🇨🇭',
  fr: '🇫🇷',
  'fr-fr': '🇫🇷',
  'fr-ca': '🇨🇦',
  es: '🇪🇸',
  'es-es': '🇪🇸',
  'es-mx': '🇲🇽',
  it: '🇮🇹',
  'it-it': '🇮🇹',
  pt: '🇵🇹',
  'pt-pt': '🇵🇹',
  'pt-br': '🇧🇷',
  ru: '🇷🇺',
  'ru-ru': '🇷🇺',
  nl: '🇳🇱',
  'nl-nl': '🇳🇱',
  pl: '🇵🇱',
  'pl-pl': '🇵🇱',
  th: '🇹🇭',
  'th-th': '🇹🇭',
  vi: '🇻🇳',
  'vi-vn': '🇻🇳',
  id: '🇮🇩',
  'id-id': '🇮🇩',
  'x-default': '🌐',
}

const getFlag = (lang: string): string => {
  const normalized = lang.toLowerCase()
  return langToFlag[normalized] || '🏳️'
}

export const Hreflang: React.FC<HreflangProps> = ({ items }) => {
  return (
    <Section
      title="Hreflang"
      icon={<IconGlobe size={14} />}
      badge={
        items.length > 0 ? (
          <span className="text-[10px] text-muted-foreground">{items.length} languages</span>
        ) : null
      }
    >
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No hreflang tags found</p>
      ) : (
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 py-1.5 px-2 rounded bg-muted/30 group hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm">{getFlag(item.lang)}</span>
              <span className="text-[10px] font-mono bg-background px-1.5 py-0.5 rounded border border-border/50 shrink-0">
                {item.lang}
              </span>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-[11px] text-muted-foreground hover:text-foreground truncate inline-flex items-center gap-1"
                title={item.href}
              >
                <span className="truncate">{item.href}</span>
                <IconExternalLink size={10} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
