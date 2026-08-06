import type {
  AnalyticsData,
  GptData,
  GtmData,
  PrebidData,
  SeoData,
  TechStackData,
} from '@/shared/types'
export interface DevMockData {
  seoData: SeoData
  prebidData: PrebidData
  gptData: GptData
  gtmData: GtmData
  analyticsData: AnalyticsData
  techStackData: TechStackData
}

export function createDevMockData(now: number): DevMockData {
  const auctionStart = now - 4_200
  const seoData: SeoData = {
    title: 'Pubsight Media — Publisher Technology & Revenue Insights',
    description: 'Independent reporting and analysis for digital publishing, advertising technology, and audience growth.',
    canonical: 'https://publisher.example.com/adtech/ads-txt-guide',
    robots: 'index, follow, max-image-preview:large',
    viewport: 'width=device-width, initial-scale=1',
    charset: 'UTF-8',
    ogp: {
      title: 'The Publisher’s Guide to Ads.txt Health',
      description: 'How to audit authorized sellers and keep programmatic revenue paths clean.',
      image: 'https://publisher.example.com/images/ads-txt-guide.jpg',
      url: 'https://publisher.example.com/adtech/ads-txt-guide',
      type: 'article',
      siteName: 'Pubsight Media',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@pubsightmedia',
      creator: '@editor_demo',
      title: 'The Publisher’s Guide to Ads.txt Health',
      description: 'Audit authorized sellers and remove stale supply paths.',
      image: 'https://publisher.example.com/images/ads-txt-guide.jpg',
    },
    jsonLd: [
      {
        type: 'NewsArticle',
        isValid: true,
        raw: {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: 'The Publisher’s Guide to Ads.txt Health',
          datePublished: '2026-08-05T09:00:00+09:00',
        },
      },
      {
        type: 'BreadcrumbList',
        isValid: true,
        raw: { '@context': 'https://schema.org', '@type': 'BreadcrumbList' },
      },
    ],
    hreflang: [
      { lang: 'en', href: 'https://publisher.example.com/adtech/ads-txt-guide' },
      { lang: 'ja', href: 'https://publisher.example.com/ja/adtech/ads-txt-guide' },
      { lang: 'x-default', href: 'https://publisher.example.com/adtech/ads-txt-guide' },
    ],
    headings: {
      h1: ['The Publisher’s Guide to Ads.txt Health'],
      h2: ['Why ads.txt hygiene matters', 'Audit checklist', 'Common implementation issues'],
      h3: ['Duplicate records', 'Owner and manager domains', 'Monitoring changes'],
      h4: [], h5: [], h6: [],
    },
    links: { internal: 42, external: 11, nofollow: 4 },
    issues: [
      {
        type: 'warning',
        category: 'ogp',
        code: 'OG_IMAGE_SIZE_UNKNOWN',
        message: 'The Open Graph image dimensions could not be verified.',
        suggestion: 'Use a 1200 × 630 px image.',
      },
      {
        type: 'info',
        category: 'link',
        code: 'EXTERNAL_NOFOLLOW',
        message: 'Four external links use nofollow.',
      },
    ],
    collectedAt: now,
    url: 'https://publisher.example.com/adtech/ads-txt-guide',
  }

  const prebidData: PrebidData = {
    detected: true,
    version: '9.53.0',
    config: {
      timeout: 1_200,
      priceGranularity: 'dense',
      consentManagement: true,
      userSync: { enabled: true, syncsPerBidder: 5, filterSettings: { iframe: { bidders: '*', filter: 'include' } } },
      debug: false,
      useBidCache: true,
      deviceAccess: true,
      s2sConfig: { enabled: true, endpoint: 'https://prebid-server.example.com/openrtb2/auction', bidders: ['appnexus', 'rubicon'] },
    },
    installedModules: ['consentManagementGpp', 'consentManagementTcf', 'currency', 'userId', 'schain', 'priceFloors'],
    userIds: {
      ids: { sharedid: { id: 'mock-shared-id' }, id5id: { uid: 'mock-id5-id' } },
      eids: [
        { source: 'sharedid.org', uids: [{ id: 'mock-shared-id', atype: 1 }] },
        { source: 'id5-sync.com', uids: [{ id: 'mock-id5-id', atype: 1 }] },
      ],
    },
    consentMetadata: {
      gdprApplies: false,
      consentString: null,
      vendorData: { purpose: { consents: { 1: true, 2: true } } },
      uspString: '1YNN',
      gppString: 'DBACNY~BUoAAACA.QA',
    },
    bidders: [
      { code: 'appnexus', bidCount: 18, winCount: 5, avgBidCpm: 1.84, avgResponseTime: 284, timeoutCount: 0, currency: 'USD' },
      { code: 'rubicon', bidCount: 18, winCount: 4, avgBidCpm: 1.62, avgResponseTime: 341, timeoutCount: 1, currency: 'USD' },
      { code: 'pubmatic', bidCount: 18, winCount: 2, avgBidCpm: 1.21, avgResponseTime: 418, timeoutCount: 2, currency: 'USD' },
      { code: 'openx', bidCount: 12, winCount: 1, avgBidCpm: 0.96, avgResponseTime: 507, timeoutCount: 1, currency: 'USD' },
      { code: 'ix', bidCount: 18, winCount: 3, avgBidCpm: 1.44, avgResponseTime: 256, timeoutCount: 0, currency: 'USD' },
    ],
    adUnits: [
      { code: 'div-gpt-top_leaderboard', mediaTypes: ['banner'], sizes: [[970, 250], [728, 90]], bidders: ['appnexus', 'rubicon', 'pubmatic', 'ix'] },
      { code: 'div-gpt-article_mid', mediaTypes: ['banner'], sizes: [[300, 250], [336, 280]], bidders: ['appnexus', 'rubicon', 'openx', 'ix'] },
      { code: 'div-gpt-sticky_footer', mediaTypes: ['banner'], sizes: [[320, 50], [728, 90]], bidders: ['appnexus', 'pubmatic', 'ix'] },
    ],
    auctions: [
      {
        auctionId: 'mock-auction-01', timestamp: auctionStart, adUnitCode: 'div-gpt-top_leaderboard', timeout: false,
        bids: [
          { bidder: 'appnexus', cpm: 2.42, currency: 'USD', width: 970, height: 250, responseTime: 248, status: 'rendered', adId: 'mock-ad-001' },
          { bidder: 'rubicon', cpm: 2.08, currency: 'USD', width: 970, height: 250, responseTime: 327, status: 'available', adId: 'mock-ad-002' },
          { bidder: 'pubmatic', cpm: 0, currency: 'USD', width: 970, height: 250, responseTime: 1_200, status: 'timeout', adId: 'mock-ad-003' },
        ],
        winningBid: { bidder: 'appnexus', cpm: 2.42, currency: 'USD', width: 970, height: 250, responseTime: 248, status: 'rendered', adId: 'mock-ad-001' },
      },
    ],
    winningBids: [{ adUnitCode: 'div-gpt-top_leaderboard', bidder: 'appnexus', cpm: 2.42, currency: 'USD', width: 970, height: 250, adId: 'mock-ad-001', timeToRespond: 248 }],
    prebidWinningBids: [{ adUnitCode: 'div-gpt-article_mid', bidder: 'ix', cpm: 1.76, currency: 'USD', width: 300, height: 250, adId: 'mock-ad-004', timeToRespond: 231 }],
    adserverTargeting: {
      'div-gpt-top_leaderboard': { hb_bidder: 'appnexus', hb_pb: '2.40', hb_size: '970x250', hb_adid: 'mock-ad-001' },
      'div-gpt-article_mid': { hb_bidder: 'ix', hb_pb: '1.70', hb_size: '300x250', hb_adid: 'mock-ad-004' },
    },
    aliasRegistry: { xandr: 'appnexus', magnite: 'rubicon' },
    bidderSettings: { standard: { adserverTargeting: [{ key: 'hb_bidder', val: 'bidderCode' }] } },
    events: [
      { eventType: 'auctionInit', timestamp: auctionStart, data: { auctionId: 'mock-auction-01' } },
      { eventType: 'bidRequested', timestamp: auctionStart + 12, data: { bidderCode: 'appnexus' } },
      { eventType: 'bidResponse', timestamp: auctionStart + 260, data: { bidderCode: 'appnexus', cpm: 2.42 } },
      { eventType: 'bidWon', timestamp: auctionStart + 438, data: { bidder: 'appnexus', cpm: 2.42 } },
      { eventType: 'auctionEnd', timestamp: auctionStart + 452, data: { auctionId: 'mock-auction-01' } },
    ],
    collectedAt: now,
  }

  const gptData: GptData = {
    detected: true,
    version: '2026080401',
    slots: [
      {
        slotElementId: 'div-gpt-top_leaderboard', adUnitPath: '/1234567/pubsight/top_leaderboard', sizes: [{ width: 970, height: 250 }, { width: 728, height: 90 }],
        targeting: { pos: ['top'], section: ['adtech'], hb_bidder: ['appnexus'] },
        responseInfo: { advertiserId: 120045, campaignId: 340012, creativeId: 870091, lineItemId: 560032, sourceAgnosticCreativeId: 870091, sourceAgnosticLineItemId: 560032, isBackfill: false, creativeTemplateId: 1 },
        renderInfo: { isEmpty: false, size: [970, 250], renderedAt: auctionStart + 510 },
      },
      {
        slotElementId: 'div-gpt-article_mid', adUnitPath: '/1234567/pubsight/article_mid', sizes: [{ width: 300, height: 250 }, { width: 336, height: 280 }],
        targeting: { pos: ['mid'], section: ['adtech'] }, responseInfo: null,
        renderInfo: { isEmpty: true, size: null, renderedAt: auctionStart + 780 },
      },
      {
        slotElementId: 'div-gpt-sticky_footer', adUnitPath: '/1234567/pubsight/sticky_footer', sizes: [{ width: 320, height: 50 }, { width: 728, height: 90 }],
        targeting: { pos: ['sticky'], refresh: ['30'] }, responseInfo: null, renderInfo: null,
      },
    ],
    pageTargeting: { section: ['adtech'], content_type: ['article'], logged_in: ['false'], test_group: ['control'] },
    config: { initialLoadDisabled: true, singleRequest: true, lazyLoadEnabled: true, privacySettingsToken: null },
    events: [
      { eventType: 'slotRequested', timestamp: auctionStart + 460, slotElementId: 'div-gpt-top_leaderboard', data: {} },
      { eventType: 'slotResponseReceived', timestamp: auctionStart + 490, slotElementId: 'div-gpt-top_leaderboard', data: {} },
      { eventType: 'slotRenderEnded', timestamp: auctionStart + 510, slotElementId: 'div-gpt-top_leaderboard', data: { isEmpty: false, size: [970, 250] } },
      { eventType: 'impressionViewable', timestamp: auctionStart + 1_640, slotElementId: 'div-gpt-top_leaderboard', data: {} },
    ],
    collectedAt: now,
  }

  const gtmData: GtmData = {
    detected: true,
    containerId: 'GTM-PUBSIGHT',
    containerVersion: '184',
    dataLayerEvents: [
      { timestamp: now - 8_200, event: 'gtm.js', data: { 'gtm.start': now - 8_200 } },
      { timestamp: now - 6_900, event: 'consent_update', data: { analytics_storage: 'granted', ad_storage: 'granted' } },
      { timestamp: now - 6_100, event: 'page_view', data: { page_type: 'article', section: 'adtech', author: 'Editorial Team' } },
      { timestamp: now - 3_700, event: 'ad_impression', data: { slot: 'top_leaderboard', bidder: 'appnexus', cpm: 2.42 } },
      { timestamp: now - 1_900, event: 'scroll_depth', data: { percent: 50 } },
    ],
    tagsFired: [
      { id: 'tag-01', name: 'GA4 - Page View', type: 'gaawe', firedCount: 1, lastFired: now - 6_080 },
      { id: 'tag-02', name: 'GA4 - Ad Impression', type: 'gaawe', firedCount: 1, lastFired: now - 3_690 },
      { id: 'tag-03', name: 'Meta Pixel - PageView', type: 'html', firedCount: 1, lastFired: now - 6_050 },
      { id: 'tag-04', name: 'Consent Mode Update', type: 'gct', firedCount: 1, lastFired: now - 6_880 },
    ],
    variables: [
      { name: 'Page Type', type: 'v', value: 'article' },
      { name: 'Content Section', type: 'v', value: 'adtech' },
      { name: 'Consent - Analytics', type: 'v', value: 'granted' },
      { name: 'Consent - Ads', type: 'v', value: 'granted' },
    ],
    collectedAt: now,
  }

  const analyticsData: AnalyticsData = {
    ga4: {
      detected: true,
      measurementId: 'G-PUBSIGHT01',
      events: [
        { timestamp: now - 6_100, name: 'page_view', params: { page_title: seoData.title, page_location: seoData.url } },
        { timestamp: now - 3_700, name: 'view_promotion', params: { creative_slot: 'top_leaderboard', promotion_id: 'mock-ad-001' } },
        { timestamp: now - 1_900, name: 'scroll', params: { percent_scrolled: 50 } },
      ],
      configs: [{ timestamp: now - 8_000, targetId: 'G-PUBSIGHT01', config: { send_page_view: false, cookie_flags: 'SameSite=None;Secure' } }],
      consent: { timestamp: now - 6_900, type: 'update', params: { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'denied' } },
    },
    pixels: [
      { type: 'facebook', id: '123456789012345', events: [{ timestamp: now - 6_050, eventName: 'PageView', params: { content_category: 'adtech' } }] },
      { type: 'twitter', id: 'o1234', events: [{ timestamp: now - 5_980, eventName: 'PageView', params: {} }] },
      { type: 'linkedin', id: '987654', events: [{ timestamp: now - 5_850, eventName: 'PageView', params: { conversion_id: 112233 } }] },
      { type: 'criteo', id: '445566', events: [{ timestamp: now - 5_700, eventName: 'viewItem', params: { item: 'ads-txt-guide' } }] },
    ],
    collectedAt: now,
  }

  const techStackData: TechStackData = {
    items: [
      { name: 'Prebid.js', version: '9.53.0', category: 'ad_network', detectedBy: 'global' },
      { name: 'Google Publisher Tag', category: 'ad_network', detectedBy: 'global', domain: 'securepubads.g.doubleclick.net' },
      { name: 'Google Tag Manager', category: 'tag_manager', detectedBy: 'script_url', domain: 'googletagmanager.com' },
      { name: 'Google Analytics 4', category: 'analytics', detectedBy: 'script_url', domain: 'google-analytics.com' },
      { name: 'Cloudflare', category: 'cdn', detectedBy: 'script_url', domain: 'cdnjs.cloudflare.com' },
      { name: 'React', version: '18.3.1', category: 'frontend_framework', detectedBy: 'global' },
      { name: 'WordPress', version: '6.8', category: 'cms', detectedBy: 'dom' },
      { name: 'OneTrust', category: 'cookie_consent', detectedBy: 'script_url', domain: 'cdn.cookielaw.org' },
      { name: 'HubSpot', category: 'marketing_automation', detectedBy: 'script_url', domain: 'js.hs-scripts.com' },
      { name: 'Meta Pixel', category: 'retargeting', detectedBy: 'global', domain: 'connect.facebook.net' },
    ],
    detectedAt: now,
  }

  return { seoData, prebidData, gptData, gtmData, analyticsData, techStackData }
}
