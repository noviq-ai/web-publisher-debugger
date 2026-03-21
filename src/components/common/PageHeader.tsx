import React, { useState } from 'react'
import { IconSettings, IconTool, IconHelpCircle, IconMessagePlus, IconGlobe, IconMenu2 } from '@tabler/icons-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import AppIcon from '@/components/assets/app-icon'
import { cn } from '@/shared/lib/utils'

type PageId = 'settings' | 'tools' | 'help' | 'feedback'

const navItems: { id: PageId; href: string; label: string; icon: React.ReactNode }[] = [
  { id: 'settings', href: 'options.html', label: 'Settings', icon: <IconSettings size={18} /> },
  { id: 'tools', href: 'tools.html', label: 'Tools', icon: <IconTool size={18} /> },
  { id: 'help', href: 'help.html', label: 'Help', icon: <IconHelpCircle size={18} /> },
  { id: 'feedback', href: 'feedback.html', label: 'Feedback', icon: <IconMessagePlus size={18} /> },
]

interface PageHeaderProps {
  activePage?: PageId
  lang?: string
  onLangChange?: (lang: string) => void
  actions?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  activePage,
  lang,
  onLangChange,
  actions,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false)

  const langSelector = onLangChange && lang && (
    <Select value={lang} onValueChange={onLangChange}>
      <SelectTrigger className="w-auto gap-1.5 h-8 text-sm">
        <IconGlobe size={14} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ja">日本語</SelectItem>
      </SelectContent>
    </Select>
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AppIcon className="h-6 w-6 shrink-0" />
          <h1 className="text-base font-semibold leading-tight">Web Publisher Debugger</h1>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {activePage && (
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-colors',
                    item.id === activePage
                      ? 'text-foreground font-medium bg-muted'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                  aria-current={item.id === activePage ? 'page' : undefined}
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </nav>
          )}
          {langSelector}
          {actions && <div>{actions}</div>}
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          {langSelector}
          {activePage && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <IconMenu2 size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <nav className="flex flex-col py-4">
                  {navItems.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-6 py-3 text-sm transition-colors',
                        item.id === activePage
                          ? 'text-foreground font-medium bg-muted'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      aria-current={item.id === activePage ? 'page' : undefined}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}
