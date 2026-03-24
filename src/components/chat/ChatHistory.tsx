import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import {
  IconMessage,
  IconPlus,
  IconTrash,
  IconHistory,
  IconDots,
  IconPencil,
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import type { DBChat } from '@/db'

interface ChatHistoryProps {
  chats: DBChat[]
  currentChatId: string | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, title: string) => void
  trigger?: React.ReactNode
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  chats,
  currentChatId,
  isOpen,
  onOpenChange,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  trigger,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleStartEdit = (chat: DBChat) => {
    setEditingId(chat.id)
    setEditTitle(chat.title)
  }

  const handleSaveEdit = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const defaultTrigger = (
    <Button variant="ghost" size="icon">
      <IconHistory size={16} />
    </Button>
  )

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[280px] sm:max-w-[280px] p-0">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle>Chat History</SheetTitle>
          <SheetDescription className="sr-only">
            Past chat list
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={onNewChat}
          >
            <IconPlus size={16} />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <IconMessage size={32} className="mb-2 opacity-50" />
                <p className="text-sm">No history</p>
              </div>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      'group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent overflow-hidden',
                      currentChatId === chat.id && 'bg-accent'
                    )}
                  >
                    {editingId === chat.id ? (
                      <div className="flex flex-1 items-center gap-1 min-w-0">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-7 text-sm flex-1 min-w-0"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(chat.id)
                            if (e.key === 'Escape') handleCancelEdit()
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => handleSaveEdit(chat.id)}
                        >
                          <IconCheck size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={handleCancelEdit}
                        >
                          <IconX size={12} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <button
                          className="flex-1 min-w-0 text-left"
                          onClick={() => onSelectChat(chat.id)}
                        >
                          <p className="truncate font-medium">{chat.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatDistanceToNow(chat.updatedAt, {
                              addSuffix: true,
                              locale: enUS,
                            })}
                          </p>
                        </button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              <IconDots size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStartEdit(chat)}>
                              <IconPencil size={16} />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => onDeleteChat(chat.id)}
                            >
                              <IconTrash size={16} />
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
      </SheetContent>
    </Sheet>
  )
}
