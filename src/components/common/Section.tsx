import React, { useState } from 'react'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'

interface SectionProps {
  title: string
  icon?: React.ReactNode
  count?: number
  badge?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

export const Section: React.FC<SectionProps> = ({ title, icon, count, badge, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span>{title}</span>
          {count !== undefined && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {count}
            </span>
          )}
          {badge}
        </div>
        {isOpen ? (
          <IconChevronDown size={16} className="text-muted-foreground" />
        ) : (
          <IconChevronRight size={16} className="text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  )
}

export const StatBox: React.FC<{
  label: string
  value: string | number
  highlight?: boolean
  variant?: 'default' | 'success' | 'error' | 'warning'
}> = ({ label, value, highlight, variant = 'default' }) => {
  const bgClass = variant === 'error'
    ? 'bg-red-500/10'
    : variant === 'warning'
    ? 'bg-yellow-500/10'
    : variant === 'success' || highlight
    ? 'bg-green-500/10'
    : 'bg-muted/50'

  const textClass = variant === 'error'
    ? 'text-red-600 dark:text-red-400'
    : variant === 'warning'
    ? 'text-yellow-600 dark:text-yellow-400'
    : variant === 'success' || highlight
    ? 'text-green-600 dark:text-green-400'
    : ''

  return (
    <div className={`text-center py-2 px-3 rounded ${bgClass}`}>
      <div className={`text-lg font-semibold ${textClass}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  )
}

export const ConfigRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-b-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs">{value}</span>
  </div>
)

export const StatusIndicator: React.FC<{
  active?: boolean
  enabled?: boolean
  detected?: boolean
  label?: string
}> = ({ active, enabled, detected, label }) => {
  const isActive = active ?? enabled ?? detected ?? false
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${isActive ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
      {label || (isActive ? 'Active' : 'Inactive')}
    </span>
  )
}
