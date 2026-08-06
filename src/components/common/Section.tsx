import React, { useId, useState } from 'react'
import { IconChevronDownMedium as IconChevronDown, IconChevronRightMedium as IconChevronRight } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"

interface SectionProps {
  title: string
  icon?: React.ReactNode
  count?: number
  badge?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

export const Section: React.FC<SectionProps> = ({ title, icon, count, badge, defaultOpen, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false)
  const contentId = useId()

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          {icon && (
            <span className="inline-flex size-4 items-center justify-center text-muted-foreground" aria-hidden="true">
              {icon}
            </span>
          )}
          <span>{title}</span>
          {count !== undefined && (
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {count}
            </span>
          )}
          {badge}
        </div>
        {isOpen ? (
          <IconChevronDown size={16} className="text-muted-foreground" aria-hidden="true" />
        ) : (
          <IconChevronRight size={16} className="text-muted-foreground" aria-hidden="true" />
        )}
      </button>
      {isOpen && <div id={contentId} className="px-3 pb-3">{children}</div>}
    </div>
  )
}

export const StatBox: React.FC<{
  label: string
  value: string | number
  highlight?: boolean
  variant?: 'default' | 'info' | 'success' | 'error' | 'warning'
}> = ({ label, value, highlight, variant = 'default' }) => {
  const bgClass = variant === 'error'
    ? 'bg-destructive/15'
    : variant === 'warning'
    ? 'bg-warning/15'
    : variant === 'info'
    ? 'bg-info/15'
    : variant === 'success' || highlight
    ? 'bg-success/15'
    : 'bg-muted/50'

  const textClass = variant === 'error'
    ? 'text-destructive'
    : variant === 'warning'
    ? 'text-warning'
    : variant === 'info'
    ? 'text-info'
    : variant === 'success' || highlight
    ? 'text-success'
    : ''

  return (
    <div className={`rounded-lg px-2 py-2 text-center ${bgClass}`}>
      <div className={`text-lg font-semibold ${textClass}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

export const ConfigRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border/30 py-1.5 last:border-b-0">
    <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
    <span className="min-w-0 text-right text-xs">{value}</span>
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
    <span className={`inline-flex items-center gap-1 text-xs ${isActive ? 'text-success' : 'text-muted-foreground'}`}>
      <span className={`size-1.5 rounded-full ${isActive ? 'bg-success' : 'bg-muted-foreground/50'}`} />
      {label || (isActive ? 'Active' : 'Inactive')}
    </span>
  )
}
