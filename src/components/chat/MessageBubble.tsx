import { Streamdown } from 'streamdown'
import { cjk } from '@streamdown/cjk'

export const CHAT_MARKDOWN_CLASS = 'min-w-0 max-w-full overflow-hidden break-words text-sm prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-1 prose-pre:max-w-full prose-pre:whitespace-pre-wrap prose-pre:break-words prose-pre:p-2 prose-pre:bg-background/50 prose-code:text-xs prose-h1:text-base prose-h2:text-sm prose-h3:text-sm md:prose-h1:text-lg md:prose-h2:text-base md:prose-h3:text-sm [&_a]:[overflow-wrap:anywhere] [&_code]:whitespace-pre-wrap [&_code]:[overflow-wrap:anywhere] [&_td]:break-words [&_th]:break-words [&_table]:w-full [&_table]:table-fixed'

export const STREAMDOWN_ANIMATION = {
  animation: 'blurIn',
  duration: 250,
  easing: 'ease-out',
  sep: 'word',
} as const

export const STREAMDOWN_PLUGINS = { cjk }

export interface UIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  parts: Array<{ type: string; text?: string }>
}

interface MessageBubbleProps {
  message: UIMessage
  isStreaming?: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user'

  const content = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg rounded-br-sm bg-muted p-2 px-4 text-foreground">
          <div className="text-sm whitespace-pre-wrap">{content}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className={CHAT_MARKDOWN_CLASS}>
        <Streamdown
          animated={STREAMDOWN_ANIMATION}
          isAnimating={isStreaming}
          plugins={STREAMDOWN_PLUGINS}
        >
          {content}
        </Streamdown>
      </div>
    </div>
  )
}
