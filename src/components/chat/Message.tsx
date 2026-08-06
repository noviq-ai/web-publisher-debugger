import { useEffect, useState } from 'react'
import { IconChevronDownMedium as IconChevronDown } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconChevronDownMedium'
import { IconCircleCheck } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconCircleCheck'
import { IconLoader } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconLoader'
import { IconMagnifyingGlass as IconSearch } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconMagnifyingGlass'
import { IconExclamationTriangle } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconExclamationTriangle'
import { Streamdown } from 'streamdown'
import { cn } from '@/shared/lib/utils'
import type { ChatMessage, SessionCompactionActivity, WeatherData } from './types'
import { getToolNameFromPartType, TOOL_LABELS } from './types'
import { Weather } from './Weather'
import { CHAT_MARKDOWN_CLASS, STREAMDOWN_ANIMATION, STREAMDOWN_PLUGINS } from './MessageBubble'

interface MessageProps {
  message: ChatMessage
  isLoading: boolean
  durationSeconds?: number
}

interface ActivityItem {
  id: string
  label: string
  state: string
}

function getActivityItems(message: ChatMessage): ActivityItem[] {
  return message.parts.flatMap((part) => {
    if (!part.type.startsWith('tool-') || !('toolCallId' in part) || !('state' in part)) return []
    const toolName = getToolNameFromPartType(part.type)
    const label = toolName ? TOOL_LABELS[toolName] : part.type.replace(/^tool-/, '')
    return [{ id: part.toolCallId, label, state: part.state }]
  })
}

const WorkSummary: React.FC<{
  activities: ActivityItem[]
  durationSeconds: number
  isLoading: boolean
}> = ({ activities, durationSeconds, isLoading }) => {
  const [open, setOpen] = useState(isLoading)

  useEffect(() => {
    if (isLoading) setOpen(true)
  }, [isLoading])

  const hasActivities = activities.length > 0

  return (
    <div className={cn('border-b border-border/70', open && hasActivities ? 'pb-3' : 'pb-0')}>
      <button
        type="button"
        onClick={() => hasActivities && setOpen((currentOpen) => !currentOpen)}
        aria-expanded={hasActivities ? open : undefined}
        className={cn(
          'flex h-8 items-center gap-1.5 text-sm text-muted-foreground transition-colors',
          hasActivities && 'cursor-pointer hover:text-foreground'
        )}
      >
        <span>{isLoading ? `Working for ${durationSeconds}s` : `Worked for ${durationSeconds}s`}</span>
        {hasActivities && (
          <IconChevronDown size={16} className={cn('transition-transform duration-200', open && 'rotate-180')} />
        )}
      </button>

      {hasActivities && <div className="grid transition-[grid-template-rows] duration-200 ease-out" style={{ gridTemplateRows: open ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
          <div className="space-y-1.5 pt-1 text-sm text-muted-foreground">
            {activities.map((activity) => {
              const completed = activity.state === 'output-available'
              const failed = activity.state === 'output-error' || activity.state === 'output-denied'
              return (
                <div key={activity.id} className="flex min-h-7 items-center gap-2">
                  {completed ? (
                    <IconCircleCheck size={16} className="shrink-0 text-foreground/60" />
                  ) : (
                    <IconSearch size={16} className={cn('shrink-0', !failed && 'animate-pulse')} />
                  )}
                  <span>
                    {failed
                      ? `Failed to retrieve ${activity.label}`
                      : completed
                        ? `Checked ${activity.label}`
                        : `Checking ${activity.label}`}
                  </span>
                  {!completed && !failed && <IconLoader size={16} className="animate-spin" />}
                </div>
              )
            })}
          </div>
        </div>
      </div>}
    </div>
  )
}

const CompactionStatus: React.FC<{
  activity: SessionCompactionActivity
}> = ({ activity }) => {
  const { status, beforeTokens, afterTokens } = activity
  return (
    <div className="flex min-h-8 items-center gap-2 text-sm text-muted-foreground">
      {status === 'compacting' && <IconLoader size={16} className="shrink-0 animate-spin" />}
      {status === 'compacted' && <IconCircleCheck size={16} className="shrink-0 text-foreground/60" />}
      {status === 'failed' && <IconExclamationTriangle size={16} className="shrink-0 text-amber-600" />}
      <span>
        {status === 'compacting' && 'Compacting conversation context'}
        {status === 'compacted' && 'Conversation context compacted'}
        {status === 'failed' && 'Failed to compact conversation context'}
      </span>
      {status === 'compacted' && afterTokens !== undefined && (
        <span className="tabular-nums text-xs text-muted-foreground/80">
          {beforeTokens.toLocaleString()} → {afterTokens.toLocaleString()} tokens
        </span>
      )}
    </div>
  )
}

export const Message: React.FC<MessageProps> = ({ message, isLoading, durationSeconds }) => {
  const isUser = message.role === 'user'
  const activities = getActivityItems(message)
  const compactionParts = message.parts.filter((part) => part.type === 'data-compaction')

  return (
    <div className="group/message min-w-0 w-full overflow-hidden animate-in fade-in duration-200" data-role={message.role}>
      <div className={cn('flex w-full items-start gap-2 md:gap-3', { 'justify-end': isUser, 'justify-start': !isUser })}>
        <div className={cn('flex min-w-0 max-w-full flex-col gap-3', { 'w-full': !isUser, 'max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]': isUser })}>
          {!isUser && compactionParts.map((part) => (
            <CompactionStatus key={part.id ?? `${message.id}-compaction`} activity={part.data} />
          ))}

          {!isUser && durationSeconds !== undefined && (
            <WorkSummary activities={activities} durationSeconds={durationSeconds} isLoading={isLoading} />
          )}

          {message.parts?.map((part, index) => {
            const key = `message-${message.id}-part-${index}`

            if (part.type === 'text') {
              const text = part.text
              if (!text?.trim()) return null

              if (isUser) {
                return (
                  <div key={key} className="ml-auto w-fit max-w-full rounded-2xl bg-muted px-3 py-2 text-foreground">
                    <div className="text-sm whitespace-pre-wrap break-words">{text}</div>
                  </div>
                )
              }

              return (
                <div key={key} className={cn(CHAT_MARKDOWN_CLASS, 'prose-p:my-2 prose-p:leading-loose prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-pre:my-2')}>
                  <Streamdown animated={STREAMDOWN_ANIMATION} isAnimating={isLoading} plugins={STREAMDOWN_PLUGINS}>{text}</Streamdown>
                </div>
              )
            }

            if (part.type === 'data-compaction') {
              return null
            }

            if (part.type === 'tool-getWeather') {
              const { toolCallId, state, output } = part as {
                toolCallId: string
                state: string
                output?: WeatherData
              }

              if (state === 'output-available' && output) {
                return (
                  <div key={toolCallId} className="w-[min(100%,450px)]">
                    <Weather weatherAtLocation={output} />
                  </div>
                )
              }
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
