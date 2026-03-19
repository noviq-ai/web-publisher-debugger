import { useRef, useEffect, useState, useCallback } from 'react'
import { IconArrowDown } from '@tabler/icons-react'
import { cn } from '@/shared/lib/utils'
import type { ChatMessage, ChatStatus } from './types'
import { Message } from './Message'
import { ThinkingMessage } from './ThinkingMessage'

interface MessagesProps {
  messages: ChatMessage[]
  status: ChatStatus
  emptyState?: React.ReactNode
}

export const Messages: React.FC<MessagesProps> = ({ messages, status, emptyState }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    endRef.current?.scrollIntoView({ behavior })
  }, [])

  // Check if at bottom
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const atBottom = scrollHeight - scrollTop - clientHeight < 100
      setIsAtBottom(atBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto-scroll when streaming
  useEffect(() => {
    if (isAtBottom && (status === 'streaming' || status === 'submitted')) {
      scrollToBottom('smooth')
    }
  }, [messages, status, isAtBottom, scrollToBottom])

  // Scroll to bottom on new message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'user') {
        scrollToBottom('smooth')
      }
    }
  }, [messages.length, scrollToBottom])

  const isLoading = status === 'streaming' || status === 'submitted'
  const showThinking = status === 'submitted' && messages[messages.length - 1]?.role === 'user'

  if (messages.length === 0 && emptyState) {
    return <div className="flex-1 flex flex-col">{emptyState}</div>
  }

  return (
    <div className="relative flex-1">
      <div
        className="absolute inset-0 touch-pan-y overflow-y-auto"
        ref={containerRef}
      >
        <div className="mx-auto flex min-w-0 max-w-3xl flex-col gap-4 px-4 py-4">
          {messages.map((message, index) => (
            <Message
              key={message.id}
              message={message}
              isLoading={isLoading && index === messages.length - 1 && message.role === 'assistant'}
            />
          ))}

          {showThinking && <ThinkingMessage />}

          <div className="min-h-[24px] min-w-[24px] shrink-0" ref={endRef} />
        </div>
      </div>

      <button
        aria-label="Scroll to bottom"
        className={cn(
          'absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border bg-background p-2 shadow-lg transition-all hover:bg-muted',
          isAtBottom
            ? 'pointer-events-none scale-0 opacity-0'
            : 'pointer-events-auto scale-100 opacity-100'
        )}
        onClick={() => scrollToBottom('smooth')}
        type="button"
      >
        <IconArrowDown size={16} />
      </button>
    </div>
  )
}
