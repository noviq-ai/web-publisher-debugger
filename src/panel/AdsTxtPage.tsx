import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { IconExclamationTriangle as IconAlertTriangle } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconExclamationTriangle'
import { IconCircleCheck as IconCircleCheck } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconCircleCheck'
import { IconChevronDownMedium as IconChevronDown } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconChevronDownMedium'
import { IconArrowOutOfBox as IconExternalLink } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconArrowOutOfBox'
import { IconFileText } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconFileText'
import { IconArrowRotateLeftRight as IconRefresh } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconArrowRotateLeftRight'
import { IconMagnifyingGlass as IconSearch } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconMagnifyingGlass'
import { IconCrossMedium } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconCrossMedium'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { StatBox } from '@/components/common'
import { AiSummaryButton, AiSummaryCard } from '@/components/ai-summary'
import { useAiSummary } from '@/hooks/useAiSummary'
import { resolvePreferredResponseLanguage } from '@/ai/browser-ai/shared'
import { streamAdsTxtSummary } from '@/ai/browser-ai/summaries/ads-txt'

type SellerRelationship = 'DIRECT' | 'RESELLER'
type CheckStatus = 'loading' | 'success' | 'error'
type IssueSeverity = 'error' | 'warning'

interface SellerRecord {
  lineNumber: number
  advertisingSystemDomain: string
  publisherAccountId: string
  relationship: SellerRelationship
  certificationAuthorityId: string | null
}

interface VariableRecord {
  lineNumber: number
  name: string
  value: string
}

interface AdsTxtIssue {
  lineNumber: number | null
  severity: IssueSeverity
  message: string
}

interface ParsedAdsTxt {
  sellers: SellerRecord[]
  variables: VariableRecord[]
  issues: AdsTxtIssue[]
}

interface AdsTxtResult extends ParsedAdsTxt {
  requestedUrl: string
  finalUrl: string
  contentType: string
  statusCode: number
}

interface CheckState {
  status: CheckStatus
  result: AdsTxtResult | null
  error: string | null
}

const KNOWN_VARIABLES = new Set([
  'CONTACT',
  'INVENTORYDOMAIN',
  'INVENTORYPARTNERDOMAIN',
  'MANAGERDOMAIN',
  'OWNERDOMAIN',
  'SUBDOMAIN',
])

const INITIAL_STATE: CheckState = {
  status: 'loading',
  result: null,
  error: null,
}

function stripComment(line: string): string {
  return line.split('#', 1)[0].trim()
}

function parseVariable(line: string, lineNumber: number): VariableRecord | null {
  const equalsIndex = line.indexOf('=')
  if (equalsIndex < 1) return null

  const name = line.slice(0, equalsIndex).trim().toUpperCase()
  const value = line.slice(equalsIndex + 1).trim()
  if (!name || !value) return null

  return { lineNumber, name, value }
}

function parseSellerRecord(fields: string[], lineNumber: number): SellerRecord | null {
  if (fields.length !== 3 && fields.length !== 4) return null

  const [advertisingSystemDomain, publisherAccountId, relationshipValue, certificationAuthorityId] = fields
  const relationship = relationshipValue.toUpperCase()
  if (!advertisingSystemDomain || !publisherAccountId) return null
  if (relationship !== 'DIRECT' && relationship !== 'RESELLER') return null

  return {
    lineNumber,
    advertisingSystemDomain: advertisingSystemDomain.toLowerCase(),
    publisherAccountId,
    relationship,
    certificationAuthorityId: certificationAuthorityId || null,
  }
}

function sellerKey(record: SellerRecord): string {
  return [
    record.advertisingSystemDomain,
    record.publisherAccountId,
    record.relationship,
    record.certificationAuthorityId ?? '',
  ].join('|')
}

