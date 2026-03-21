export const ja = {
  title: 'ヘルプ・ドキュメント',
  backToSettings: '設定に戻る',

  sections: {
    overview: {
      title: '概要',
      content: `Web Publisher Debuggerは、ウェブパブリッシャーがページのデバッグと分析を行うためのChrome拡張機能です。AdTech、SEO、トラッキング実装のリアルタイム分析を提供します。`
    },

    aiAssistant: {
      title: 'AIアシスタント',
      description: 'AIによるインテリジェントな分析と推奨事項を取得できます。',
      items: [
        {
          title: '仕組み',
          content: 'AIアシスタントは拡張機能が収集したページデータを分析し、実用的な洞察を提供します。実装に関する質問や特定の分析をリクエストできます。'
        },
        {
          title: 'プライバシー',
          content: 'すべてのAI通信はブラウザとAIプロバイダー（AnthropicまたはOpenAI）間で直接行われます。データやAPIキーが当社のサーバーに送信されることはありません。'
        },
        {
          title: '対応プロバイダー',
          content: '現在、Chrome組み込みAI（Gemini Nano）、Anthropic Claude、OpenAI GPTモデルに対応しています。ブラウザAIはAPIキー不要で利用できます。その他のプロバイダーは設定でAPIキーの設定が必要です。'
        },
        {
          title: '利用可能なツール',
          content: 'AIアシスタントはページデータの収集・分析のための定義済みツールにアクセスできます。各ツールの詳細とパラメータについては tools.html をご覧ください。'
        }
      ]
    },

    seo: {
      title: 'SEO分析',
      description: 'メタタグ、Open Graph、構造化データなどを分析します。',
      items: [
        {
          title: 'メタタグ',
          content: 'タイトル、ディスクリプション、ビューポート、robots指示などの重要なメタタグを表示・検証します。'
        },
        {
          title: 'Open Graph',
          content: 'ソーシャルメディア共有プレビュー用のOpen Graphタグを確認します。og:title、og:description、og:imageなどを含みます。'
        },
        {
          title: '構造化データ',
          content: 'ページ上のJSON-LD構造化データを検査します。リッチ検索結果のためのschema.orgマークアップを検証します。'
        }
      ]
    },

    adtech: {
      title: 'AdTechモニタリング',
      description: 'Prebid.jsとGoogle Publisher Tagの実装をデバッグします。',
      items: [
        {
          title: 'Prebid.js',
          content: 'Prebid.jsの入札リクエストとレスポンスを監視します。ビッダー設定、タイムアウト、落札入札を確認できます。'
        },
        {
          title: 'Google Publisher Tag (GPT)',
          content: 'GPTスロット定義、ターゲティング、広告レンダリングイベントを追跡します。スロットレベルの設定とパフォーマンスを確認できます。'
        }
      ]
    },

    tracking: {
      title: 'トラッキング・アナリティクス',
      description: 'Google Tag Managerとアナリティクス実装を監視します。',
      items: [
        {
          title: 'Google Tag Manager',
          content: 'dataLayerプッシュをリアルタイムで確認します。GTMコンテナのロードとタグ発火イベントを監視します。'
        },
        {
          title: 'Google Analytics 4',
          content: 'GA4イベントとパラメータを追跡します。測定ID、クライアントID、イベントデータを確認できます。'
        },
        {
          title: 'トラッキングピクセル',
          content: 'Facebook、Twitter、LinkedInなど、様々なトラッキングピクセルを検出・監視します。'
        }
      ]
    },

    dataStorage: {
      title: 'データ保存',
      description: 'データの保存と管理方法について。',
      items: [
        {
          title: '設定',
          content: '拡張機能の設定（APIキー、設定）はChromeの同期ストレージに保存され、サインイン時にChrome間で同期されます。'
        },
        {
          title: 'ページデータ',
          content: '収集したページデータは一時的にメモリに保存され、タブを閉じるかページ移動時にクリアされます。'
        },
        {
          title: '外部保存なし',
          content: 'データを外部サーバーに保存することはありません。すべてがブラウザ内に留まります。'
        }
      ]
    },

    permissions: {
      title: '権限',
      description: '拡張機能が特定の権限を必要とする理由。',
      items: [
        {
          title: 'activeTab',
          content: '拡張機能を有効にした際に、現在のタブのコンテンツにアクセスして分析するために必要です。'
        },
        {
          title: 'storage',
          content: '設定と環境設定を保存するために使用されます。'
        },
        {
          title: 'sidePanel',
          content: 'より良いワークフローのために、Chrome側のパネルに拡張機能を表示できるようにします。'
        },
        {
          title: 'host_permissions (all_urls)',
          content: '訪問する任意のウェブサイトを分析するために必要です。拡張機能は開いたときのみ有効になります。'
        }
      ]
    }
  }
}
