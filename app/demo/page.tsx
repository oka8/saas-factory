'use client'

import Link from 'next/link'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2 inline-block mb-6">
              <span className="text-yellow-800 font-medium">🚀 デモモード</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              SaaS Factory デモ
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              ログイン不要で、SaaS Factoryの機能を体験できます。
              自然な日本語でアイディアを記述するだけで、完動するSaaSアプリケーションを自動生成します。
            </p>
            <Link
              href="/dashboard?demo=true"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              デモを開始
            </Link>
          </div>
        </div>
      </div>

      {/* 特徴セクション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            デモで体験できること
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            実際のプロジェクト生成プロセスを、サンプルデータを使って体験できます
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              プロジェクト管理
            </h3>
            <p className="text-gray-600">
              ダッシュボードで完了済み、生成中、下書きのプロジェクトを確認
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              生成プロセス
            </h3>
            <p className="text-gray-600">
              AI によるコード生成の各段階とログをリアルタイムで確認
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              生成されたコード
            </h3>
            <p className="text-gray-600">
              React コンポーネント、API、データベース設計の確認
            </p>
          </div>
        </div>

        {/* サンプルプロジェクト */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">サンプルプロジェクト</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">美容院予約管理システム</h3>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  完了
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                小規模な美容院向けの顧客管理・予約システム。来店履歴や施術内容を記録し、予約管理ができる。
              </p>
              <div className="flex gap-2 text-xs">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">CRM</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">React</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">タスク管理アプリ</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  生成中
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                チーム向けのタスク管理ツール。プロジェクトごとにタスクを管理し、進捗を可視化できる。
              </p>
              <div className="flex gap-2 text-xs">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">TODO</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Kanban</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">ブログCMS</h3>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                  下書き
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                シンプルなブログ管理システム。記事の作成、編集、公開機能を持つCMS。
              </p>
              <div className="flex gap-2 text-xs">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">CMS</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">SEO</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA セクション */}
        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            今すぐデモを試してみましょう
          </h2>
          <p className="text-gray-600 mb-8">
            登録不要でSaaS Factoryの機能を体験できます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard?demo=true"
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              ダッシュボードへ
            </Link>
            <Link
              href="/project/new?demo=true"
              className="inline-flex items-center justify-center px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg border border-gray-300 transition-colors"
            >
              プロジェクト作成を体験
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            実際のアカウント作成は、<Link href="/auth/signup" className="text-blue-600 hover:text-blue-700">こちら</Link>から
          </p>
        </div>
      </div>
    </div>
  )
}