'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProgressTracker from '@/components/dashboard/ProgressTracker'

export default function HomePage() {
  const [showProgress, setShowProgress] = useState(false)

  const handleGenerateRequirements = () => {
    alert('AI要件生成機能（実装予定）')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              ReqAI
            </h1>
            <p className="text-xl mb-8 text-indigo-100 max-w-2xl mx-auto">
              AIを活用した要件定義アシスタントで、プロジェクトのアイデアを包括的でテスト可能な要件に変換します
            </p>
            <div className="space-x-4">
              <Link
                href="/auth/signup"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-block"
              >
                無料で始める
              </Link>
              <button
                onClick={() => setShowProgress(!showProgress)}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
              >
                {showProgress ? '隠す' : '表示'} 開発進捗
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Development Progress Section */}
      {showProgress && (
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8">ReqAI 開発進捗</h2>
            <ProgressTracker />
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            要件定義プロセスを変革
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AIの力を活用して、明確で包括的、かつテスト可能な要件をこれまで以上に迅速に作成できます
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              AI分析機能
            </h3>
            <p className="text-gray-600 mb-6">
              高度なAI分析により、要件の明確性、完全性、潜在的な問題について即座にフィードバックを取得できます
            </p>
            <button 
              onClick={handleGenerateRequirements}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              分析開始
            </button>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              自動生成機能
            </h3>
            <p className="text-gray-600 mb-6">
              要件から、ユーザーストーリー、受け入れ基準、テストシナリオを自動で生成できます
            </p>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              ストーリー生成
            </button>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">
              チーム連携
            </h3>
            <p className="text-gray-600 mb-6">
              ステークホルダーとリアルタイムで連携し、変更の追跡と承認ワークフローをシームレスに管理できます
            </p>
            <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              連携開始
            </button>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">🚀 ReqAI 開発ステータス</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium text-gray-900">データベース設計</p>
              <p className="text-sm text-green-600">✅ 完了</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium text-gray-900">認証システム</p>
              <p className="text-sm text-green-600">✅ 完了</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium text-gray-900">AI統合</p>
              <p className="text-sm text-green-600">✅ 完了</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium text-gray-900">コア機能</p>
              <p className="text-sm text-yellow-600">⏳ 進行中</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <div className="bg-white rounded-lg p-4 inline-block shadow-sm">
              <p className="text-sm text-gray-600 mb-1">フェーズ1 - 第1週 進捗</p>
              <div className="w-64 bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">100% 完了</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            要件定義プロセスを革新しませんか？
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            ベータ版に参加して、AIを活用した要件定義をいち早く体験してください
          </p>
          <div className="space-x-4">
            <Link
              href="/auth/signup"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors inline-block"
            >
              無料ベータ版を始める
            </Link>
            <Link
              href="/auth/signin"
              className="border border-gray-600 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors inline-block"
            >
              サインイン
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}