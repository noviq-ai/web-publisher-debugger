import React, { useState } from 'react'
import type { SeoData } from '@/shared/types/seo'
import { IconShare, IconExternalLink, IconPhotoOff } from '@tabler/icons-react'
import { Section } from '@/components/common'

interface OpenGraphProps {
  ogp: SeoData['ogp']
}

const OgpPreview: React.FC<{ ogp: SeoData['ogp'] }> = ({ ogp }) => {
  const [imageError, setImageError] = useState(false)
  const hasImage = ogp.image && !imageError

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden bg-muted/30">
      {/* Image Preview */}
      {ogp.image && (
        <div className="relative aspect-[1.91/1] bg-muted">
          {hasImage ? (
            <img
              src={ogp.image}
              alt={ogp.title || 'OG Image'}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <IconPhotoOff size={32} />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-2.5">
        {ogp.siteName && (
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{ogp.siteName}</div>
        )}
        <div className="text-xs font-medium line-clamp-2 mb-0.5">{ogp.title || 'No title'}</div>
        {ogp.description && (
          <div className="text-[11px] text-muted-foreground line-clamp-2">{ogp.description}</div>
        )}
        {ogp.url && (
          <div className="text-[10px] text-muted-foreground mt-1 truncate">{new URL(ogp.url).hostname}</div>
        )}
      </div>
    </div>
  )
}

const OgpField: React.FC<{ label: string; value: string | null; isUrl?: boolean }> = ({ label, value, isUrl }) => {
  if (!value) return null

  return (
    <div className="flex items-start py-1 text-[11px] border-b border-border/30 last:border-b-0">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      {isUrl ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1 truncate"
        >
          <span className="truncate">{value}</span>
          <IconExternalLink size={10} className="shrink-0" />
        </a>
      ) : (
        <span className="truncate" title={value}>{value}</span>
      )}
    </div>
  )
}

export const OpenGraph: React.FC<OpenGraphProps> = ({ ogp }) => {
  const hasContent = ogp.title || ogp.description || ogp.image

  return (
    <Section title="Open Graph" icon={<IconShare size={14} />} defaultOpen={!!hasContent}>
      {hasContent ? (
        <div className="space-y-3">
          <OgpPreview ogp={ogp} />
          <div className="space-y-0">
            <OgpField label="og:title" value={ogp.title} />
            <OgpField label="og:description" value={ogp.description} />
            <OgpField label="og:image" value={ogp.image} isUrl />
            <OgpField label="og:url" value={ogp.url} isUrl />
            <OgpField label="og:type" value={ogp.type} />
            <OgpField label="og:site_name" value={ogp.siteName} />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-2">No Open Graph tags found.</p>
      )}
    </Section>
  )
}
