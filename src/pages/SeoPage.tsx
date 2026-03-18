import React from 'react'
import type { SeoData } from '@/shared/types/seo'
import { Button } from '@/components/ui/button'
import { Search, RefreshCw } from 'lucide-react'
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
  data: SeoData | null
  isLoading: boolean
  onReload: () => void
}

export const SeoPage: React.FC<SeoPageProps> = ({ data, isLoading, onReload }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-sm text-muted-foreground">Loading SEO data...</div>
        <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Reload Page
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 px-4">
        <Search className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No SEO data collected yet.</p>
        <p className="text-xs text-muted-foreground/70 mt-1 mb-4">Navigate to a page to see SEO analysis.</p>
        <Button variant="outline" size="sm" onClick={onReload} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Reload Page
        </Button>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/50">
      {/* Header Stats */}
      <SeoHeader data={data} />

      {/* Issues */}
      <Issues issues={data.issues} />

      {/* Meta Tags */}
      <MetaTags data={data} />

      {/* Open Graph */}
      <OpenGraph ogp={data.ogp} />

      {/* Twitter Card */}
      <TwitterCard twitter={data.twitter} />

      {/* Structured Data */}
      <StructuredData items={data.jsonLd} />

      {/* Heading Structure */}
      <Headings headings={data.headings} />

      {/* Links */}
      <Links
        internal={data.links.internal}
        external={data.links.external}
        nofollow={data.links.nofollow}
      />

      {/* Hreflang */}
      <Hreflang items={data.hreflang} />
    </div>
  )
}
