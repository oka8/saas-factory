'use client'

import Link from 'next/link'

export default function DocsPage() {
  const sections = [
    {
      title: 'はじめに',
      items: [
        { title: 'SaaS Factory とは', href: '#what-is' },
        { title: 'クイックスタート', href: '#quickstart' },
        { title: 'システム要件', href: '#requirements' }
      ]
    },
    {
      title: 'チュートリアル',
      items: [
        { title: '初回プロジェクト作成', href: '#first-project' },
        { title: 'カテゴリの選び方', href: '#categories' },
        { title: 'デプロイ方法', href: '#deployment' }
      ]
    },
    {
      title: 'API リファレンス',
      items: [
        { title: 'プロジェクト API', href: '#project-api' },
        { title: '生成 API', href: '#generation-api' },
        { title: '認証', href: '#authentication' }
      ]
    },
    {
      title: 'よくある質問',
      items: [
        { title: 'トラブルシューティング', href: '#troubleshooting' },
        { title: 'パフォーマンス最適化', href: '#performance' },
        { title: 'セキュリティ', href: '#security' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ドキュメント
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              SaaS Factory の使い方、API リファレンス、ベストプラクティスを学びましょう。
            </p>
            <div className="flex justify-center items-center gap-4">
              <Link
                href="/demo"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                デモを試す
              </Link>
              <Link
                href="#quickstart"
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg font-medium border border-gray-300 transition-colors"
              >
                クイックスタート
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <nav className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">目次</h2>
                <div className="space-y-6">
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {section.title}
                      </h3>
                      <ul className="space-y-1">
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            <a
                              href={item.href}
                              className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                            >
                              {item.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </nav>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-8 prose prose-gray max-w-none">
                {/* はじめに */}
                <section id="what-is" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">SaaS Factory とは</h2>
                  <p className="text-gray-600 mb-4">
                    SaaS Factory は、自然言語での記述から完動する SaaS アプリケーションを自動生成する AI 駆動の開発プラットフォームです。
                    従来の開発プロセスを大幅に短縮し、誰でも簡単に本格的な Web アプリケーションを構築できます。
                  </p>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">主な特徴</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                    <li>Claude AI による高精度なコード生成</li>
                    <li>React + Next.js + TypeScript のモダンスタック</li>
                    <li>ADHD 配慮の開発体験</li>
                    <li>Vercel への自動デプロイ</li>
                    <li>完全なコードオーナーシップ</li>
                  </ul>
                </section>

                {/* クイックスタート */}
                <section id="quickstart" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">クイックスタート</h2>
                  <p className="text-gray-600 mb-6">
                    5分で最初の SaaS アプリケーションを作成しましょう。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">ステップ 1: アカウント作成</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-600">
                      <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700">アカウント作成ページ</Link>
                      から無料アカウントを作成します。クレジットカードは不要です。
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">ステップ 2: プロジェクト作成</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <ol className="list-decimal list-inside text-gray-600 space-y-2">
                      <li>ダッシュボードから「新しいプロジェクト」をクリック</li>
                      <li>プロジェクト名とアイディアを自然な日本語で記述</li>
                      <li>カテゴリを選択（CRM、CMS、TODO など）</li>
                      <li>「SaaS生成開始」ボタンをクリック</li>
                    </ol>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">ステップ 3: デプロイ</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-gray-600">
                      生成が完了したら「デプロイ」ボタンから Vercel に自動デプロイできます。
                      数分で本番環境にアクセス可能になります。
                    </p>
                  </div>
                </section>

                {/* システム要件 */}
                <section id="requirements" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">システム要件</h2>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">ブラウザ要件</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                    <li>Chrome 90+ （推奨）</li>
                    <li>Firefox 88+</li>
                    <li>Safari 14+</li>
                    <li>Edge 90+</li>
                  </ul>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">デプロイ要件</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1 mb-6">
                    <li>Vercel アカウント（無料）</li>
                    <li>GitHub アカウント（推奨）</li>
                    <li>Supabase アカウント（データベース使用時）</li>
                  </ul>
                </section>

                {/* 初回プロジェクト作成 */}
                <section id="first-project" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">初回プロジェクト作成</h2>
                  <p className="text-gray-600 mb-4">
                    効果的なプロジェクトの記述方法とコツを解説します。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">良い記述例</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-green-800 whitespace-pre-wrap">{`小規模な美容院向けの顧客管理システムを作りたい。

主な機能：
• お客さんの基本情報（名前、電話、メール）の登録・編集
• 来店履歴と施術内容の記録
• 次回予約の日時とメニュー管理
• 簡単な売上集計レポート

デザイン：
• シンプルで清潔感のあるデザイン
• ブルーとホワイトを基調とした配色
• タブレットでも使いやすいように大きなボタン`}</pre>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">避けるべき記述例</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <pre className="text-sm text-red-800 whitespace-pre-wrap">{`システムを作って`}</pre>
                    <p className="text-red-600 text-sm mt-2">
                      × 曖昧すぎて要件が理解できません
                    </p>
                  </div>
                </section>

                {/* API リファレンス */}
                <section id="project-api" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">プロジェクト API</h2>
                  <p className="text-gray-600 mb-4">
                    外部システムとの連携や、カスタム管理画面の構築に使用できる REST API です。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">プロジェクト一覧取得</h3>
                  <div className="bg-gray-100 rounded-lg p-4 mb-4">
                    <pre className="text-sm"><code>{`GET /api/projects
Authorization: Bearer {your-api-key}

Response:
{
  "success": true,
  "data": [
    {
      "id": "project-123",
      "title": "美容院管理システム",
      "status": "completed",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}`}</code></pre>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3">プロジェクト生成</h3>
                  <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <pre className="text-sm"><code>{`POST /api/projects/generate
Authorization: Bearer {your-api-key}
Content-Type: application/json

{
  "project_id": "project-123",
  "project_data": {
    "title": "タスク管理アプリ",
    "description": "チーム向けのタスク管理ツール",
    "category": "todo"
  }
}`}</code></pre>
                  </div>
                </section>

                {/* トラブルシューティング */}
                <section id="troubleshooting" className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">トラブルシューティング</h2>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">よくある問題と解決方法</h3>
                  
                  <div className="space-y-6">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        プロジェクト生成が途中で止まる
                      </h4>
                      <p className="text-gray-600 mb-2">
                        原因：ネットワーク接続の問題や、複雑すぎる要件
                      </p>
                      <p className="text-gray-600">
                        解決法：ページをリロードして再度実行。要件を簡潔に整理してから再試行。
                      </p>
                    </div>
                    
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        デプロイが失敗する
                      </h4>
                      <p className="text-gray-600 mb-2">
                        原因：Vercel の権限設定や環境変数の問題
                      </p>
                      <p className="text-gray-600">
                        解決法：Vercel アカウントの連携を確認。環境変数が正しく設定されているか確認。
                      </p>
                    </div>
                  </div>
                </section>

                {/* サポート */}
                <section className="mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">サポート</h2>
                  <p className="text-gray-600 mb-4">
                    追加のヘルプが必要な場合は、以下の方法でお問い合わせください：
                  </p>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>
                      <Link href="/contact" className="text-blue-600 hover:text-blue-700">
                        お問い合わせフォーム
                      </Link>
                    </li>
                    <li>メール: support@saas-factory.com</li>
                    <li>Discord コミュニティ（プロプラン以上）</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}