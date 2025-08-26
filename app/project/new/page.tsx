'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { isDemoMode } from '@/lib/demo-data'
import { useToast } from '@/components/ui/Toast'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useSSEGeneration } from '@/lib/hooks/useSSEGeneration'
import { ProjectGenerationModal } from '@/components/ui/ProjectGenerationModal'

export default function NewProject() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { showToast, Toast } = useToast()
  const generationHook = useSSEGeneration()
  const [step, setStep] = useState(1)
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    category: '',
    features: '',
    design_preferences: '',
    tech_requirements: ''
  })
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="認証情報を確認中..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleGenerate = async () => {
    if (!projectData.title || !projectData.description || !projectData.category) {
      showToast('必須項目を入力してください', 'warning')
      return
    }

    try {
      // プロジェクトを作成（デモモードフラグを追加）
      const createResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectData,
          demo: isDemoMode()
        }),
      })

      const createResult = await createResponse.json()

      if (!createResponse.ok || !createResult.success) {
        throw new Error(createResult.error || 'プロジェクトの作成に失敗しました')
      }

      const projectId = createResult.data.id
      setCurrentProjectId(projectId)
      
      // 生成モーダルを表示
      setShowGenerationModal(true)

      // SSEを使用したリアルタイム生成を開始
      await generationHook.startGeneration(projectId, projectData)

    } catch (error: any) {
      console.error('Project generation error:', error)
      showToast(
        error.message || 'プロジェクトの生成中にエラーが発生しました',
        'error'
      )
    }
  }

  const handleRetry = useCallback(async () => {
    if (!currentProjectId) return

    try {
      // 生成状態をリセット
      generationHook.resetGeneration()
      
      // 少し遅延してから再開始
      setTimeout(async () => {
        await generationHook.startGeneration(currentProjectId, projectData)
      }, 500)
    } catch (error) {
      console.error('Retry error:', error)
      showToast('再試行に失敗しました', 'error')
    }
  }, [currentProjectId, projectData, generationHook, showToast])

  // 生成完了時の処理
  useEffect(() => {
    if (!generationHook.isGenerating && !generationHook.error && generationHook.progress === 100 && currentProjectId) {
      // 2秒後にプロジェクト詳細ページに移動
      const timer = setTimeout(() => {
        setShowGenerationModal(false)
        router.push(`/project/${currentProjectId}`)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [generationHook.isGenerating, generationHook.error, generationHook.progress, currentProjectId, router])

  const categories = [
    { id: 'crm', name: 'CRM・顧客管理', description: '顧客情報、営業管理' },
    { id: 'cms', name: 'CMS・コンテンツ管理', description: 'ブログ、記事管理' },
    { id: 'todo', name: 'タスク管理', description: 'TODO、プロジェクト管理' },
    { id: 'inventory', name: '在庫管理', description: '商品、在庫追跡' },
    { id: 'form', name: 'フォーム・アンケート', description: 'データ収集、調査' },
    { id: 'other', name: 'その他', description: 'カスタムアプリケーション' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ナビゲーションバー */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                SaaS Factory
              </Link>
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              プロジェクト作成
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* プログレスバー - ADHD配慮：視覚的な進捗表示 */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {step === 1 && '基本情報'}
              {step === 2 && 'カテゴリと機能'}
              {step === 3 && '詳細設定'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {step === 1 && 'プロジェクトの基本的な情報を入力してください'}
              {step === 2 && 'アプリケーションの種類と機能を選択してください'}
              {step === 3 && '技術要件とデザインの設定を行ってください'}
            </p>
          </div>
        </div>

        {/* フォーム */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          {/* ステップ1: 基本情報 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  プロジェクト名 *
                </label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="例: 顧客管理システム"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  アイディア説明 *
                </label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  placeholder="自然な日本語でアイディアを記述してください。例：

小規模な美容院向けの顧客管理システムを作りたい。
・お客さんの来店履歴や施術内容を記録
・次回予約の管理
・お客さんへのメッセージ送信機能
・売上の簡単な分析

シンプルで使いやすいUIで、スタッフが直感的に操作できることを重視したい。"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  詳細に記述するほど、より適切なアプリケーションが生成されます
                </p>
              </div>
            </div>
          )}

          {/* ステップ2: カテゴリと機能 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  アプリケーションカテゴリ *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        projectData.category === category.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleInputChange('category', category.id)}
                    >
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{category.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{category.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  主要機能の詳細
                </label>
                <textarea
                  value={projectData.features}
                  onChange={(e) => handleInputChange('features', e.target.value)}
                  rows={4}
                  placeholder="実装したい具体的な機能を箇条書きで記述してください。例：

・顧客情報の登録・編集・検索
・来店履歴の記録と表示
・予約管理（日時、スタッフ、メニュー）
・売上レポートの表示
・顧客へのメール通知機能"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* ステップ3: 詳細設定 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  デザインの好み
                </label>
                <textarea
                  value={projectData.design_preferences}
                  onChange={(e) => handleInputChange('design_preferences', e.target.value)}
                  rows={3}
                  placeholder="デザインの方向性を記述してください。例：

・シンプルで清潔感のあるデザイン
・ブルーとホワイトを基調とした配色
・大きなボタンと読みやすいフォント
・モバイルでも使いやすいレスポンシブデザイン"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  技術要件・その他
                </label>
                <textarea
                  value={projectData.tech_requirements}
                  onChange={(e) => handleInputChange('tech_requirements', e.target.value)}
                  rows={3}
                  placeholder="特別な技術要件があれば記述してください。例：

・多言語対応（日本語・英語）
・CSVエクスポート機能
・外部API連携（決済、メール送信）
・データのバックアップ機能"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">生成されるもの</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• フロントエンド: React + TypeScript + Tailwind CSS</li>
                  <li>• バックエンド: Next.js API Routes</li>
                  <li>• データベース: Supabase (PostgreSQL)</li>
                  <li>• 認証: Supabase Auth</li>
                  <li>• デプロイ: Vercel対応</li>
                </ul>
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  戻る
                </button>
              )}
            </div>
            
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                キャンセル
              </Link>
              
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && (!projectData.title || !projectData.description)) ||
                    (step === 2 && !projectData.category)
                  }
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={generationHook.isGenerating}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generationHook.isGenerating ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" color="white" />
                      <span className="ml-2">生成開始中...</span>
                    </div>
                  ) : (
                    'SaaS生成開始'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toast />
      
      {/* リアルタイム生成モーダル */}
      <ProjectGenerationModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        generationState={generationHook}
        projectTitle={projectData.title}
        onRetry={handleRetry}
      />
    </div>
  )
}