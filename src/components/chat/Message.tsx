import { IconLoader2, IconDatabase, IconCircleCheck } from '@tabler/icons-react'
import { AnimatedMarkdown } from '@nvq/flowtoken'
import { cn } from '@/shared/lib/utils'
import type { ChatMessage, WeatherData } from './types'
import { isDataToolPart, getToolNameFromPartType, TOOL_LABELS } from './types'
import { Weather } from './Weather'

interface MessageProps {
  message: ChatMessage
  isLoading: boolean
}

export const Message: React.FC<MessageProps> = ({ message, isLoading }) => {
  const isUser = message.role === 'user'

  return (
    <div
      className="group/message w-full animate-in fade-in duration-200"
      data-role={message.role}
    >
      <div
        className={cn('flex w-full items-start gap-2 md:gap-3', {
          'justify-end': isUser,
          'justify-start': !isUser,
        })}
      >
        <div
          className={cn('flex flex-col gap-2', {
            'w-full': !isUser,
            'max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]': isUser,
          })}
        >
          {message.parts?.map((part, index) => {
            const key = `message-${message.id}-part-${index}`

            // Text part
            if (part.type === 'text') {
              const text = (part as { text: string }).text
              if (!text?.trim()) return null

              if (isUser) {
                return (
                  <div
                    key={key}
                    className="w-fit max-w-full rounded-2xl bg-primary px-3 py-2 text-primary-foreground ml-auto"
                  >
                    <div className="text-sm whitespace-pre-wrap break-words">{text}</div>
                  </div>
                )
              }

              return (
                <div
                  key={key}
                  className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-1 prose-pre:p-2 prose-pre:bg-background/50 prose-code:text-xs prose-h1:text-base prose-h2:text-sm prose-h3:text-sm md:prose-h1:text-lg md:prose-h2:text-base md:prose-h3:text-sm"
                >
                  <AnimatedMarkdown
                    content={text}
                    animation={isLoading ? 'fadeIn' : null}
                    animationDuration="0.5s"
                    animationTimingFunction="ease-out"
                    sep="word"
                  />
                </div>
              )
            }

            // Tool: getWeather
            if (part.type === 'tool-getWeather') {
              const { toolCallId, state, input, output } = part as {
                toolCallId: string
                state: string
                input?: { city?: string; latitude?: number; longitude?: number }
                output?: WeatherData
              }

              // Output available - show weather
              if (state === 'output-available' && output) {
                return (
                  <div key={toolCallId} className="w-[min(100%,450px)]">
                    <Weather weatherAtLocation={output} />
                  </div>
                )
              }

              // Tool is being called or waiting for result
              if (state === 'input-available' || state === 'streaming') {
                return (
                  <div
                    key={toolCallId}
                    className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                  >
                    <IconLoader2 size={16} className="animate-spin" />
                    <span>Getting weather{input?.city ? ` for ${input.city}` : ''}...</span>
                  </div>
                )
              }

              // Partial state - show input
              if (state === 'partial') {
                return (
                  <div
                    key={toolCallId}
                    className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
                  >
                    <IconLoader2 size={16} className="animate-spin" />
                    <span>Preparing weather request...</span>
                  </div>
                )
              }

              return null
            }

            // Data tools (getTrackingOverview, getGtmData, etc.)
            if (isDataToolPart(part.type)) {
              const toolName = getToolNameFromPartType(part.type)
              const label = toolName ? TOOL_LABELS[toolName] : 'Data'
              const { toolCallId, state } = part as {
                toolCallId: string
                state: string
              }

              // Output available - show completion indicator
              if (state === 'output-available') {
                return (
                  <div
                    key={toolCallId}
                    className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs text-green-600 dark:text-green-400"
                  >
                    <IconCircleCheck size={14} />
                    <span>Fetched {label}</span>
                  </div>
                )
              }

              // Tool is being called
              if (state === 'input-available' || state === 'streaming' || state === 'partial') {
                return (
                  <div
                    key={toolCallId}
                    className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    <IconDatabase size={14} className="animate-pulse" />
                    <span>Fetching {label}...</span>
                  </div>
                )
              }

              return null
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
