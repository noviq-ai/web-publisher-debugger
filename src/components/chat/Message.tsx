import { useState } from 'react'
import { IconLoader2, IconDatabase, IconCircleCheckFilled, IconChevronDown } from '@tabler/icons-react'
import { AnimatedMarkdown } from '@nvq/flowtoken'
import { cn } from '@/shared/lib/utils'
import type { ChatMessage, WeatherData } from './types'
import { isDataToolPart, getToolNameFromPartType, TOOL_LABELS } from './types'
import { Weather } from './Weather'

interface MessageProps {
  message: ChatMessage
  isLoading: boolean
}

/** Collapsible panel using CSS grid for smooth height animation without DOM removal */
const ToolDetail: React.FC<{
  label: string
  input?: unknown
  output?: unknown
}> = ({ label, input, output }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-green-500/30 bg-card text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full px-3 py-1.5 text-green-600 dark:text-green-400 cursor-pointer"
      >
        <IconCircleCheckFilled size={14} />
        <span className="flex-1 text-left">Fetched {label}</span>
        <IconChevronDown
          size={12}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-green-500/20 px-3 py-2 space-y-2 text-foreground">
            {input !== undefined && (
              <div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Input</div>
                <pre className="text-[11px] leading-relaxed bg-background/60 rounded p-2 overflow-x-auto max-h-40 overflow-y-auto">
                  {JSON.stringify(input, null, 2)}
                </pre>
              </div>
            )}
            {output !== undefined && (
              <div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Output</div>
                <pre className="text-[11px] leading-relaxed bg-background/60 rounded p-2 overflow-x-auto max-h-60 overflow-y-auto">
                  {JSON.stringify(output, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
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
                  className="text-sm prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-p:leading-loose prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:my-2 prose-pre:p-2 prose-pre:bg-background/50 prose-code:text-xs prose-h1:text-base prose-h2:text-sm prose-h3:text-sm md:prose-h1:text-lg md:prose-h2:text-base md:prose-h3:text-sm"
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
              const { toolCallId, state, input, output } = part as {
                toolCallId: string
                state: string
                input?: unknown
                output?: unknown
              }

              // Output available - show expandable detail
              if (state === 'output-available') {
                return (
                  <ToolDetail
                    key={toolCallId}
                    label={label}
                    input={input}
                    output={output}
                  />
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
