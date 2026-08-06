import { Streamdown } from 'streamdown'
import { BorderBeam } from 'border-beam'
import { Button } from '@/components/ui/button'
import { CHAT_MARKDOWN_CLASS, STREAMDOWN_ANIMATION, STREAMDOWN_PLUGINS } from '@/components/chat/MessageBubble'
import { cn } from '@/shared/lib/utils'
import type { AiSummaryAvailability, AiSummaryStatus } from '@/hooks/useAiSummary'
import { IconSparklesTwo2 as IconSparkles } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconSparklesTwo2'
import { IconStop } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconStop'
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconCrossMedium'
import { IconArrowRotateSparkle } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconArrowRotateSparkle'
import { IconSquareBehindSquare6 } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconSquareBehindSquare6'

interface AiSummaryButtonProps {
  availability: AiSummaryAvailability
  status: AiSummaryStatus
  onGenerate: () => void
  onStop: () => void
}

export const AiSummaryButton: React.FC<AiSummaryButtonProps> = ({
  availability,
  status,
  onGenerate,
  onStop,
}) => status === 'streaming' ? (
  <Button variant="outline" size="sm" onClick={onStop} className="gap-1.5 rounded-full">
    <IconStop className="[&_path]:fill-current [&_path]:stroke-none" />
    Stop
  </Button>
) : (
  <Button
    variant="outline"
    size="sm"
    onClick={onGenerate}
    disabled={availability !== 'available'}
    className="gap-1.5 rounded-full"
    title={availability === 'available'
      ? 'Generate an AI summary'
      : availability === 'available-after-download'
        ? 'Browser AI model download is required'
        : availability === 'checking'
          ? 'Checking Browser AI availability'
          : 'Browser AI is unavailable'}
  >
    <IconSparkles />
    AI Summary
  </Button>
)

interface AiSummaryCardProps {
  status: Exclude<AiSummaryStatus, 'idle'>
  summary: string
  error: string | null
  onCopy: () => void
  onRegenerate: () => void
  onClose: () => void
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({
  status,
  summary,
  error,
  onCopy,
  onRegenerate,
  onClose,
}) => (
  <section className="px-3 py-3">
    <BorderBeam
      size="pulse-inner"
      colorVariant="colorful"
      theme="auto"
      active={status === 'streaming'}
    >
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
          <span className="flex size-6 items-center justify-center rounded-lg bg-foreground text-background">
            <IconSparkles size={14} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-semibold">AI Summary</h2>
            <p className="text-[11px] text-muted-foreground">
              {status === 'streaming' ? 'Analyzing the collected implementation…' : 'Generated locally with Browser AI'}
            </p>
          </div>
          {status === 'complete' && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={onCopy} aria-label="Copy AI summary" title="Copy">
                <IconSquareBehindSquare6 />
              </Button>
              <Button variant="ghost" size="icon" onClick={onRegenerate} aria-label="Regenerate AI summary" title="Regenerate">
                <IconArrowRotateSparkle />
              </Button>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close AI summary">
            <IconCrossMedium />
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto px-3 py-3">
          {error ? (
            <p className="text-xs leading-relaxed text-destructive">{error}</p>
          ) : summary ? (
            <div className={cn(
              CHAT_MARKDOWN_CLASS,
              '!text-xs [&_*]:!text-xs [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-2',
            )}>
              <Streamdown animated={STREAMDOWN_ANIMATION} isAnimating={status === 'streaming'} plugins={STREAMDOWN_PLUGINS}>
                {summary}
              </Streamdown>
            </div>
          ) : (
            <div className="space-y-2" aria-label="Generating AI summary">
              <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-3/5 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
            </div>
          )}
        </div>
      </div>
    </BorderBeam>
  </section>
)
