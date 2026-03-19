import React from 'react'
import { IconAlertCircle, IconAlertTriangle, IconInfoCircle, IconCircleCheck } from '@tabler/icons-react'
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
        'flex items-start gap-2 py-1.5 px-2 rounded text-[11px]',
        issue.type === 'error' && 'bg-destructive/10',
        issue.type === 'warning' && 'bg-yellow-500/10',
        issue.type === 'info' && 'bg-muted/50'
      )}
    >
      <Icon
        size={14}
        className={cn(
          'shrink-0 mt-0.5',
          issue.type === 'error' && 'text-destructive',
          issue.type === 'warning' && 'text-yellow-600',
          issue.type === 'info' && 'text-muted-foreground'
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="leading-tight">{issue.message}</p>
        {issue.suggestion && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{issue.suggestion}</p>
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
        <span className="text-[10px] px-1.5 py-0.5 bg-destructive/20 text-destructive rounded">
          {errorCount}
        </span>
      )}
      {warningCount > 0 && (
        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 rounded">
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
        <div className="flex items-center gap-2 py-2 text-xs text-green-600">
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
