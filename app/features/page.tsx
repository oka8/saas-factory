'use client'

import Link from 'next/link'

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: '🤖',
      title: 'AI自動生成',
      description: '自然言語の記述から、完動するSaaSアプリケーションを自動生成',
      details: [
        'Claude AIを活用した高精度な要件理解',
        'フロントエンド・バックエンド・データベースの統合生成',
        'React + TypeScript + Next.jsのモダンスタック',
        'レスポンシブデザイン対応'
      ]
    },
    {
      icon: '⚡',
      title: '高速開発',
      description: '従来数週間かかる開発を、数分で完成させる革新的なスピード',
      details: [
        '要件定義から完成まで平均5分',
        '即座にデプロイ可能な状態で生成',
        'テストケースも自動生成',
        '継続的な改善とアップデート'
      ]
    },
    {
      icon: '🎯',
      title: 'ADHD配慮設計',
      description: '認知負荷を最小化し、集中力を維持しやすい開発体験を実現',
      details: [
        '25分フォーカスセッション',
        '視覚的な進捗表示',
        'シンプルで分かりやすいUI',
        '自動保存機能'
      ]
    },
    {
      icon: '🏗️',
      title: 'モダンアーキテクチャ',
      description: 'スケーラブルで保守しやすいアーキテクチャを自動選択',
      details: [
        'Next.js App Router対応',
        'Supabase統合',
        'Tailwind CSSスタイリング',
        'TypeScript完全対応'
      ]
    },
    {
      icon: '🚀',
      title: 'ワンクリックデプロイ',
      description: 'Vercelへの自動デプロイで、すぐに本番環境へ',
      details: [
        'Vercel連携',
        'GitHub自動連携',
        'カスタムドメイン対応',
        'SSL証明書自動設定'
      ]
    },
    {
      icon: '🔧',
      title: 'カスタマイズ可能',
      description: '生成後のカスタマイズも簡単。コードは完全にオープン',
      details: [
        '生成されたコードの完全な所有権',
        '追加機能の簡単な拡張',
        'デザインのカスタマイズ対応',
        'APIの拡張可能性'
      ]
    }
  ]

  const categories = [
    {
      name: 'CRM・顧客管理',
      description: '顧客情報、営業管理、顧客関係管理システム',
      examples: ['美容院予約管理', '不動産顧客管理', 'コンサル案件管理'],
      icon: '👥'
    },
    {
      name: 'CMS・コンテンツ管理',
      description: 'ブログ、記事管理、コンテンツ配信システム',
      examples: ['企業ブログシステム', 'ドキュメント管理', 'ナレッジベース'],
      icon: '📝'
    },
    {
      name: 'タスク・プロジェクト管理',
      description: 'TODO管理、プロジェクト進捗、チーム管理',
      examples: ['カンバンボード', 'ガントチャート', 'チームダッシュボード'],
      icon: '✅'
    },
    {
      name: '在庫・商品管理',
      description: '在庫追跡、商品管理、注文処理システム',
      examples: ['ECサイト管理', '倉庫管理システム', '商品カタログ'],
      icon: '📦'
    },
    {
      name: 'フォーム・アンケート',
      description: 'データ収集、調査、申し込みフォーム',
      examples: ['アンケートシステム', '申し込みフォーム', '評価システム'],
      icon: '📋'
    },
    {
      name: 'カスタムアプリ',
      description: '特殊要件に対応したオリジナルシステム',
      examples: ['業務管理システム', '専用ツール', 'インテグレーション'],
      icon: '⚙️'
    }
  ]

  const techStack = [
    {
      category: 'フロントエンド',
      technologies: ['React 18', 'Next.js 14', 'TypeScript', 'Tailwind CSS'],
      color: 'bg-blue-100 text-blue-800'
    },
    {
      category: 'バックエンド',
      technologies: ['Next.js API Routes', 'Supabase', 'PostgreSQL', 'Auth'],
      color: 'bg-green-100 text-green-800'
    },
    {
      category: 'デプロイ',
      technologies: ['Vercel', 'GitHub Actions', 'Edge Functions', 'CDN'],
      color: 'bg-purple-100 text-purple-800'
    },
    {
      category: 'AI・機能',
      technologies: ['Claude AI', 'Code Generation', 'Auto Testing', 'SEO'],
      color: 'bg-orange-100 text-orange-800'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              SaaS Factory の特徴
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI駆動の自動生成技術と、ADHD配慮の開発体験で、
              誰でも簡単に本格的なSaaSアプリケーションを構築できます。
            </p>
            <div className="flex justify-center items-center gap-4">
              <Link
                href="/demo"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                デモを体験
              </Link>
              <Link
                href="/auth/signup"
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg font-medium border border-gray-300 transition-colors"
              >
                無料で始める
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* コア機能セクション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            コア機能
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            SaaS Factory が提供する、開発を革新する6つの主要機能
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {feature.description}
              </p>
              <ul className="space-y-2">
                {feature.details.map((detail, detailIndex) => (
                  <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* サポートカテゴリセクション */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              対応カテゴリ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              様々な業界・用途に対応したテンプレートを用意。
              あなたのアイディアに最適なアプリケーションを生成します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                <div className="text-3xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">実装例:</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.examples.map((example, exampleIndex) => (
                      <span
                        key={exampleIndex}
                        className="bg-white px-3 py-1 rounded-full text-sm text-gray-600 border border-gray-200"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 技術スタックセクション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            技術スタック
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            モダンで実績のある技術スタックを組み合わせ、
            スケーラブルで保守しやすいアプリケーションを生成します。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((stack, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {stack.category}
              </h3>
              <div className="space-y-2">
                {stack.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2 ${stack.color}`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 開発フローセクション */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              開発フロー
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              シンプルな3ステップで、アイディアを完動するアプリケーションに
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                アイディア入力
              </h3>
              <p className="text-gray-600">
                自然な日本語でアイディアを記述。
                機能要件、デザイン、技術要件を整理します。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                AI自動生成
              </h3>
              <p className="text-gray-600">
                Claude AIがコード生成。
                フロントエンド、バックエンド、データベース設計まで自動作成。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                デプロイ・運用
              </h3>
              <p className="text-gray-600">
                Vercelへワンクリックデプロイ。
                すぐに本番環境で運用開始できます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA セクション */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今すぐSaaS開発を始めましょう
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            アイディアがあるなら、それをSaaSにする時です。
            無料プランで最初のプロジェクトを作成してみませんか？
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              無料で始める
            </Link>
            <Link
              href="/demo"
              className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              デモを体験
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}