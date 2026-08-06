import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import {
  IconChatBubble7 as IconMessage,
  IconTrashCanSimple as IconTrash,
  IconHistory,
  IconDotGrid1x3HorizontalTight as IconDots,
  IconPencil,
  IconCheckmark1 as IconCheck,
  IconCrossMedium,
  IconMagnifyingGlass as IconSearch,
} from '@central-icons-react/round-outlined-radius-2-stroke-1.5'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import type { DBChat } from '@/db'

const HISTORY_POPOVER_SIDE_OFFSET = 4

interface ChatHistoryProps {
  chats: DBChat[]
  currentChatId: string | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, title: string) => void
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  chats,
  currentChatId,
  isOpen,
  onOpenChange,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
}) => {
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const filteredChats = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) return chats
    return chats.filter((chat) => chat.title.toLocaleLowerCase().includes(normalizedQuery))
  }, [chats, query])

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) setQuery('')
  }

  const handleStartEdit = (chat: DBChat) => {
    setEditingId(chat.id)
    setEditTitle(chat.title)
  }

  const handleSaveEdit = (chatId: string) => {
    const normalizedTitle = editTitle.trim()
    if (normalizedTitle) onRenameChat(chatId, normalizedTitle)
    setEditingId(null)
    setEditTitle('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={(
          <Button variant="ghost" size="icon" aria-label="Chat history" title="Chat history">
            <IconHistory />
          </Button>
        )}
      />
      <PopoverContent
        align="end"
        sideOffset={HISTORY_POPOVER_SIDE_OFFSET}
        className="w-(--available-width) max-w-72 p-1"
      >
        <div className="relative pb-1.5">
          <IconSearch className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="h-7 rounded-md border-0 bg-transparent pl-7 pr-2 text-sm shadow-none focus-visible:ring-0"
            autoFocus
          />
        </div>

        <div className="max-h-72 overflow-y-auto border-t border-border/60 pt-1">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-3 py-8 text-center text-muted-foreground">
              <IconMessage className="mb-2 opacity-50" />
              <p className="text-sm">{chats.length === 0 ? 'No history' : 'No matching chats'}</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    'group flex min-w-0 items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent',
                    currentChatId === chat.id && 'bg-accent'
                  )}
                >
                  {editingId === chat.id ? (
                    <div className="flex min-w-0 flex-1 items-center gap-1">
                      <Input
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        className="h-7 min-w-0 flex-1 text-sm"
                        autoFocus
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') handleSaveEdit(chat.id)
                          if (event.key === 'Escape') handleCancelEdit()
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                        onClick={() => handleSaveEdit(chat.id)}
                        aria-label="Save chat title"
                      >
                        <IconCheck />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                        onClick={handleCancelEdit}
                        aria-label="Cancel renaming"
                      >
                        <IconCrossMedium />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => onSelectChat(chat.id)}
                      >
                        <p className="truncate font-medium leading-5">{chat.title}</p>
                        <p className="truncate text-xs leading-4 text-muted-foreground">
                          {formatDistanceToNow(chat.updatedAt, { addSuffix: true, locale: enUS })}
                        </p>
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                            aria-label={`Actions for ${chat.title}`}
                          >
                            <IconDots />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStartEdit(chat)}>
                            <IconPencil />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDeleteChat(chat.id)}
                          >
                            <IconTrash />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
