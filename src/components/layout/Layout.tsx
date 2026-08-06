import React, { createContext, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
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
import { IconListBullets as IconMenu2 } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconListBullets'
import { IconMagnifyingGlass as IconSearch } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconMagnifyingGlass'
import { IconChart7 as IconChartBar } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconChart7'
import { IconChart1 as IconChartLine } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconChart1'
import { IconSettingsGear2 as IconSettings } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconSettingsGear2'
import { IconArrowRotateLeftRight as IconRefresh } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconArrowRotateLeftRight'
import { IconSunHigh as IconSun } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconSunHigh'
import { IconMoon } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconMoon'
import { IconTelevision as IconDeviceDesktop } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconTelevision'
import { IconColorPalette } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconColorPalette'
import { IconLayersThree as IconLayersSubtract } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconLayersThree'
import { IconFileText } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconFileText'
import { IconSparklesTwo2 as SparkleIcon } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconSparklesTwo2'
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

const HeaderActionsOutletContext = createContext<HTMLElement | null>(null)

export const HeaderActionsPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const outlet = useContext(HeaderActionsOutletContext)
  return outlet ? createPortal(children, outlet) : null
}

const TAB_OPTIONS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'ai', label: 'Assistant', icon: SparkleIcon },
  { id: 'seo', label: 'SEO', icon: IconSearch },
  { id: 'adtech', label: 'AdTech', icon: IconChartBar },
  { id: 'ads-txt', label: 'Ads.txt', icon: IconFileText },
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
  const [headerActionsOutlet, setHeaderActionsOutlet] = useState<HTMLDivElement | null>(null)

  const openOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    } else {
      // Dev mode: open options page in new tab
      window.open('/options.html', '_blank')
    }
  }

  const currentTab = TAB_OPTIONS.find((t) => t.id === activeTab)

  return (
    <HeaderActionsOutletContext.Provider value={headerActionsOutlet}>
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-border/60 bg-background px-2.5 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 rounded-lg px-2.5">
              <IconMenu2 className="h-4 w-4" />
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
                <IconColorPalette className="h-4 w-4" />
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
          <div ref={setHeaderActionsOutlet} className="flex items-center gap-1" />
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
    </HeaderActionsOutletContext.Provider>
  )
}
