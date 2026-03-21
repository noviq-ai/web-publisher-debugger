import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Settings, type AiProvider, type TabId, defaultSettings } from '@/shared/types'
import { IconCheck, IconExternalLink, IconShield } from '@tabler/icons-react'
import SparkleIcon from '@/components/assets/sparkle-icon'
import ClaudeIcon from '@/components/assets/claude'
import OpenaiIcon from '@/components/assets/openai'
import { PageHeader } from '@/components/common/PageHeader'
import { PageLayout, SectionCard } from '@/components/common/PageLayout'
import { getContent, detectLanguage } from './content'

export const Options: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [lang, setLang] = useState(detectLanguage)
  const t = getContent(lang)

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
          setSettings({ ...defaultSettings, ...result.settings })
        }
      })
    } else {
      // Dev mode: load from localStorage
      const stored = localStorage.getItem('settings')
      if (stored) {
        setSettings(JSON.parse(stored))
      }
    }
  }, [])

  const handleSave = async () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ settings })
    } else {
      // Dev mode: save to localStorage
      localStorage.setItem('settings', JSON.stringify(settings))
      // Also set individual keys for AiPage compatibility
      localStorage.setItem('aiProvider', settings.aiProvider)
      localStorage.setItem('claudeApiKey', settings.claudeApiKey)
      localStorage.setItem('openaiApiKey', settings.openaiApiKey)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const featureKeys = ['enableAdTech', 'enableGtm', 'enableSeo', 'enableAnalytics'] as const

  return (
    <>
      <PageHeader
        activePage="settings"
        lang={lang}
        onLangChange={setLang}
      />
      <PageLayout>
        {/* AI Assistant Section */}
        <SectionCard>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SparkleIcon className="size-5 [&_path]:fill-current text-primary" />
              <h2 className="text-lg font-semibold">{t.ai.heading}</h2>
              <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                Beta
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.ai.description}
            </p>

            {/* Privacy Notice */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <IconShield size={20} className="text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{t.ai.privacy.title}</p>
                <p>{t.ai.privacy.body}</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Field>
                <FieldLabel htmlFor="ai-provider">{t.ai.provider.label}</FieldLabel>
                <Select
                  value={settings.aiProvider}
                  onValueChange={(value: AiProvider) =>
                    setSettings({ ...settings, aiProvider: value })
                  }
                >
                  <SelectTrigger id="ai-provider" className="bg-background">
                    <SelectValue placeholder={t.ai.provider.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="browser">
                      <span className="flex items-center gap-2">
                        <SparkleIcon className="size-4 [&_path]:fill-current" />
                        {t.ai.provider.browser}
                      </span>
                    </SelectItem>
                    <SelectItem value="anthropic">
                      <span className="flex items-center gap-2">
                        <ClaudeIcon className="h-4 w-4" />
                        {t.ai.provider.anthropic}
                      </span>
                    </SelectItem>
                    <SelectItem value="openai">
                      <span className="flex items-center gap-2">
                        <OpenaiIcon className="h-4 w-4" />
                        {t.ai.provider.openai}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {settings.aiProvider === 'browser' && (
                  <FieldDescription>
                    {t.ai.provider.browserDescription}
                  </FieldDescription>
                )}
              </Field>

              {settings.aiProvider === 'anthropic' && (
                <Field>
                  <FieldLabel htmlFor="claude-api-key">{t.ai.claudeApiKey.label}</FieldLabel>
                  <Input
                    id="claude-api-key"
                    type="password"
                    value={settings.claudeApiKey}
                    onChange={(e) => setSettings({ ...settings, claudeApiKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="bg-background font-mono"
                  />
                  <FieldDescription className="flex items-center gap-1">
                    {t.ai.claudeApiKey.description}{' '}
                    <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {t.ai.claudeApiKey.linkText}
                      <IconExternalLink size={12} />
                    </a>
                  </FieldDescription>
                </Field>
              )}

              {settings.aiProvider === 'openai' && (
                <Field>
                  <FieldLabel htmlFor="openai-api-key">{t.ai.openaiApiKey.label}</FieldLabel>
                  <Input
                    id="openai-api-key"
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="bg-background font-mono"
                  />
                  <FieldDescription className="flex items-center gap-1">
                    {t.ai.openaiApiKey.description}{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {t.ai.openaiApiKey.linkText}
                      <IconExternalLink size={12} />
                    </a>
                  </FieldDescription>
                </Field>
              )}
            </div>
          </div>
        </SectionCard>

        {/* General Section */}
        <SectionCard>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{t.general.heading}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t.general.description}
              </p>
            </div>

            <Field>
              <FieldLabel htmlFor="default-tab">{t.general.defaultTab.label}</FieldLabel>
              <Select
                value={settings.defaultTab}
                onValueChange={(value: TabId) =>
                  setSettings({ ...settings, defaultTab: value })
                }
              >
                <SelectTrigger id="default-tab" className="bg-background">
                  <SelectValue placeholder={t.general.defaultTab.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">{t.general.defaultTab.options.ai}</SelectItem>
                  <SelectItem value="seo">{t.general.defaultTab.options.seo}</SelectItem>
                  <SelectItem value="adtech">{t.general.defaultTab.options.adtech}</SelectItem>
                  <SelectItem value="tracking">{t.general.defaultTab.options.tracking}</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                {t.general.defaultTab.description}
              </FieldDescription>
            </Field>
          </div>
        </SectionCard>

        {/* Features Section */}
        <SectionCard>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{t.features.heading}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t.features.description}
              </p>
            </div>

            <div className="space-y-1">
              {featureKeys.map((key) => {
                const feature = t.features.items[key]
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <FieldLabel htmlFor={key} className="font-medium cursor-pointer">
                        {feature.label}
                      </FieldLabel>
                      <FieldDescription>{feature.description}</FieldDescription>
                    </div>
                    <Switch
                      id={key}
                      checked={settings[key]}
                      onCheckedChange={(checked) => setSettings({ ...settings, [key]: checked })}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </SectionCard>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full h-11 text-base font-medium">
          {saved ? (
            <>
              <IconCheck size={16} />
              {t.saved}
            </>
          ) : (
            t.saveButton
          )}
        </Button>
      </PageLayout>
    </>
  )
}
