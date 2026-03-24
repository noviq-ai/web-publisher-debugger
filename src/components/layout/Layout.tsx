import React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconMenu2,
  IconSearch,
  IconChartBar,
  IconChartLine,
  IconSettings,
  IconRefresh,
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconLayersSubtract,
} from '@tabler/icons-react'
import SparkleIcon from '@/components/assets/sparkle-icon'
import type { TabId } from '@/shared/types'
import type { DataCollectionStatus } from '@/store/tabDataStore'
import { useTheme } from '@/hooks/useTheme'

interface LayoutProps {
  children: React.ReactNode
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  status?: DataCollectionStatus
  onRefresh?: () => void
  headerActions?: React.ReactNode
}

const TAB_OPTIONS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'ai', label: 'AI Chat', icon: SparkleIcon },
  { id: 'seo', label: 'SEO', icon: IconSearch },
  { id: 'adtech', label: 'AdTech', icon: IconChartBar },
  { id: 'tracking', label: 'Tracking', icon: IconChartLine },
  { id: 'techstack', label: 'Tech Stack', icon: IconLayersSubtract },
]

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  status,
  onRefresh,
  headerActions,
}) => {
  const { theme, setTheme } = useTheme()

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    } else {
      // Dev mode: open options page in new tab
      window.open('/options.html', '_blank')
    }
  }

  const currentTab = TAB_OPTIONS.find((t) => t.id === activeTab)
  const CurrentIcon = currentTab?.icon || SparkleIcon

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="px-2 py-2 flex items-center justify-between shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <IconMenu2 className="h-4 w-4" />
              <CurrentIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{currentTab?.label}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {TAB_OPTIONS.map((tab) => (
              <DropdownMenuItem
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={activeTab === tab.id ? 'bg-accent' : ''}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {theme === 'dark' ? (
                  <IconMoon className="h-4 w-4" />
                ) : theme === 'light' ? (
                  <IconSun className="h-4 w-4" />
                ) : (
                  <IconDeviceDesktop className="h-4 w-4" />
                )}
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <IconSun className="h-4 w-4" />
                  Light
                  {theme === 'light' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <IconMoon className="h-4 w-4" />
                  Dark
                  {theme === 'dark' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <IconDeviceDesktop className="h-4 w-4" />
                  System
                  {theme === 'system' && <span className="ml-auto">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={openOptions}>
              <IconSettings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-1">
          {headerActions}
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={status === 'connecting' || status === 'loading'}
            >
              <IconRefresh
                className={`h-4 w-4 ${status === 'connecting' || status === 'loading' ? 'animate-spin' : ''}`}
              />
            </Button>
          )}
        </div>
      </header>
      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  )
}
