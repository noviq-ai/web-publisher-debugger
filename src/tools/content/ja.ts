export const ja = {
  title: 'AIツールリファレンス',

  overview: 'AIアシスタントは以下の定義済みツールを使用して、現在のページからデータを収集・分析します。ツールは質問内容に応じて自動的に呼び出されます — 手動で選択する必要はありません。',

  dataCollection: {
    heading: 'データ収集',
    description: 'ページからデータを収集するツール。',
  },

  dynamicQueries: {
    heading: 'ダイナミッククエリ',
    description: 'Prebid.jsのデータをリアルタイムでクエリし、より深い分析を行うツール。',
  },

  labels: {
    parameters: 'パラメータ：',
    useCase: '使用例：',
  },

  tools: {
    getTrackingOverview: {
      description: 'トラッキング実装（GTM、GA4、ピクセル）の概要を取得します。',
      useCase: 'ページにどのようなトラッキングがあるか広く質問された場合。',
    },
    getGtmData: {
      description: 'GTM（Google Tag Manager）の詳細を取得します。コンテナ情報、dataLayerイベント、発火したタグ、変数を含みます。',
      useCase: 'GTMやdataLayerについて質問された場合。',
    },
    getGa4Data: {
      description: 'GA4（Google Analytics 4）の詳細を取得します。測定ID、イベント、同意ステータス、設定を含みます。',
      useCase: 'GA4やアナリティクスイベントについて質問された場合。',
    },
    getPixelData: {
      description: 'Meta、Twitter/X、TikTok、LinkedIn、Pinterest、Criteo、Snapchatのマーケティングピクセルデータを取得します。',
      useCase: 'マーケティングピクセルやコンバージョントラッキングについて質問された場合。',
    },
    getSeoData: {
      description: 'SEOメタデータと問題点を取得します。メタタグ、OGP、Twitter Card、構造化データ、見出し、検出された問題を含みます。',
      useCase: 'SEOやページメタデータについて質問された場合。',
    },
    getAdtechData: {
      description: 'Prebid.jsヘッダービディングデータを取得します。設定、ビッダー、広告ユニット、オークション結果、落札入札を含みます。',
      useCase: 'ヘッダービディングや広告設定について質問された場合。',
    },
    diagnoseBidder: {
      description: '特定のPrebidビッダーのパフォーマンスをリアルタイムで診断します。入札率、タイムアウト率、勝率、平均CPM、レスポンス時間、特定された問題を返します。',
      useCase: '特定のビッダーが応答しない、またはパフォーマンスが低い場合。',
    },
    analyzeAdUnit: {
      description: '特定のPrebid広告ユニットをリアルタイムで分析します。設定されたビッダー、入札レスポンス、ノービッド、最高入札額、勝者を返します。',
      useCase: '特定の広告スロットの詳細情報が必要な場合。',
    },
    queryPrebidEvents: {
      description: 'Prebidイベント履歴をクエリします。サマリー付きのイベントタイムラインを返します。',
      useCase: 'オークションのタイムラインを理解したり、問題をデバッグする必要がある場合。',
    },
  },
}
