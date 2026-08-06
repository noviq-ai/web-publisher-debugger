import type { AnalyticsData } from '@/shared/types/analytics'
import type { GtmData } from '@/shared/types/gtm'
import { streamPageSummary } from './shared'
import { countOccurrences } from '@/shared/lib/utils'

export function streamTrackingSummary(
  analytics: AnalyticsData | null,
  gtm: GtmData | null,
  abortSignal: AbortSignal,
  preferredResponseLanguage: string | null,
): AsyncGenerator<string, void, void> {
  const ga4 = analytics?.ga4
  const pixels = analytics?.pixels ?? []
  const payload = {
    googleAnalytics4: ga4?.detected ? {
      detected: true,
      measurementId: ga4.measurementId,
      eventCount: ga4.events.length,
      eventCounts: countOccurrences(ga4.events.map(({ name }) => name)),
      configTargets: ga4.configs.map(({ targetId }) => targetId),
      consent: ga4.consent,
    } : { detected: false },
    pixels: pixels.map(({ type, id, events }) => ({
      type,
      id,
      eventCount: events.length,
      eventCounts: countOccurrences(events.map(({ eventName }) => eventName)),
    })),
    googleTagManager: gtm?.detected ? {
      detected: true,
      containerId: gtm.containerId,
      containerVersion: gtm.containerVersion,
      dataLayerEventCount: gtm.dataLayerEvents.length,
      dataLayerEventCounts: countOccurrences(gtm.dataLayerEvents.map(({ event }) => event)),
      tags: gtm.tagsFired.map(({ name, type, firedCount }) => ({ name, type, firedCount })),
      variables: gtm.variables.map(({ name, type }) => ({ name, type })),
    } : { detected: false },
  }
  return streamPageSummary('tracking', payload, abortSignal, preferredResponseLanguage)
}
