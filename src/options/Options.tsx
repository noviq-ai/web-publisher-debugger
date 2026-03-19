import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { IconCheck, IconExternalLink, IconHelpCircle, IconShield, IconSparkles } from '@tabler/icons-react'
import ClaudeIcon from '@/components/assets/claude'
import OpenaiIcon from '@/components/assets/openai'
import { PageHeader } from '@/components/common/PageHeader'
import { PageLayout, SectionCard } from '@/components/common/PageLayout'

export const Options: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['settings'], (result) => {
        if (result.settings) {
          setSettings(result.settings)
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

  const features = [
    { key: 'enableAdTech' as const, label: 'AdTech', description: 'Prebid.js and Google Publisher Tag monitoring' },
    { key: 'enableGtm' as const, label: 'GTM', description: 'Google Tag Manager and dataLayer monitoring' },
    { key: 'enableSeo' as const, label: 'SEO', description: 'Meta tags, OGP, and structured data analysis' },
    { key: 'enableAnalytics' as const, label: 'Analytics', description: 'GA4 and tracking pixel monitoring' },
  ]

  return (
    <>
      <PageHeader
        title="Web Publisher Debugger"
        subtitle="Settings"
        actions={
          <a
            href="help.html"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconHelpCircle size={16} />
            Help
          </a>
        }
      />
      <PageLayout>
        {/* AI Assistant Section */}
        <SectionCard>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IconSparkles size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                Beta
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure AI provider for analysis
            </p>

            {/* Privacy Notice */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <IconShield size={20} className="text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Privacy-first design</p>
                <p>
                  All AI processing happens directly between your browser and the AI provider.
                  Your API key and page data are never sent to our servers.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="ai-provider">AI Provider</Label>
                <Select
                  value={settings.aiProvider}
                  onValueChange={(value: AiProvider) =>
                    setSettings({ ...settings, aiProvider: value })
                  }
                >
                  <SelectTrigger id="ai-provider" className="bg-background">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">
                      <span className="flex items-center gap-2">
                        <ClaudeIcon className="h-4 w-4" />
                        Anthropic (Claude)
                      </span>
                    </SelectItem>
                    <SelectItem value="openai">
                      <span className="flex items-center gap-2">
                        <OpenaiIcon className="h-4 w-4" />
                        OpenAI (GPT)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.aiProvider === 'anthropic' && (
                <div className="space-y-2">
                  <Label htmlFor="claude-api-key">Claude API Key</Label>
                  <Input
                    id="claude-api-key"
                    type="password"
                    value={settings.claudeApiKey}
                    onChange={(e) => setSettings({ ...settings, claudeApiKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="bg-background font-mono"
                  />
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Get your API key from{' '}
                    <a
                      href="https://console.anthropic.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Anthropic Console
                      <IconExternalLink size={12} />
                    </a>
                  </p>
                </div>
              )}

              {settings.aiProvider === 'openai' && (
                <div className="space-y-2">
                  <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                  <Input
                    id="openai-api-key"
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="bg-background font-mono"
                  />
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    Get your API key from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      OpenAI Platform
                      <IconExternalLink size={12} />
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* General Section */}
        <SectionCard>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">General</h2>
              <p className="text-sm text-muted-foreground mt-1">
                General settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-tab">Default Tab</Label>
              <Select
                value={settings.defaultTab}
                onValueChange={(value: TabId) =>
                  setSettings({ ...settings, defaultTab: value })
                }
              >
                <SelectTrigger id="default-tab" className="bg-background">
                  <SelectValue placeholder="Select default tab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">AI Assistant</SelectItem>
                  <SelectItem value="seo">SEO</SelectItem>
                  <SelectItem value="adtech">AdTech</SelectItem>
                  <SelectItem value="tracking">Tracking</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                The tab to show when opening the extension
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Features Section */}
        <SectionCard>
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Enabled Features</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose which data collectors to enable
              </p>
            </div>

            <div className="space-y-1">
              {features.map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-center justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <Label htmlFor={feature.key} className="font-medium cursor-pointer">
                      {feature.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch
                    id={feature.key}
                    checked={settings[feature.key]}
                    onCheckedChange={(checked) => setSettings({ ...settings, [feature.key]: checked })}
                  />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full h-11 text-base font-medium">
          {saved ? (
            <>
              <IconCheck size={16} />
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </PageLayout>
    </>
  )
}
