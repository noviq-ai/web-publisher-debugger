export const ja = {
  title: 'Pubsight',
  subtitle: '設定',

  ai: {
    heading: 'AIアシスタント',
    description: '分析に使用するAIプロバイダーを設定',
    privacy: {
      title: 'プライバシー優先設計',
      body: 'すべてのAI処理はブラウザとAIプロバイダー間で直接行われます。APIキーやページデータが当社のサーバーに送信されることはありません。',
    },
    provider: {
      label: 'AIプロバイダー',
      placeholder: 'プロバイダーを選択',
      browser: 'ブラウザAI（Gemini Nano）',
      browserDescription: 'Chrome組み込みAIを使用します。APIキー不要ですが、Chrome AIの機能を有効にする必要があります。',
      anthropic: 'Anthropic（Claude）',
      openai: 'OpenAI（GPT）',
    },
    claudeApiKey: {
      label: 'Claude APIキー',
      description: 'APIキーの取得先：',
      linkText: 'Anthropic Console',
    },
    openaiApiKey: {
      label: 'OpenAI APIキー',
      description: 'APIキーの取得先：',
      linkText: 'OpenAI Platform',
    },
  },

  general: {
    heading: '一般',
    description: '一般設定',
    defaultTab: {
      label: 'デフォルトタブ',
      placeholder: 'デフォルトタブを選択',
      description: '拡張機能を開いた時に表示するタブ',
      options: {
        ai: 'AIアシスタント',
        seo: 'SEO',
        adtech: 'AdTech',
        tracking: 'トラッキング',
      },
    },
  },

  features: {
    heading: '有効な機能',
    description: '有効にするデータコレクターを選択',
    items: {
      enableAdTech: { label: 'AdTech', description: 'Prebid.jsとGoogle Publisher Tagの監視' },
      enableGtm: { label: 'GTM', description: 'Google Tag ManagerとdataLayerの監視' },
      enableSeo: { label: 'SEO', description: 'メタタグ、OGP、構造化データの分析' },
      enableAnalytics: { label: 'アナリティクス', description: 'GA4とトラッキングピクセルの監視' },
    },
  },

  saveButton: '設定を保存',
  saved: '保存しました！',
}
