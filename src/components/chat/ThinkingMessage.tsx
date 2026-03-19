import { IconSparkles } from '@tabler/icons-react'

export const ThinkingMessage: React.FC = () => {
  return (
    <div
      className="group/message w-full animate-in fade-in duration-300"
      data-role="assistant"
    >
      <div className="flex items-start justify-start gap-3">
        <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
          <div className="animate-pulse">
            <IconSparkles size={16} />
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-1 p-0 text-muted-foreground text-sm">
            <span className="animate-pulse">Thinking</span>
            <span className="inline-flex">
              <span className="animate-bounce [animation-delay:0ms]">.</span>
              <span className="animate-bounce [animation-delay:150ms]">.</span>
              <span className="animate-bounce [animation-delay:300ms]">.</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
