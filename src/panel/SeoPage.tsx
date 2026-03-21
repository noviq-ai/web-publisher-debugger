import React from 'react'
import { useTabDataStore } from '@/store/tabDataStore'
import { Button } from '@/components/ui/button'
import { IconSearch, IconRefresh, IconWifiOff } from '@tabler/icons-react'
import {
  SeoHeader,
  MetaTags,
  OpenGraph,
  TwitterCard,
  Issues,
  Headings,
  Links,
  StructuredData,
  Hreflang,
} from '@/components/seo'

interface SeoPageProps {
  onReload: () => void
}

export const SeoPage: React.FC<SeoPageProps> = ({ onReload }) => {
  const data = useTabDataStore((s) => s.seoData)
  const status = useTabDataStore((s) => s.status)

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-muted-foreground">Connecting...</div>
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

  if (!data) {
    return (
      <div className="text-center py-12 px-4">
        <IconSearch size={32} className="mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No SEO data collected yet.</p>
        <p className="text-xs text-muted-foreground/70 mt-1 mb-4">Navigate to a page to see SEO analysis.</p>
        <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
          <IconRefresh size={14} />
          Reload Page
        </Button>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      <SeoHeader data={data} />
      <Issues issues={data.issues} />
      <MetaTags data={data} />
      <OpenGraph ogp={data.ogp} />
      <TwitterCard twitter={data.twitter} />
      <StructuredData items={data.jsonLd} />
      <Headings headings={data.headings} />
      <Links
        internal={data.links.internal}
        external={data.links.external}
        nofollow={data.links.nofollow}
      />
      <Hreflang items={data.hreflang} />
    </div>
  )
}
