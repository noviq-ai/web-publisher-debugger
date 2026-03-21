import { useRef, useState } from 'react'
import type { AiContext, AiProvider } from '@/shared/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconArrowUp, IconChevronDown } from '@tabler/icons-react'
import ToolIcon from '@/components/assets/tool-icon'
import ChromeIcon from '@/components/assets/chrome'
import ClaudeIcon from '@/components/assets/claude'
import OpenaiIcon from '@/components/assets/openai'
import { cn } from '@/shared/lib/utils'
import type { ContextOption } from '@/pages'

const BYOK_LABELS: Record<'anthropic' | 'openai', string> = {
  anthropic: 'Claude',
  openai: 'GPT-4o',
}

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
  aiProvider: AiProvider
  onProviderChange: (provider: AiProvider) => void
  apiKey: string | null
  byokProvider: 'anthropic' | 'openai'
  browserAIAvailable: boolean
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
  aiProvider,
  onProviderChange,
  apiKey,
  byokProvider,
  browserAIAvailable,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [modelOpen, setModelOpen] = useState(false)

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

  const isBrowser = aiProvider === 'browser'
  const currentLabel = isBrowser ? 'Browser AI' : BYOK_LABELS[byokProvider]
  const byokDisabled = !apiKey
  const ByokIcon = byokProvider === 'anthropic' ? ClaudeIcon : OpenaiIcon

  return (
    <form onSubmit={onSubmit}>
      <div className="border rounded-lg bg-card shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col">
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
          <div className="flex items-center gap-1">
            <DropdownMenu open={contextOpen} onOpenChange={setContextOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ToolIcon />
                  <span className="text-xs">Tools: {activeContextCount}</span>
                  <IconChevronDown className={cn('transition-transform duration-200', contextOpen && 'rotate-180')} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  Data Access Permissions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {contextOptions.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.key}
                    checked={!!(context[option.key] && option.hasData)}
                    onCheckedChange={(checked) =>
                      setContext((prev) => ({ ...prev, [option.key]: checked }))
                    }
                    disabled={!option.hasData}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <option.icon className="h-4 w-4" />
                    <span>{option.label}</span>
                    {!option.hasData && (
                      <span className="text-[10px] text-muted-foreground ml-auto">(N/A)</span>
                    )}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Model selector */}
            <DropdownMenu open={modelOpen} onOpenChange={setModelOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isBrowser ? <ChromeIcon /> : <ByokIcon />}
                  <span className="text-xs">{currentLabel}</span>
                  <IconChevronDown className={cn('transition-transform duration-200', modelOpen && 'rotate-180')} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="start">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                  AI Model
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={aiProvider}
                  onValueChange={(value) => {
                    if (value === 'browser') {
                      onProviderChange('browser')
                    } else {
                      onProviderChange(byokProvider)
                    }
                  }}
                >
                  <DropdownMenuRadioItem
                    value="browser"
                    disabled={!browserAIAvailable}
                  >
                    <ChromeIcon className="size-3.5" />
                    <span>Browser AI</span>
                    {!browserAIAvailable && (
                      <span className="text-[10px] text-muted-foreground ml-auto">N/A</span>
                    )}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    value={byokProvider}
                    disabled={byokDisabled}
                  >
                    <ByokIcon className="size-3.5" />
                    <span>{BYOK_LABELS[byokProvider]}</span>
                    {byokDisabled && (
                      <span className="text-[10px] text-muted-foreground ml-auto">No key</span>
                    )}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
          >
            <IconArrowUp />
          </Button>
        </div>
      </div>
    </form>
  )
}