function parseAdsTxt(source: string): ParsedAdsTxt {
  const sellers: SellerRecord[] = []
  const variables: VariableRecord[] = []
  const issues: AdsTxtIssue[] = []
  const seenSellers = new Map<string, number>()

  source.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1
    const line = stripComment(rawLine)
    if (!line) return

    const variable = parseVariable(line, lineNumber)
    if (variable) {
      variables.push(variable)
      if (!KNOWN_VARIABLES.has(variable.name)) {
        issues.push({
          lineNumber,
          severity: 'warning',
          message: `Unknown variable: ${variable.name}.`,
        })
      }
      return
    }

    const fields = line.split(',').map((field) => field.trim())
    const seller = parseSellerRecord(fields, lineNumber)
    if (!seller) {
      issues.push({
        lineNumber,
        severity: 'error',
        message: 'Seller records must use: domain, publisher account ID, DIRECT or RESELLER, certification authority ID (optional).',
      })
      return
    }

    const key = sellerKey(seller)
    const firstLine = seenSellers.get(key)
    if (firstLine !== undefined) {
      issues.push({
        lineNumber,
        severity: 'warning',
        message: `Duplicate of the seller record on line ${firstLine}.`,
      })
    } else {
      seenSellers.set(key, lineNumber)
    }
    sellers.push(seller)
  })

  if (sellers.length === 0) {
    issues.push({
      lineNumber: null,
      severity: 'warning',
      message: 'No valid seller records were found.',
    })
  }

  return { sellers, variables, issues }
}

async function getCurrentPageUrl(): Promise<string> {
  if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const url = tabs[0]?.url
    if (!url) throw new Error('Could not get the active tab URL.')
    return url
  }
  return window.location.href
}

