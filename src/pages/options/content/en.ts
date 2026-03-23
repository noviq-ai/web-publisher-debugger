export const en = {
  title: 'Pubsight',
  subtitle: 'Settings',

  ai: {
    heading: 'AI Assistant',
    description: 'Configure AI provider for analysis',
    privacy: {
      title: 'Privacy-first design',
      body: 'All AI processing happens directly between your browser and the AI provider. Your API key and page data are never sent to our servers.',
    },
    provider: {
      label: 'AI Provider',
      placeholder: 'Select provider',
      browser: 'Browser AI (Gemini Nano)',
      browserDescription: 'Uses Chrome built-in AI. No API key required, but Chrome AI features must be enabled.',
      anthropic: 'Anthropic (Claude)',
      openai: 'OpenAI (GPT)',
    },
    claudeApiKey: {
      label: 'Claude API Key',
      description: 'Get your API key from',
      linkText: 'Anthropic Console',
    },
    openaiApiKey: {
      label: 'OpenAI API Key',
      description: 'Get your API key from',
      linkText: 'OpenAI Platform',
    },
  },

  general: {
    heading: 'General',
    description: 'General settings',
    defaultTab: {
      label: 'Default Tab',
      placeholder: 'Select default tab',
      description: 'The tab to show when opening the extension',
      options: {
        ai: 'AI Assistant',
        seo: 'SEO',
        adtech: 'AdTech',
        tracking: 'Tracking',
      },
    },
  },

  features: {
    heading: 'Enabled Features',
    description: 'Choose which data collectors to enable',
    items: {
      enableAdTech: { label: 'AdTech', description: 'Prebid.js and Google Publisher Tag monitoring' },
      enableGtm: { label: 'GTM', description: 'Google Tag Manager and dataLayer monitoring' },
      enableSeo: { label: 'SEO', description: 'Meta tags, OGP, and structured data analysis' },
      enableAnalytics: { label: 'Analytics', description: 'GA4 and tracking pixel monitoring' },
    },
  },

  saveButton: 'Save Settings',
  saved: 'Saved!',
}
