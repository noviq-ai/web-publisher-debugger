import type { TechStackData } from '@/shared/types/techstack'
import { streamPageSummary } from './shared'

export function streamTechStackSummary(
  data: TechStackData,
  abortSignal: AbortSignal,
  preferredResponseLanguage: string | null,
): AsyncGenerator<string, void, void> {
  return streamPageSummary('technology stack', data, abortSignal, preferredResponseLanguage)
}