function buildAdsTxtUrl(pageUrl: string): string {
  const url = new URL(pageUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Only HTTP and HTTPS pages can be checked. Current URL: ${pageUrl}`)
  }
  return new URL('/ads.txt', url.origin).href
}

async function fetchAdsTxt(pageUrl: string): Promise<AdsTxtResult> {
  const requestedUrl = buildAdsTxtUrl(pageUrl)
  const response = await fetch(requestedUrl, {
    method: 'GET',
    cache: 'no-store',
    redirect: 'follow',
  })

  if (!response.ok) {
    const responseBody = (await response.text()).slice(0, 300)
    throw new Error(
      `Failed to fetch ads.txt. URL: ${requestedUrl} / HTTP ${response.status} ${response.statusText} / Response: ${responseBody || '(empty)'}`,
    )
  }

  const source = await response.text()
  const parsed = parseAdsTxt(source)
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().startsWith('text/plain')) {
    parsed.issues.unshift({
      lineNumber: null,
      severity: 'warning',
      message: `Content-Type is not text/plain: ${contentType || '(not specified)'}`,
    })
  }

  return {
    ...parsed,
    requestedUrl,
    finalUrl: response.url,
    contentType,
    statusCode: response.status,
  }
}

function StatusSummary({ result, action }: { result: AdsTxtResult; action: React.ReactNode }) {
  const errorCount = result.issues.filter((issue) => issue.severity === 'error').length
  const warningCount = result.issues.filter((issue) => issue.severity === 'warning').length
  const directCount = result.sellers.filter((seller) => seller.relationship === 'DIRECT').length
  const isValid = errorCount === 0 && result.sellers.length > 0

  return (
    <div className="border-b border-border/50 p-3">
      <div className="mb-3 flex items-start gap-2">
        <span className={`inline-flex size-7 shrink-0 items-center justify-center rounded-lg ${isValid ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
          {isValid ? <IconCircleCheck size={16} /> : <IconAlertTriangle size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{isValid ? 'ads.txt is published correctly' : 'The ads.txt implementation needs attention'}</div>
          <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {isValid ? 'Fetch and syntax checks completed.' : `Found ${errorCount} errors and ${warningCount} warnings.`}
          </div>
          <a className="mt-1 flex items-center gap-1 rounded text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40" href={result.finalUrl} target="_blank" rel="noreferrer">
            <span className="truncate">{result.finalUrl}</span>
            <IconExternalLink size={12} className="shrink-0" />
          </a>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="outline" className="rounded-full font-mono">HTTP {result.statusCode}</Badge>
          {action}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Sellers" value={result.sellers.length} variant="info" />
        <StatBox label="DIRECT" value={directCount} variant={directCount > 0 ? 'success' : 'default'} />
        <StatBox label="Errors" value={errorCount} variant={errorCount > 0 ? 'error' : 'default'} />
        <StatBox label="Warnings" value={warningCount} variant={warningCount > 0 ? 'warning' : 'default'} />
      </div>
    </div>
  )
}

interface HealthCheckItem {
  label: string
  detail: string
  status: 'pass' | 'fail' | 'warning'
}

function HealthChecks({ result }: { result: AdsTxtResult }) {
  const syntaxErrorCount = result.issues.filter((issue) => issue.severity === 'error').length
  const duplicateCount = result.issues.filter((issue) => issue.message.startsWith('Duplicate of the seller record')).length
  const hasOwnerDomain = result.variables.some((variable) => variable.name === 'OWNERDOMAIN')
  const hasPlainTextContentType = result.contentType.toLowerCase().startsWith('text/plain')
  const checks: HealthCheckItem[] = [
    { label: 'Availability', detail: `Available over HTTP ${result.statusCode}`, status: 'pass' },
    {
      label: 'File format',
      detail: hasPlainTextContentType ? 'Served as text/plain' : `Content-Type: ${result.contentType || 'not specified'}`,
      status: hasPlainTextContentType ? 'pass' : 'warning',
    },
    {
      label: 'Syntax',
      detail: syntaxErrorCount === 0 ? 'All lines can be parsed' : `${syntaxErrorCount} invalid lines`,
      status: syntaxErrorCount === 0 ? 'pass' : 'fail',
    },
    {
      label: 'Duplicates',
      detail: duplicateCount === 0 ? 'No duplicates' : `${duplicateCount} records can be cleaned up`,
      status: duplicateCount === 0 ? 'pass' : 'warning',
    },
    {
      label: 'OWNERDOMAIN',
      detail: hasOwnerDomain ? 'Site owner declared' : 'Ads.txt 1.1 owner information is missing',
      status: hasOwnerDomain ? 'pass' : 'warning',
    },
  ]

  return (
    <section className="border-b border-border/50 px-3 py-3">
      <div className="mb-2">
        <h2 className="text-sm font-semibold">Implementation checks</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Availability and specification compliance for publishers.</p>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 border-b px-3 py-2.5 last:border-b-0">
            <span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${check.status === 'pass' ? 'bg-success/15 text-success' : check.status === 'fail' ? 'bg-destructive/15 text-destructive' : 'bg-warning/15 text-warning'}`}>
              {check.status === 'pass' ? <IconCircleCheck size={14} /> : check.status === 'fail' ? <IconCrossMedium size={14} /> : <IconAlertTriangle size={14} />}
            </span>
            <span className="w-28 shrink-0 text-xs font-medium">{check.label}</span>
            <span className="min-w-0 flex-1 text-right text-xs text-muted-foreground">{check.detail}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Issues({ issues }: { issues: AdsTxtIssue[] }) {
  const [showWarnings, setShowWarnings] = useState(false)
  if (issues.length === 0) return null
  const errors = issues.filter((issue) => issue.severity === 'error')
  const warnings = issues.filter((issue) => issue.severity === 'warning')

  return (
    <section className="border-b border-border/50 px-3 py-3">
      <div className="mb-2">
        <h2 className="text-sm font-semibold">Fix first</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Review items that affect revenue opportunities and seller authorization first.</p>
      </div>
      <div className="space-y-2">
        {errors.map((issue, index) => (
          <div key={`${issue.lineNumber ?? 'file'}-${index}`} className="flex gap-2 rounded-lg border border-destructive/25 bg-destructive/10 px-2.5 py-2 text-xs">
            {issue.severity === 'error'
              ? <IconCrossMedium size={14} className="mt-0.5 shrink-0 text-destructive" />
              : <IconAlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />}
            <div><span className="font-mono text-muted-foreground">{issue.lineNumber === null ? 'FILE' : `L${issue.lineNumber}`}</span> <span>{issue.message}</span></div>
          </div>
        ))}
        {warnings.length > 0 && (
          <Collapsible open={showWarnings} onOpenChange={setShowWarnings}>
            <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-lg border border-warning/25 bg-warning/10 px-2.5 py-2 text-left text-xs hover:bg-warning/15 focus-visible:ring-2 focus-visible:ring-ring/40">
              <IconAlertTriangle size={14} className="shrink-0 text-warning" />
              <span className="flex-1"><strong>{warnings.length} warnings</strong>, primarily duplicate seller records.</span>
              <IconChevronDown size={14} className="shrink-0 text-muted-foreground transition-transform group-data-open:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1.5">
              {warnings.map((issue, index) => (
                <div key={`${issue.lineNumber ?? 'file'}-warning-${index}`} className="flex gap-2 rounded-lg bg-muted/50 px-2.5 py-2 text-xs">
                  <span className="shrink-0 font-mono text-muted-foreground">{issue.lineNumber === null ? 'FILE' : `L${issue.lineNumber}`}</span>
                  <span>{issue.message}</span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </section>
  )
}

function SellerRecords({ sellers }: { sellers: SellerRecord[] }) {
  const [query, setQuery] = useState('')
  const [relationship, setRelationship] = useState<SellerRelationship | 'ALL'>('ALL')
  const [showAll, setShowAll] = useState(false)
  if (sellers.length === 0) return null

  const normalizedQuery = query.trim().toLowerCase()
  const filteredSellers = sellers.filter((seller) => {
    const matchesRelationship = relationship === 'ALL' || seller.relationship === relationship
    const matchesQuery = !normalizedQuery
      || seller.advertisingSystemDomain.includes(normalizedQuery)
      || seller.publisherAccountId.toLowerCase().includes(normalizedQuery)
    return matchesRelationship && matchesQuery
  })
  const visibleSellers = showAll ? filteredSellers : filteredSellers.slice(0, 8)
  const hiddenCount = filteredSellers.length - visibleSellers.length

  const directCount = sellers.filter((seller) => seller.relationship === 'DIRECT').length
  const resellerCount = sellers.length - directCount

  return (
    <Collapsible>
      <section className="border-b border-border/50">
        <CollapsibleTrigger className="group flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Seller record details</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{directCount} DIRECT · {resellerCount} RESELLER</p>
          </div>
          <IconChevronDown size={16} className="shrink-0 text-muted-foreground transition-transform group-data-open:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3 pt-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Filter by domain or account ID</p>
        <span className="font-mono text-xs text-muted-foreground">{filteredSellers.length}/{sellers.length}</span>
      </div>
      <div className="mb-2 space-y-2">
        <div className="relative">
          <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            name="seller-record-filter"
            aria-label="Search seller records"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value)
              setShowAll(false)
            }}
            placeholder="Search by domain or account ID…"
            className="h-[var(--control-height-compact)] rounded-lg pl-8 text-xs"
          />
        </div>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
          {(['ALL', 'DIRECT', 'RESELLER'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setRelationship(option)
                setShowAll(false)
              }}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 ${relationship === option ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        {visibleSellers.map((seller) => (
          <div key={`${seller.lineNumber}-${sellerKey(seller)}`} className="grid grid-cols-[1fr_auto] gap-x-3 border-b px-3 py-2.5 last:border-b-0">
            <div className="min-w-0">
              <div className="truncate font-mono text-xs font-semibold">{seller.advertisingSystemDomain}</div>
              <div className="mt-1 truncate font-mono text-xs text-muted-foreground">{seller.publisherAccountId}</div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className={`rounded-full ${seller.relationship === 'DIRECT' ? 'border-success/30 text-success' : ''}`}>{seller.relationship}</Badge>
              <div className="mt-1 font-mono text-xs text-muted-foreground">L{seller.lineNumber}{seller.certificationAuthorityId ? ` · ${seller.certificationAuthorityId}` : ''}</div>
            </div>
          </div>
        ))}
        {visibleSellers.length === 0 && (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">No matching records</div>
        )}
      </div>
      {hiddenCount > 0 && (
        <Button variant="ghost" size="sm" onClick={() => setShowAll(true)} className="mt-2 w-full text-muted-foreground">
          Show {hiddenCount} more
        </Button>
      )}
      {showAll && filteredSellers.length > 8 && (
        <Button variant="ghost" size="sm" onClick={() => setShowAll(false)} className="mt-2 w-full text-muted-foreground">
          Collapse
        </Button>
      )}
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}

function TechnicalDetails({ result }: { result: AdsTxtResult }) {
  return (
    <Collapsible>
      <div className="border-b border-border/50">
        <CollapsibleTrigger className="group flex w-full items-center justify-between px-3 py-2.5 text-left text-xs font-medium hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40">
          Technical details
          <IconChevronDown size={14} className="text-muted-foreground transition-transform group-data-open:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 px-3 pb-3">
          <dl className="space-y-1.5 rounded-lg bg-muted/50 p-2.5 text-xs">
            <div className="flex gap-3"><dt className="w-24 shrink-0 text-muted-foreground">Requested URL</dt><dd className="min-w-0 break-all font-mono">{result.requestedUrl}</dd></div>
            {result.finalUrl !== result.requestedUrl && <div className="flex gap-3"><dt className="w-24 shrink-0 text-muted-foreground">Final URL</dt><dd className="min-w-0 break-all font-mono">{result.finalUrl}</dd></div>}
            <div className="flex gap-3"><dt className="w-24 shrink-0 text-muted-foreground">Content-Type</dt><dd className="min-w-0 break-all font-mono">{result.contentType || '(not specified)'}</dd></div>
          </dl>
          {result.variables.length > 0 && (
            <div>
              <h3 className="mb-1.5 text-xs font-semibold text-muted-foreground">Variables</h3>
              <div className="space-y-1.5">
                {result.variables.map((variable) => (
                  <div key={`${variable.lineNumber}-${variable.name}`} className="flex items-start justify-between gap-3 rounded-lg bg-muted/50 px-2.5 py-2 text-xs">
                    <span className="font-mono font-semibold">{variable.name}</span>
                    <span className="break-all text-right font-mono text-muted-foreground">{variable.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export const AdsTxtPage: React.FC = () => {
  const [state, setState] = useState<CheckState>(INITIAL_STATE)
  const preferredResponseLanguage = useMemo(() => resolvePreferredResponseLanguage(typeof chrome === 'undefined' || !chrome.i18n ? null : chrome.i18n.getUILanguage(), navigator.languages), [])
  const streamSummary = useCallback((abortSignal: AbortSignal) => {
    if (!state.result) throw new Error('ads.txt data is unavailable')
    return streamAdsTxtSummary({
      requestedUrl: state.result.requestedUrl,
      finalUrl: state.result.finalUrl,
      statusCode: state.result.statusCode,
      contentType: state.result.contentType,
      sellerRecords: state.result.sellers,
      variables: state.result.variables,
      issues: state.result.issues,
    }, abortSignal, preferredResponseLanguage)
  }, [preferredResponseLanguage, state.result])
  const aiSummary = useAiSummary({ sourceKey: state.result?.finalUrl ?? null, streamSummary })

  const runCheck = useCallback(async () => {
    setState(INITIAL_STATE)
    try {
      const pageUrl = await getCurrentPageUrl()
      const result = await fetchAdsTxt(pageUrl)
      setState({ status: 'success', result, error: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setState({ status: 'error', result: null, error: message })
    }
  }, [])

  useEffect(() => {
    void runCheck()
  }, [runCheck])

  if (state.status === 'loading') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <div className="size-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent motion-reduce:animate-none" />
        <div>
          <p className="text-sm font-medium">Checking ads.txt</p>
          <p className="mt-1 text-xs text-muted-foreground">Fetching /ads.txt from the current site</p>
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 text-center">
        <div className="rounded-full bg-destructive/15 p-3 text-destructive"><IconFileText size={24} /></div>
        <h1 className="mt-4 text-sm font-semibold">Could not check ads.txt</h1>
        <p className="mt-2 max-w-sm break-words text-xs leading-relaxed text-muted-foreground">{state.error}</p>
        <Button variant="outline" size="sm" onClick={() => void runCheck()} className="mt-5">
          <IconRefresh size={14} />Check again
        </Button>
      </div>
    )
  }

  if (!state.result) return null

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto overscroll-contain">
      <StatusSummary result={state.result} action={<AiSummaryButton availability={aiSummary.availability} status={aiSummary.status} onGenerate={() => void aiSummary.generate()} onStop={aiSummary.stop} />} />
      {aiSummary.status !== 'idle' && <AiSummaryCard status={aiSummary.status} summary={aiSummary.summary} error={aiSummary.error} onCopy={() => void aiSummary.copy()} onRegenerate={() => void aiSummary.generate()} onClose={aiSummary.close} />}
      <Issues issues={state.result.issues} />
      <HealthChecks result={state.result} />
      <SellerRecords sellers={state.result.sellers} />
      <TechnicalDetails result={state.result} />
    </div>
  )
}
