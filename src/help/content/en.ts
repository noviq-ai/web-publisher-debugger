export const en = {
  title: 'Help & Documentation',
  backToSettings: 'Back to Settings',

  sections: {
    overview: {
      title: 'Overview',
      content: `Web Publisher Debugger is a Chrome extension designed to help web publishers debug and analyze their pages. It provides real-time insights into AdTech, SEO, and tracking implementations.`
    },

    aiAssistant: {
      title: 'AI Assistant',
      description: 'Get intelligent analysis and recommendations powered by AI.',
      items: [
        {
          title: 'How it works',
          content: 'The AI assistant analyzes page data collected by the extension and provides actionable insights. You can ask questions about your implementation or request specific analyses.'
        },
        {
          title: 'Privacy',
          content: 'All AI communication happens directly between your browser and the AI provider (Anthropic or OpenAI). Your data and API keys are never sent to our servers.'
        },
        {
          title: 'Supported providers',
          content: 'Currently supports Chrome built-in AI (Gemini Nano), Anthropic Claude, and OpenAI GPT models. Browser AI requires no API key; other providers require your own API key configured in settings.'
        },
        {
          title: 'Available tools',
          content: 'The AI assistant has access to predefined tools for collecting and analyzing page data. See the full tool reference at tools.html for details on each tool and its parameters.'
        }
      ]
    },

    seo: {
      title: 'SEO Analysis',
      description: 'Analyze meta tags, Open Graph, structured data, and more.',
      items: [
        {
          title: 'Meta tags',
          content: 'View and validate essential meta tags including title, description, viewport, and robots directives.'
        },
        {
          title: 'Open Graph',
          content: 'Check Open Graph tags for social media sharing preview. Includes og:title, og:description, og:image, and more.'
        },
        {
          title: 'Structured data',
          content: 'Inspect JSON-LD structured data on the page. Validates schema.org markup for rich search results.'
        }
      ]
    },

    adtech: {
      title: 'AdTech Monitoring',
      description: 'Debug Prebid.js and Google Publisher Tag implementations.',
      items: [
        {
          title: 'Prebid.js',
          content: 'Monitor Prebid.js bid requests and responses. View bidder configurations, timeouts, and winning bids.'
        },
        {
          title: 'Google Publisher Tag (GPT)',
          content: 'Track GPT slot definitions, targeting, and ad render events. View slot-level configuration and performance.'
        }
      ]
    },

    tracking: {
      title: 'Tracking & Analytics',
      description: 'Monitor Google Tag Manager and analytics implementations.',
      items: [
        {
          title: 'Google Tag Manager',
          content: 'View dataLayer pushes in real-time. Monitor GTM container loading and tag firing events.'
        },
        {
          title: 'Google Analytics 4',
          content: 'Track GA4 events and parameters. View measurement ID, client ID, and event data.'
        },
        {
          title: 'Tracking Pixels',
          content: 'Detect and monitor various tracking pixels including Facebook, Twitter, LinkedIn, and more.'
        }
      ]
    },

    dataStorage: {
      title: 'Data Storage',
      description: 'How your data is stored and managed.',
      items: [
        {
          title: 'Settings',
          content: 'Extension settings (API keys, preferences) are stored in Chrome sync storage, synced across your Chrome browsers when signed in.'
        },
        {
          title: 'Page data',
          content: 'Collected page data is stored temporarily in memory and is cleared when you close the tab or navigate away.'
        },
        {
          title: 'No external storage',
          content: 'We do not store any of your data on external servers. Everything stays in your browser.'
        }
      ]
    },

    permissions: {
      title: 'Permissions',
      description: 'Why the extension needs certain permissions.',
      items: [
        {
          title: 'activeTab',
          content: 'Required to access the current tab content for analysis when you activate the extension.'
        },
        {
          title: 'storage',
          content: 'Used to save your settings and preferences.'
        },
        {
          title: 'sidePanel',
          content: 'Enables the extension to display in Chrome side panel for better workflow.'
        },
        {
          title: 'host_permissions (all_urls)',
          content: 'Required to analyze any website you visit. The extension only activates when you open it.'
        }
      ]
    }
  }
}
