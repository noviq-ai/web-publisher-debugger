import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconArrowLeft,
  IconRobot,
  IconSearch,
  IconDeviceTv,
  IconChartBar,
  IconDatabase,
  IconShield,
  IconChevronDown,
  IconChevronRight,
  IconGlobe,
} from '@tabler/icons-react'
import { PageHeader } from '@/components/common/PageHeader'
import { PageLayout, SectionCard } from '@/components/common/PageLayout'
import { getContent, detectLanguage } from './content'

const sectionIcons: Record<string, React.ReactNode> = {
  aiAssistant: <IconRobot size={20} />,
  seo: <IconSearch size={20} />,
  adtech: <IconDeviceTv size={20} />,
  tracking: <IconChartBar size={20} />,
  dataStorage: <IconDatabase size={20} />,
  permissions: <IconShield size={20} />
}

interface CollapsibleSectionProps {
  title: string
  description: string
  icon: React.ReactNode
  items: { title: string; content: string }[]
  defaultOpen?: boolean
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  description,
  icon,
  items,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="text-primary">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        </div>
        {isOpen ? (
          <IconChevronDown size={20} className="text-muted-foreground shrink-0" />
        ) : (
          <IconChevronRight size={20} className="text-muted-foreground shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-border/50 bg-muted/20">
          <div className="p-4 space-y-4">
            {items.map((item, index) => (
              <div key={index} className="space-y-1">
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const Help: React.FC = () => {
  const [lang, setLang] = useState(detectLanguage)
  const content = getContent(lang)

  const handleBackToSettings = () => {
    window.location.href = 'options.html'
  }

  return (
    <>
      <PageHeader
        title={content.title}
        actions={
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger className="w-auto gap-2">
              <IconGlobe size={16} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      <PageLayout>
        {/* Back button */}
        <div className="mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToSettings}
            className="text-muted-foreground hover:text-foreground -ml-2"
          >
            <IconArrowLeft size={16} className="mr-1" />
            {content.backToSettings}
          </Button>
        </div>

        {/* Overview */}
        <SectionCard>
          <h2 className="font-semibold mb-2">{content.sections.overview.title}</h2>
          <p className="text-sm text-muted-foreground">{content.sections.overview.content}</p>
        </SectionCard>

        {/* Sections */}
        {Object.entries(content.sections).map(([key, section]) => {
          if (key === 'overview') return null
          if (!('items' in section)) return null

          return (
            <CollapsibleSection
              key={key}
              title={section.title}
              description={section.description}
              icon={sectionIcons[key] || <IconDatabase size={20} />}
              items={section.items}
              defaultOpen={key === 'aiAssistant'}
            />
          )
        })}
      </PageLayout>
    </>
  )
}
