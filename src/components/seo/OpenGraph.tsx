import React, { useState } from 'react'
import type { SeoData } from '@/shared/types/seo'
import { IconShareOs as IconShare, IconArrowOutOfBox as IconExternalLink, IconImages1 as IconPhotoOff } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface OpenGraphProps {
  ogp: SeoData['ogp']
}

const OgpPreview: React.FC<{ ogp: SeoData['ogp'] }> = ({ ogp }) => {
  const [imageError, setImageError] = useState(false)
  const hasImage = ogp.image && !imageError

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
      {/* Image Preview */}
      {ogp.image && (
        <div className="relative h-40 bg-muted">
          {hasImage ? (
            <img
              src={ogp.image}
              alt={ogp.title || 'OG Image'}
              width={1200}
              height={630}
              loading="lazy"
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
          <div className="mb-0.5 text-xs uppercase tracking-wide text-muted-foreground">{ogp.siteName}</div>
        )}
        <div className="text-xs font-medium line-clamp-2 mb-0.5">{ogp.title || 'No title'}</div>
        {ogp.description && (
          <div className="line-clamp-2 text-xs text-muted-foreground">{ogp.description}</div>
        )}
        {ogp.url && (
          <div className="mt-1 truncate text-xs text-muted-foreground">{new URL(ogp.url).hostname}</div>
        )}
      </div>
    </div>
  )
}

const OgpField: React.FC<{ label: string; value: string | null; isUrl?: boolean }> = ({ label, value, isUrl }) => {
  if (!value) return null

  return (
    <div className="flex min-h-8 items-center border-b border-border/30 py-1.5 text-xs last:border-b-0">
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
    <Section title="Open Graph" icon={<IconShare size={14} />}>
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
