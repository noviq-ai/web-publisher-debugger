import { useRef } from 'react'
import type { AiContext } from '@/shared/types'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { IconSend, IconPlug, IconChevronDown } from '@tabler/icons-react'
import type { ContextOption } from '@/pages'

interface ChatInputProps {
  inputValue: string
  setInputValue: (value: string) => void
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
  contextOpen: boolean
  setContextOpen: (open: boolean) => void
  context: AiContext
  setContext: React.Dispatch<React.SetStateAction<AiContext>>
  contextOptions: ContextOption[]
  activeContextCount: number
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  isLoading,
  onSubmit,
  contextOpen,
  setContextOpen,
  context,
  setContext,
  contextOptions,
  activeContextCount,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME入力中（日本語変換中など）はEnterで送信しない
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      onSubmit(e)
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="border rounded-lg bg-background flex flex-col">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your page data..."
          disabled={isLoading}
          rows={1}
          className="w-full resize-none bg-transparent px-6 py-4 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />

        <div className="flex items-center justify-between px-2 pb-2">
          <Popover open={contextOpen} onOpenChange={setContextOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                <IconPlug size={12} />
                Tools: {activeContextCount}
                <IconChevronDown size={12} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="start">
              <div className="text-xs font-medium text-muted-foreground mb-3">
                Data Access Permissions
              </div>
              <div className="space-y-3">
                {contextOptions.map((option) => (
                  <div
                    key={option.key}
                    className={`flex items-center justify-between ${
                      !option.hasData ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <span className="text-sm">{option.label}</span>
                      {!option.hasData && (
                        <span className="text-[10px] text-muted-foreground">(N/A)</span>
                      )}
                    </div>
                    <Switch
                      checked={!!(context[option.key] && option.hasData)}
                      onCheckedChange={(checked) =>
                        setContext((prev) => ({ ...prev, [option.key]: checked }))
                      }
                      disabled={!option.hasData}
                    />
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
          >
            <IconSend size={28} />
          </Button>
        </div>
      </div>
    </form>
  )
}
