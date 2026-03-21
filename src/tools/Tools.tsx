import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { PageLayout, SectionCard } from '@/components/common/PageLayout'
import { getContent, detectLanguage } from './content'
import type { ToolsContent } from './content'

interface ToolInfo {
  name: string
  parameters?: string
  category: 'data' | 'query'
}

const tools: ToolInfo[] = [
  { name: 'getTrackingOverview', category: 'data' },
  { name: 'getGtmData', parameters: 'limit, eventFilter', category: 'data' },
  { name: 'getGa4Data', parameters: 'limit, eventFilter, includeConsent, includeConfigs', category: 'data' },
  { name: 'getPixelData', parameters: 'platform, limit', category: 'data' },
  { name: 'getSeoData', parameters: 'includeJsonLd, includeHeadings, issuesOnly', category: 'data' },
  { name: 'getAdtechData', parameters: 'includeAuctions, includeBidderDetails, includeConfig, auctionLimit', category: 'data' },
  { name: 'diagnoseBidder', parameters: 'bidderCode', category: 'query' },
  { name: 'analyzeAdUnit', parameters: 'adUnitCode', category: 'query' },
  { name: 'queryPrebidEvents', parameters: 'eventType, limit', category: 'query' },
]

const dataTools = tools.filter(t => t.category === 'data')
const queryTools = tools.filter(t => t.category === 'query')

const ToolCard: React.FC<{ tool: ToolInfo; t: ToolsContent }> = ({ tool, t }) => {
  const toolContent = t.tools[tool.name as keyof typeof t.tools]
  return (
    <div className="space-y-1.5 p-4 -mx-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2">
        <code className="text-sm font-semibold">{tool.name}</code>
      </div>
      <p className="text-sm text-muted-foreground">{toolContent.description}</p>
      {tool.parameters && (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{t.labels.parameters}</span>{' '}
          <code className="text-xs">{tool.parameters}</code>
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{t.labels.useCase}</span> {toolContent.useCase}
      </p>
    </div>
  )
}

export const Tools: React.FC = () => {
  const [lang, setLang] = useState(detectLanguage)
  const t = getContent(lang)

  return (
    <>
      <PageHeader
        activePage="tools"
        lang={lang}
        onLangChange={setLang}
      />
      <PageLayout>
        <SectionCard>
          <p className="text-sm text-muted-foreground">
            {t.overview}
          </p>
        </SectionCard>

        <SectionCard>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{t.dataCollection.heading}</h2>
            <p className="text-sm text-muted-foreground">
              {t.dataCollection.description}
            </p>
          </div>
          <div className="mt-2 divide-y divide-border/50">
            {dataTools.map(tool => (
              <ToolCard key={tool.name} tool={tool} t={t} />
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{t.dynamicQueries.heading}</h2>
            <p className="text-sm text-muted-foreground">
              {t.dynamicQueries.description}
            </p>
          </div>
          <div className="mt-2 divide-y divide-border/50">
            {queryTools.map(tool => (
              <ToolCard key={tool.name} tool={tool} t={t} />
            ))}
          </div>
        </SectionCard>
      </PageLayout>
    </>
  )
}
