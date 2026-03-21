import type { TechStackCategory } from '@/shared/types/techstack'

// ==========================================
// 型定義
// ==========================================

export interface Check {
  type: 'script_url' | 'dom' | 'meta' | 'global'
  patterns?: RegExp[]
  selector?: string
  name?: string
  property?: string
  contentPattern?: RegExp
}

export interface TechEntry {
  name: string
  category: TechStackCategory
  confidence: 'high' | 'medium' | 'low'
  checks: Check[]
  matchMode?: 'any' | 'all'
  /** Brandfetch でアイコンを取得するドメイン（例: 'google.com'）。icon より優先される */
  domain?: string
  /** /icons/ 配下の SVG ファイル名。domain 未指定時のフォールバック */
  icon?: string
}

// ==========================================
// レジストリ定義
// ==========================================

export const REGISTRY: TechEntry[] = [
  // ---- Ad Networks ----
  { name: 'Prebid.js',                 category: 'ad_network',   confidence: 'high',   domain: 'prebid.org',             checks: [{ type: 'script_url', patterns: [/prebid/i, /pbjs/i] }] },
  { name: 'Dable',                     category: 'ad_network',   confidence: 'high',   domain: 'dable.io',               checks: [{ type: 'script_url', patterns: [/ad\.dable\.io/i, /dable\.io\/[^/]+\/dable\.js/i] }] },
  { name: 'Amazon Publisher Services', category: 'ad_network',   confidence: 'high',   domain: 'amazon.com',             checks: [{ type: 'script_url', patterns: [/amazon-adsystem\.com\/aax2\/apstag/i] }] },
  { name: 'Taboola',                   category: 'ad_network',   confidence: 'high',   domain: 'taboola.com',            checks: [{ type: 'script_url', patterns: [/cdn\.taboola\.com/i] }] },
  { name: 'Outbrain',                  category: 'ad_network',   confidence: 'high',   domain: 'outbrain.com',           checks: [{ type: 'script_url', patterns: [/widgets\.outbrain\.com/i] }] },
  { name: 'Criteo',                    category: 'ad_network',   confidence: 'high',   domain: 'criteo.com',             checks: [{ type: 'script_url', patterns: [/static\.criteo\.net/i, /criteo\.com\/js/i] }] },
  { name: 'Criteo OneTag',             category: 'ad_network',   confidence: 'high',   domain: 'criteo.com',             checks: [{ type: 'global', name: 'Criteo OneTag' }] },
  { name: 'Index Exchange',            category: 'ad_network',   confidence: 'high',   domain: 'indexexchange.com',      checks: [{ type: 'script_url', patterns: [/indexexchange\.com/i, /casalemedia\.com/i] }] },
  { name: 'Magnite',                   category: 'ad_network',   confidence: 'high',   domain: 'magnite.com',            checks: [{ type: 'script_url', patterns: [/rubiconproject\.com/i, /magnite\.com/i] }] },
  { name: 'Xandr',                     category: 'ad_network',   confidence: 'high',   domain: 'xandr.com',              checks: [{ type: 'script_url', patterns: [/acdn\.adnxs\.com/i, /xandr\.com/i] }] },
  { name: 'OpenX',                     category: 'ad_network',   confidence: 'high',   domain: 'openx.com',              checks: [{ type: 'script_url', patterns: [/\.openx\.net/i] }] },
  { name: 'Yahoo SSP',                 category: 'ad_network',   confidence: 'medium', domain: 'yahoo.co.jp',            checks: [{ type: 'script_url', patterns: [/s\.yimg\.com\/rq\/darla/i] }] },
  { name: 'PubMatic',                  category: 'ad_network',   confidence: 'high',   domain: 'pubmatic.com',           checks: [{ type: 'script_url', patterns: [/ads\.pubmatic\.com/i, /pubmatic\.com\/AdServer/i] }] },
  { name: 'Triplelift',                category: 'ad_network',   confidence: 'high',   domain: 'triplelift.com',         checks: [{ type: 'script_url', patterns: [/cdn\.3lift\.com/i] }] },
  { name: 'ShareThrough',              category: 'ad_network',   confidence: 'high',   domain: 'sharethrough.com',       checks: [{ type: 'script_url', patterns: [/native\.sharethrough\.com/i] }] },
  { name: 'Sovrn',                     category: 'ad_network',   confidence: 'high',   domain: 'sovrn.com',              checks: [{ type: 'script_url', patterns: [/ap\.lijit\.com/i, /sovrn\.com/i] }] },
  { name: 'DistrictM',                 category: 'ad_network',   confidence: 'high',                                     checks: [{ type: 'script_url', patterns: [/districtm\.ca/i, /districtm\.io/i] }] },
  { name: 'Teads',                     category: 'ad_network',   confidence: 'high',   domain: 'teads.com',              checks: [{ type: 'script_url', patterns: [/teads\.tv/i, /teads\.com/i] }] },
  { name: 'SmartAdServer',             category: 'ad_network',   confidence: 'high',   domain: 'smartadserver.com',      checks: [{ type: 'script_url', patterns: [/smartadserver\.com/i] }] },
  { name: 'Media.net',                 category: 'ad_network',   confidence: 'high',   domain: 'media.net',              checks: [{ type: 'script_url', patterns: [/media\.net\/js\//i] }] },
  { name: 'Browsi',                    category: 'ad_network',   confidence: 'high',   domain: 'browsi.com',             checks: [{ type: 'script_url', patterns: [/browsiprod\.com/i, /browsi\.com/i] }, { type: 'global', name: 'Browsi' }] },
  { name: 'Logly Lift',               category: 'ad_network',   confidence: 'high',   domain: 'logly.co.jp',            checks: [{ type: 'script_url', patterns: [/logly\.co\.jp\/lift_widget\.js/i] }] },
  { name: 'GeoEdge',                  category: 'security',     confidence: 'high',   domain: 'geoedge.be',             checks: [{ type: 'script_url', patterns: [/geoedge\.be/i, /rumcdn\.geoedge\.be/i] }] },
  { name: 'PubX.ai',                  category: 'ad_network',   confidence: 'high',   domain: 'pbxai.com',              checks: [{ type: 'script_url', patterns: [/cdn\.pbxai\.com/i, /floor\.pbxai\.com/i] }, { type: 'global', name: 'PubX.ai' }] },
  { name: 'AnyMind',                  category: 'ad_network',   confidence: 'high',   domain: 'anymindgroup.com',       checks: [{ type: 'script_url', patterns: [/anymind360\.com\/js\//i] }] },
  { name: 'Geniee',                   category: 'ad_network',   confidence: 'high',   domain: 'geniee.co.jp',           checks: [{ type: 'script_url', patterns: [/geniee\.jp/i] }] },
  { name: 'AdPushup',                  category: 'ad_network',   confidence: 'high',   domain: 'adpushup.com',           checks: [{ type: 'script_url', patterns: [/cdn\.adpushup\.com/i] }] },
  { name: 'Truvid',                    category: 'ad_network',   confidence: 'high',   domain: 'truvid.com',             checks: [{ type: 'script_url', patterns: [/trvdp\.com/i] }] },
  { name: 'Flux',                      category: 'ad_network',   confidence: 'high',   domain: 'flux.jp',                checks: [{ type: 'script_url', patterns: [/flux-cdn\.com/i] }] },
  { name: 'GliaCloud',                 category: 'ad_network',   confidence: 'high',   domain: 'gliacloud.com',           checks: [{ type: 'script_url', patterns: [/player\.gliacloud\.com/i] }] },
  { name: 'Aniview',                   category: 'ad_network',   confidence: 'high',   domain: 'aniview.com',             checks: [{ type: 'script_url', patterns: [/aniview\.com/i] }] },
  { name: 'fluct',                     category: 'ad_network',   confidence: 'high',   domain: 'fluct.co.jp',            checks: [{ type: 'script_url', patterns: [/fam\.adingo\.jp/i, /adingo\.jp\/bid-strap/i] }, { type: 'global', name: 'fluct' }] },
  { name: 'fluct-one',                 category: 'tag_manager',  confidence: 'high',   domain: 'fluct.co.jp',            checks: [{ type: 'global', name: 'fluctOneScript' }] },
  { name: 'Adingo',                    category: 'ad_network',   confidence: 'high',   domain: 'adingo.jp',              checks: [{ type: 'script_url', patterns: [/cdn\.sx\.adingo\.jp/i, /one\.adingo\.jp/i] }] },
  { name: 'Facebook Pixel',            category: 'ad_network',   confidence: 'high',   domain: 'facebook.com',           checks: [{ type: 'global', name: 'Facebook Pixel' }] },
  { name: 'X (Twitter) Ads',           category: 'ad_network',   confidence: 'high',   domain: 'x.com',                  checks: [{ type: 'global', name: 'X (Twitter) Ads' }] },
  { name: 'TikTok Pixel',              category: 'ad_network',   confidence: 'high',   domain: 'tiktok.com',             checks: [{ type: 'global', name: 'TikTok Pixel' }] },
  { name: 'LinkedIn Insight Tag',      category: 'ad_network',   confidence: 'high',   domain: 'linkedin.com',           checks: [{ type: 'global', name: 'LinkedIn Insight Tag' }] },
  { name: 'Pinterest Tag',             category: 'ad_network',   confidence: 'high',   domain: 'pinterest.com',          checks: [{ type: 'global', name: 'Pinterest Tag' }] },
  { name: 'Snapchat Pixel',            category: 'ad_network',   confidence: 'high',   domain: 'snapchat.com',           checks: [{ type: 'global', name: 'Snapchat Pixel' }] },
  { name: 'Google Publisher Tag',      category: 'ad_network',   confidence: 'high',   domain: 'google.com',             checks: [{ type: 'global', name: 'Google Publisher Tag' }] },
  { name: 'DoubleClick Floodlight',    category: 'ad_network',   confidence: 'high',   domain: 'google.com',             checks: [{ type: 'global', name: 'DoubleClick Floodlight' }] },

  // ---- Analytics ----
  { name: 'Google Analytics',          category: 'analytics',    confidence: 'high',   domain: 'google.com',             checks: [
    { type: 'script_url', patterns: [/google-analytics\.com\/analytics\.js/i, /googletagmanager\.com\/gtag\/js/i] },
    { type: 'global', name: 'Google Analytics' },
  ] },
  { name: 'Google Analytics (UA)',     category: 'analytics',    confidence: 'high',   domain: 'google.com',             checks: [{ type: 'global', name: 'Google Analytics (UA)' }] },
  { name: 'Adobe Analytics',           category: 'analytics',    confidence: 'high',   domain: 'adobe.com',              checks: [
    { type: 'script_url', patterns: [/\.sc\.omtrdc\.net/i, /omniture/i] },
    { type: 'global', name: 'Adobe Analytics' },
  ] },
  { name: 'Matomo Analytics',          category: 'analytics',    confidence: 'high',   domain: 'matomo.org',             checks: [
    { type: 'script_url', patterns: [/matomo\.js/i, /piwik\.js/i] },
    { type: 'global', name: 'Matomo Analytics' },
  ] },
  { name: 'Chartbeat',                 category: 'analytics',    confidence: 'high',   domain: 'chartbeat.com',          checks: [
    { type: 'script_url', patterns: [/static\.chartbeat\.com/i] },
    { type: 'global', name: 'Chartbeat' },
  ] },
  { name: 'Quantcast',                 category: 'analytics',    confidence: 'high',   domain: 'quantcast.com',          checks: [{ type: 'script_url', patterns: [/quantserve\.com\/quant\.js/i] }] },
  { name: 'Nielsen',                   category: 'analytics',    confidence: 'high',   domain: 'nielsen.com',            checks: [{ type: 'script_url', patterns: [/scorecardresearch\.com/i, /nielsen\.com\/stats/i] }] },
  { name: 'Heap',                      category: 'analytics',    confidence: 'high',   domain: 'heap.io',                checks: [{ type: 'script_url', patterns: [/cdn\.heapanalytics\.com/i] }] },
  { name: 'Mixpanel',                  category: 'analytics',    confidence: 'high',   domain: 'mixpanel.com',           checks: [{ type: 'script_url', patterns: [/cdn\.mxpnl\.com/i, /cdn\.mixpanel\.com/i] }] },
  { name: 'Amplitude',                 category: 'analytics',    confidence: 'high',   domain: 'amplitude.com',          checks: [{ type: 'script_url', patterns: [/cdn\.amplitude\.com/i] }] },

  // ---- Tag Managers ----
  { name: 'Google Tag Manager',        category: 'tag_manager',  confidence: 'high',   domain: 'google.com',             checks: [
    { type: 'script_url', patterns: [/googletagmanager\.com\/gtm\.js/i] },
    { type: 'global', name: 'Google Tag Manager' },
  ] },
  { name: 'Adobe Launch',              category: 'tag_manager',  confidence: 'high',   domain: 'adobe.com',              checks: [
    { type: 'script_url', patterns: [/assets\.adobedtm\.com/i] },
    { type: 'global', name: 'Adobe Experience Platform Launch' },
  ] },
  { name: 'Tealium',                   category: 'tag_manager',  confidence: 'high',   domain: 'tealium.com',            checks: [
    { type: 'script_url', patterns: [/tags\.tiqcdn\.com/i] },
    { type: 'global', name: 'Tealium' },
  ] },

  // ---- CDN ----
  { name: 'Cloudflare',                category: 'cdn',          confidence: 'high',   domain: 'cloudflare.com',         checks: [
    { type: 'global', name: 'Cloudflare' },
    { type: 'script_url', patterns: [/cdnjs\.cloudflare\.com/i] },
  ] },
  { name: 'cdnjs',                     category: 'cdn',          confidence: 'high',   domain: 'cloudflare.com',         checks: [{ type: 'script_url', patterns: [/cdnjs\.cloudflare\.com/i] }] },
  { name: 'jsDelivr',                  category: 'cdn',          confidence: 'high',   domain: 'jsdelivr.net',           checks: [{ type: 'script_url', patterns: [/cdn\.jsdelivr\.net/i] }] },
  { name: 'unpkg',                     category: 'cdn',          confidence: 'high',                                     checks: [{ type: 'script_url', patterns: [/unpkg\.com\//i] }] },
  { name: 'Fastly',                    category: 'cdn',          confidence: 'medium', domain: 'fastly.com',             checks: [{ type: 'script_url', patterns: [/\.fastly\.net/i] }] },

  // ---- CMS ----
  { name: 'WordPress',                 category: 'cms',          confidence: 'high',   domain: 'wordpress.org',          checks: [
    { type: 'script_url', patterns: [/\/wp-content\//i, /\/wp-includes\//i] },
    { type: 'dom', selector: 'link[href*="/wp-content/"]' },
    { type: 'meta', name: 'generator', contentPattern: /WordPress/i },
    { type: 'global', name: 'WordPress' },
  ] },
  { name: 'Drupal',                    category: 'cms',          confidence: 'high',   domain: 'drupal.org',             checks: [
    { type: 'script_url', patterns: [/\/sites\/default\/files/i, /drupal\.js/i] },
    { type: 'meta', name: 'generator', contentPattern: /Drupal/i },
    { type: 'global', name: 'Drupal' },
  ] },
  { name: 'Joomla',                    category: 'cms',          confidence: 'high',   domain: 'joomla.org',             checks: [
    { type: 'meta', name: 'generator', contentPattern: /Joomla/i },
    { type: 'global', name: 'Joomla' },
  ] },

  // ---- Frontend Frameworks ----
  { name: 'Next.js',                   category: 'frontend_framework', confidence: 'high', domain: 'nextjs.org',         checks: [{ type: 'global', name: 'Next.js' }] },
  { name: 'Nuxt.js',                   category: 'frontend_framework', confidence: 'high', domain: 'nuxt.com',           checks: [{ type: 'global', name: 'Nuxt.js' }] },
  { name: 'Gatsby',                    category: 'frontend_framework', confidence: 'high', domain: 'gatsbyjs.com',       checks: [{ type: 'global', name: 'Gatsby' }] },

  // ---- JS Libraries ----
  { name: 'jQuery',                    category: 'js_library',   confidence: 'high',   domain: 'jquery.com',             checks: [
    { type: 'script_url', patterns: [/jquery[.-][\d.]+(?:\.min)?\.js/i, /\/jquery\/[\d.]+\//i] },
    { type: 'global', name: 'jQuery' },
  ] },
  { name: 'React',                     category: 'js_library',   confidence: 'high',   domain: 'react.dev',              checks: [
    { type: 'script_url', patterns: [/react(?:\.development|\.production\.min)?\.js/i, /\/react@[\d.]+\//i] },
    { type: 'global', name: 'React' },
  ] },
  { name: 'Vue.js',                    category: 'js_library',   confidence: 'high',   domain: 'vuejs.org',              checks: [
    { type: 'script_url', patterns: [/vue(?:\.min)?\.js/i, /\/vue@[\d.]+\//i] },
    { type: 'global', name: 'Vue.js' },
  ] },
  { name: 'Lodash',                    category: 'js_library',   confidence: 'high',   domain: 'lodash.com',             checks: [{ type: 'script_url', patterns: [/lodash(?:\.min)?\.js/i, /\/lodash@[\d.]+\//i] }] },
  { name: 'Preact',                    category: 'js_library',   confidence: 'high',   domain: 'preactjs.com',           checks: [{ type: 'global', name: 'Preact' }] },
  { name: 'Goober',                    category: 'js_library',   confidence: 'high',                                     checks: [{ type: 'global', name: 'Goober' }] },

  // ---- Marketing Automation ----
  { name: 'HubSpot',                   category: 'marketing_automation', confidence: 'high', domain: 'hubspot.com',      checks: [
    { type: 'script_url', patterns: [/js\.hubspot\.com/i, /hs-scripts\.com/i, /hs-analytics\.net/i] },
    { type: 'global', name: 'HubSpot' },
  ] },
  { name: 'Marketo',                   category: 'marketing_automation', confidence: 'high', domain: 'marketo.com',      checks: [
    { type: 'script_url', patterns: [/munchkin\.marketo\.net/i] },
    { type: 'global', name: 'Marketo' },
  ] },
  { name: 'Eloqua',                    category: 'marketing_automation', confidence: 'high', domain: 'oracle.com',       checks: [{ type: 'script_url', patterns: [/img\.en25\.com/i, /eloqua\.com/i] }] },

  // ---- Personalization ----
  { name: 'Piano',                     category: 'personalization', confidence: 'high', domain: 'piano.io',              checks: [
    { type: 'script_url', patterns: [/cdn\.tinypass\.com/i, /experience\.tinypass\.com/i, /piano\.io/i] },
    { type: 'global', name: 'Piano' },
  ] },
  { name: 'Cxense',                    category: 'personalization', confidence: 'high', domain: 'cxense.com',            checks: [
    { type: 'script_url', patterns: [/scdn\.cxense\.com/i, /cxense\.com/i] },
    { type: 'global', name: 'Cxense' },
  ] },
  { name: 'Permutive',                 category: 'personalization', confidence: 'high', domain: 'permutive.com',         checks: [
    { type: 'script_url', patterns: [/permutive\.com/i] },
    { type: 'global', name: 'Permutive' },
  ] },

  // ---- CDP ----
  { name: 'Segment',                   category: 'cdp',          confidence: 'high',   domain: 'segment.com',            checks: [{ type: 'global', name: 'Segment' }] },
  { name: 'mParticle',                 category: 'cdp',          confidence: 'high',   domain: 'mparticle.com',          checks: [{ type: 'global', name: 'mParticle' }] },
  { name: 'Adobe Experience Platform', category: 'cdp',          confidence: 'high',   domain: 'adobe.com',              checks: [{ type: 'global', name: 'Adobe Experience Platform' }] },

  // ---- Cookie Consent ----
  { name: 'OneTrust',                  category: 'cookie_consent', confidence: 'high', domain: 'onetrust.com',           checks: [
    { type: 'script_url', patterns: [/cdn\.cookielaw\.org/i, /optanon/i] },
    { type: 'global', name: 'OneTrust' },
  ] },
  { name: 'Cookiebot',                 category: 'cookie_consent', confidence: 'high', domain: 'cookiebot.com',          checks: [
    { type: 'script_url', patterns: [/consent\.cookiebot\.com/i] },
    { type: 'global', name: 'Cookiebot' },
  ] },
  { name: 'TrustArc',                  category: 'cookie_consent', confidence: 'high', domain: 'trustarc.com',           checks: [
    { type: 'script_url', patterns: [/consent\.trustarc\.com/i] },
    { type: 'global', name: 'TrustArc' },
  ] },
  { name: 'Google Funding Choices',    category: 'cookie_consent', confidence: 'high', domain: 'google.com',             checks: [
    { type: 'script_url', patterns: [/fcnsp\.googlesyndication\.com/i, /fundingchoicesmessages\.google\.com/i] },
    { type: 'global', name: 'Google Funding Choices' },
  ] },

  // ---- Security ----
  { name: 'Google reCAPTCHA',          category: 'security',     confidence: 'high',   domain: 'google.com',             checks: [
    { type: 'script_url', patterns: [/google\.com\/recaptcha/i, /recaptcha\/api\.js/i] },
    { type: 'global', name: 'Google reCAPTCHA' },
  ] },
  { name: 'hCaptcha',                  category: 'security',     confidence: 'high',   domain: 'hcaptcha.com',           checks: [
    { type: 'script_url', patterns: [/hcaptcha\.com/i] },
    { type: 'global', name: 'hCaptcha' },
  ] },
  { name: 'Cloudflare Turnstile',      category: 'security',     confidence: 'high',   domain: 'cloudflare.com',         checks: [
    { type: 'script_url', patterns: [/challenges\.cloudflare\.com\/turnstile/i] },
    { type: 'global', name: 'Cloudflare Turnstile' },
  ] },

  // ---- Widget / Live Chat ----
  { name: 'Intercom',                  category: 'widget',       confidence: 'high',   domain: 'intercom.com',           checks: [
    { type: 'script_url', patterns: [/widget\.intercom\.io/i] },
    { type: 'global', name: 'Intercom' },
  ] },
  { name: 'Drift',                     category: 'widget',       confidence: 'high',   domain: 'drift.com',              checks: [
    { type: 'script_url', patterns: [/js\.driftt\.com/i] },
    { type: 'global', name: 'Drift' },
  ] },
  { name: 'Zendesk',                   category: 'widget',       confidence: 'high',   domain: 'zendesk.com',            checks: [
    { type: 'script_url', patterns: [/static\.zdassets\.com/i] },
    { type: 'global', name: 'Zendesk' },
  ] },
  { name: 'Tawk.to',                   category: 'widget',       confidence: 'high',   domain: 'tawk.to',                checks: [
    { type: 'script_url', patterns: [/embed\.tawk\.to/i] },
    { type: 'global', name: 'Tawk.to' },
  ] },
  { name: 'HubSpot Chat',              category: 'widget',       confidence: 'high',   domain: 'hubspot.com',            checks: [{ type: 'global', name: 'HubSpot Chat' }] },

  // ---- Other ----
  { name: 'Open Graph',                category: 'other',        confidence: 'high',   checks: [{ type: 'dom', selector: 'meta[property^="og:"]' }] },
  { name: 'Twitter Card',              category: 'other',        confidence: 'high',   checks: [{ type: 'dom', selector: 'meta[name^="twitter:"]' }] },
  { name: 'Priority Hints',            category: 'other',        confidence: 'high',   checks: [{ type: 'dom', selector: '[fetchpriority]' }] },
  { name: 'Service Worker',            category: 'other',        confidence: 'medium', checks: [{ type: 'dom', selector: 'link[rel="serviceworker"], link[rel="manifest"]' }] },
]

/** 技術名からレジストリエントリを引く */
export function getTechEntry(name: string): TechEntry | undefined {
  return REGISTRY.find((e) => e.name === name)
}
