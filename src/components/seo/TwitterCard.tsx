import React, { useState } from 'react'
import type { SeoData } from '@/shared/types/seo'
import { IconArrowOutOfBox as IconExternalLink, IconImages1 as IconPhotoOff, IconShareOs as IconShare } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { Section } from '@/components/common'

interface TwitterCardProps {
  twitter: SeoData['twitter']
}

const TwitterPreview: React.FC<{ twitter: SeoData['twitter'] }> = ({ twitter }) => {
  const [imageError, setImageError] = useState(false)
  const hasImage = twitter.image && !imageError
  const isSummaryLarge = twitter.card === 'summary_large_image'

  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
      {/* Image for large card */}
      {twitter.image && isSummaryLarge && (
        <div className="relative h-40 bg-muted">
          {hasImage ? (
            <img
              src={twitter.image}
              alt={twitter.title || 'Twitter Card'}
              width={1200}
              height={600}
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

      {/* Content with small image */}
      <div className={`p-2.5 ${!isSummaryLarge && twitter.image ? 'flex gap-2.5' : ''}`}>
        {twitter.image && !isSummaryLarge && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
            {hasImage ? (
              <img
                src={twitter.image}
                alt={twitter.title || 'Twitter Card'}
                width={64}
                height={64}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <IconPhotoOff size={16} />
              </div>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium line-clamp-2 mb-0.5">{twitter.title || 'No title'}</div>
          {twitter.description && (
            <div className="line-clamp-2 text-xs text-muted-foreground">{twitter.description}</div>
          )}
          {twitter.site && (
            <div className="mt-1 text-xs text-muted-foreground">via {twitter.site}</div>
          )}
        </div>
      </div>
    </div>
  )
}

const TwitterField: React.FC<{ label: string; value: string | null; isUrl?: boolean }> = ({ label, value, isUrl }) => {
  if (!value) return null

  return (
    <div className="flex min-h-8 items-center border-b border-border/30 py-1.5 text-xs last:border-b-0">
      <span className="text-muted-foreground w-32 shrink-0">{label}</span>
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

export const TwitterCard: React.FC<TwitterCardProps> = ({ twitter }) => {
  const hasContent = twitter.title || twitter.description || twitter.image || twitter.card

  return (
    <Section title="Twitter Card" icon={<IconShare size={14} />}>
      {hasContent ? (
        <div className="space-y-3">
          <TwitterPreview twitter={twitter} />
          <div className="space-y-0">
            <TwitterField label="twitter:card" value={twitter.card} />
            <TwitterField label="twitter:site" value={twitter.site} />
            <TwitterField label="twitter:title" value={twitter.title} />
            <TwitterField label="twitter:description" value={twitter.description} />
            <TwitterField label="twitter:image" value={twitter.image} isUrl />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-2">No Twitter Card tags found.</p>
      )}
    </Section>
  )
}
