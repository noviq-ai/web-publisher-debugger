import React, { useState } from 'react'
import type { SeoData } from '@/shared/types/seo'
import { IconExternalLink, IconPhotoOff } from '@tabler/icons-react'
import { Section } from '@/components/common'

// Twitter/X Icon
const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

interface TwitterCardProps {
  twitter: SeoData['twitter']
}

const TwitterPreview: React.FC<{ twitter: SeoData['twitter'] }> = ({ twitter }) => {
  const [imageError, setImageError] = useState(false)
  const hasImage = twitter.image && !imageError
  const isSummaryLarge = twitter.card === 'summary_large_image'

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-muted/30">
      {/* Image for large card */}
      {twitter.image && isSummaryLarge && (
        <div className="relative aspect-[2/1] bg-muted">
          {hasImage ? (
            <img
              src={twitter.image}
              alt={twitter.title || 'Twitter Card'}
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
          <div className="w-16 h-16 shrink-0 rounded bg-muted overflow-hidden">
            {hasImage ? (
              <img
                src={twitter.image}
                alt={twitter.title || 'Twitter Card'}
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
            <div className="text-[11px] text-muted-foreground line-clamp-2">{twitter.description}</div>
          )}
          {twitter.site && (
            <div className="text-[10px] text-muted-foreground mt-1">via {twitter.site}</div>
          )}
        </div>
      </div>
    </div>
  )
}

const TwitterField: React.FC<{ label: string; value: string | null; isUrl?: boolean }> = ({ label, value, isUrl }) => {
  if (!value) return null

  return (
    <div className="flex items-start py-1 text-[11px] border-b border-border/30 last:border-b-0">
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
    <Section title="Twitter Card" icon={<XIcon className="h-3.5 w-3.5" />} defaultOpen={!!hasContent}>
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
