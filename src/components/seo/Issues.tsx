import React from 'react'
import { IconExclamationCircle as IconAlertCircle, IconExclamationTriangle as IconAlertTriangle, IconCircleInfo as IconInfoCircle, IconCircleCheck } from "@central-icons-react/round-outlined-radius-2-stroke-1.5"
import { cn } from '@/shared/lib/utils'
import type { SeoIssue } from '@/shared/types/seo'
import { Section } from '@/components/common'

interface IssuesProps {
  issues: SeoIssue[]
}

const IssueItem: React.FC<{ issue: SeoIssue }> = ({ issue }) => {
  const Icon = issue.type === 'error' ? IconAlertCircle : issue.type === 'warning' ? IconAlertTriangle : IconInfoCircle

  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border border-border/60 px-2.5 py-2 text-xs',
        issue.type === 'error' && 'bg-destructive/15',
        issue.type === 'warning' && 'bg-warning/15',
        issue.type === 'info' && 'bg-info/15'
      )}
    >
      <span className="flex h-4 shrink-0 items-center" aria-hidden="true">
        <Icon
          size={14}
          className={cn(
            issue.type === 'error' && 'text-destructive',
            issue.type === 'warning' && 'text-warning',
            issue.type === 'info' && 'text-info'
          )}
        />
      </span>
      <div className="flex-1 min-w-0">
        <p className="leading-tight">{issue.message}</p>
        {issue.suggestion && (
          <p className="mt-1 text-xs leading-4 text-muted-foreground">{issue.suggestion}</p>
        )}
      </div>
    </div>
  )
}

export const Issues: React.FC<IssuesProps> = ({ issues }) => {
  const errorCount = issues.filter((i) => i.type === 'error').length
  const warningCount = issues.filter((i) => i.type === 'warning').length

  const badge = issues.length > 0 ? (
    <div className="flex items-center gap-1">
      {errorCount > 0 && (
        <span className="rounded-full bg-destructive/20 px-1.5 py-0.5 text-xs text-destructive">
          {errorCount}
        </span>
      )}
      {warningCount > 0 && (
        <span className="rounded-full bg-warning/20 px-1.5 py-0.5 text-xs text-warning">
          {warningCount}
        </span>
      )}
    </div>
  ) : null

  return (
    <Section
      title="Issues"
      icon={<IconAlertCircle size={14} />}
      badge={badge}
      defaultOpen={issues.length > 0}
    >
      {issues.length === 0 ? (
        <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
          <IconCircleCheck size={14} />
          No issues found
        </div>
      ) : (
        <div className="space-y-1">
          {issues
            .filter((i) => i.type === 'error')
            .map((issue, idx) => (
              <IssueItem key={`error-${idx}`} issue={issue} />
            ))}
          {issues
            .filter((i) => i.type === 'warning')
            .map((issue, idx) => (
              <IssueItem key={`warning-${idx}`} issue={issue} />
            ))}
          {issues
            .filter((i) => i.type === 'info')
            .map((issue, idx) => (
              <IssueItem key={`info-${idx}`} issue={issue} />
            ))}
        </div>
      )}
    </Section>
  )
}
