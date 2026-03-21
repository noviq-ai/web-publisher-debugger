export const en = {
  title: 'AI Tools Reference',

  overview: 'The AI assistant uses the following predefined tools to collect and analyze data from the current page. Tools are called automatically based on your question — no manual selection needed.',

  dataCollection: {
    heading: 'Data Collection',
    description: 'Tools that collect data from the page.',
  },

  dynamicQueries: {
    heading: 'Dynamic Queries',
    description: 'Tools that query Prebid.js data in real-time for deeper analysis.',
  },

  labels: {
    parameters: 'Parameters:',
    useCase: 'Use case:',
  },

  tools: {
    getTrackingOverview: {
      description: 'Quick summary of tracking implementations (GTM, GA4, pixels).',
      useCase: 'When the user asks a broad question about what tracking is on the page.',
    },
    getGtmData: {
      description: 'Get GTM (Google Tag Manager) details including container info, dataLayer events, fired tags, and variables.',
      useCase: 'When the user asks about GTM or dataLayer.',
    },
    getGa4Data: {
      description: 'Get GA4 (Google Analytics 4) details including measurement ID, events, consent status, and configurations.',
      useCase: 'When the user asks about GA4 or analytics events.',
    },
    getPixelData: {
      description: 'Get marketing pixel data for Meta, Twitter/X, TikTok, LinkedIn, Pinterest, Criteo, and Snapchat.',
      useCase: 'When the user asks about marketing pixels or conversion tracking.',
    },
    getSeoData: {
      description: 'Get SEO metadata and issues including meta tags, OGP, Twitter Card, structured data, headings, and detected issues.',
      useCase: 'When the user asks about SEO or page metadata.',
    },
    getAdtechData: {
      description: 'Get Prebid.js header bidding data including config, bidders, ad units, auction results, and winning bids.',
      useCase: 'When the user asks about header bidding or ad setup.',
    },
    diagnoseBidder: {
      description: 'Diagnose a specific Prebid bidder\'s performance in real-time. Returns bid rate, timeout rate, win rate, average CPM, response time, and identified issues.',
      useCase: 'When a specific bidder is not responding or performing poorly.',
    },
    analyzeAdUnit: {
      description: 'Analyze a specific Prebid ad unit in real-time. Returns configured bidders, bid responses, no-bids, highest bid, and winner.',
      useCase: 'When you need detailed information about a specific ad slot.',
    },
    queryPrebidEvents: {
      description: 'Query Prebid event history. Returns event timeline with summaries.',
      useCase: 'When you need to understand the auction timeline or debug issues.',
    },
  },
}
