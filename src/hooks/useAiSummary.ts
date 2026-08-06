import { useCallback, useEffect, useRef, useState } from 'react'
import { getBrowserAISummaryAvailability } from '@/ai/browser-ai/shared'
import type { BrowserAIAvailability } from '@/ai/browser-ai/shared'

export type AiSummaryAvailability = 'checking' | BrowserAIAvailability
export type AiSummaryStatus = 'idle' | 'streaming' | 'complete' | 'error'

interface UseAiSummaryOptions {
  sourceKey: string | null
  streamSummary: (abortSignal: AbortSignal) => AsyncGenerator<string, void, void>
}

export function useAiSummary(options: UseAiSummaryOptions) {
  const abortControllerRef = useRef<AbortController | null>(null)
  const [availability, setAvailability] = useState<AiSummaryAvailability>('checking')
  const [status, setStatus] = useState<AiSummaryStatus>('idle')
  const [summary, setSummary] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true
    void getBrowserAISummaryAvailability().then((result) => {
      if (isActive) setAvailability(result)
    }).catch((availabilityError: Error) => {
      if (!isActive) return
      console.error('[Pubsight] Failed to check Browser AI availability:', availabilityError)
      setAvailability('unavailable')
    })
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setSummary('')
    setError(null)
    setStatus('idle')
  }, [options.sourceKey])

  useEffect(() => () => {
    abortControllerRef.current?.abort()
  }, [])

  const stop = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setStatus((currentStatus) => currentStatus === 'streaming' ? 'complete' : currentStatus)
  }, [])

  const close = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setSummary('')
    setError(null)
    setStatus('idle')
  }, [])

  const generate = useCallback(async () => {
    if (availability !== 'available') return

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller
    setSummary('')
    setError(null)
    setStatus('streaming')

    try {
      let receivedText = false
      for await (const textDelta of options.streamSummary(controller.signal)) {
        receivedText = receivedText || textDelta.length > 0
        setSummary((currentSummary) => currentSummary + textDelta)
      }
      if (!receivedText) {
        throw new Error('Browser AI completed without returning text')
      }
      setStatus('complete')
    } catch (generationError) {
      if (controller.signal.aborted) return
      const message = generationError instanceof Error ? generationError.message : String(generationError)
      setError(`AI summary generation failed: ${message}`)
      setStatus('error')
    } finally {
      if (abortControllerRef.current === controller) abortControllerRef.current = null
    }
  }, [availability, options.streamSummary])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(summary)
    } catch (copyError) {
      const message = copyError instanceof Error ? copyError.message : String(copyError)
      console.error(`[Pubsight] Failed to copy AI summary: ${message}`)
    }
  }, [summary])

  return { availability, status, summary, error, generate, stop, close, copy }
}
