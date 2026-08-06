import { streamPageSummary } from './shared'

const MAX_ADVERTISING_SYSTEMS = 30
const MAX_REPRESENTATIVE_ISSUES = 20

interface AdsTxtSellerRecord {
  advertisingSystemDomain: string
  relationship: 'DIRECT' | 'RESELLER'
  certificationAuthorityId: string | null
}

interface AdsTxtVariableRecord {
  name: string
  value: string
}

interface AdsTxtIssueRecord {
  lineNumber: number | null
  severity: 'error' | 'warning'
  message: string
}

export interface AdsTxtSummaryContext {
  requestedUrl: string
  finalUrl: string
  statusCode: number
  contentType: string
  sellerRecords: AdsTxtSellerRecord[]
  variables: AdsTxtVariableRecord[]
  issues: AdsTxtIssueRecord[]
}

function countAdvertisingSystems(sellers: AdsTxtSellerRecord[]): Array<{ domain: string; count: number }> {
  const counts = new Map<string, number>()
  for (const seller of sellers) {
    counts.set(seller.advertisingSystemDomain, (counts.get(seller.advertisingSystemDomain) ?? 0) + 1)
  }
  return Array.from(counts, ([domain, count]) => ({ domain, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, MAX_ADVERTISING_SYSTEMS)
}

function compactAdsTxtContext(data: AdsTxtSummaryContext) {
  const errorCount = data.issues.filter(({ severity }) => severity === 'error').length
  const warningCount = data.issues.length - errorCount
  return {
    requestedUrl: data.requestedUrl,
    finalUrl: data.finalUrl,
    statusCode: data.statusCode,
    contentType: data.contentType,
    sellers: {
      total: data.sellerRecords.length,
      direct: data.sellerRecords.filter(({ relationship }) => relationship === 'DIRECT').length,
      reseller: data.sellerRecords.filter(({ relationship }) => relationship === 'RESELLER').length,
      uniqueAdvertisingSystems: new Set(data.sellerRecords.map(({ advertisingSystemDomain }) => advertisingSystemDomain)).size,
      missingCertificationAuthorityId: data.sellerRecords.filter(({ certificationAuthorityId }) => certificationAuthorityId === null).length,
      leadingAdvertisingSystems: countAdvertisingSystems(data.sellerRecords),
    },
    variables: data.variables,
    issues: {
      errorCount,
      warningCount,
      representativeItems: data.issues.slice(0, MAX_REPRESENTATIVE_ISSUES),
      omittedCount: Math.max(0, data.issues.length - MAX_REPRESENTATIVE_ISSUES),
    },
  }
}

export function streamAdsTxtSummary(
  data: AdsTxtSummaryContext,
  abortSignal: AbortSignal,
  preferredResponseLanguage: string | null,
): AsyncGenerator<string, void, void> {
  return streamPageSummary('ads.txt', compactAdsTxtContext(data), abortSignal, preferredResponseLanguage)
}
