import type { SeoData } from '@/shared/types/seo'
import { streamPageSummary } from './shared'

export function streamSeoSummary(
  data: SeoData,
  abortSignal: AbortSignal,
  preferredResponseLanguage: string | null,
): AsyncGenerator<string, void, void> {
  const headingCounts = Object.fromEntries(
    Object.entries(data.headings).map(([level, headings]) => [level, headings.length]),
  )
  return streamPageSummary('SEO', {
    url: data.url,
    title: data.title,
    description: data.description,
    canonical: data.canonical,
    robots: data.robots,
    viewport: data.viewport,
    openGraph: data.ogp,
    twitterCard: data.twitter,
    structuredData: data.jsonLd.map(({ type, isValid, errors }) => ({ type, isValid, errors })),
    hreflangCount: data.hreflang.length,
    headingCounts,
    links: data.links,
    issues: data.issues,
  }, abortSignal, preferredResponseLanguage)
}
