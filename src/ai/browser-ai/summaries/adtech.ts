import type { PrebidData } from '@/shared/types/prebid'
import type { GptData } from '@/shared/types/gpt'
import { buildAdtechOverview } from '@/ai/tools/adtech-overview'
import { streamPageSummary } from './shared'

export function streamAdTechSummary(
  prebid: PrebidData | null,
  gpt: GptData | null,
  abortSignal: AbortSignal,
  preferredResponseLanguage: string | null,
): AsyncGenerator<string, void, void> {
  return streamPageSummary('AdTech', buildAdtechOverview(prebid, gpt), abortSignal, preferredResponseLanguage)
}
