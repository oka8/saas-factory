'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { useSSEGeneration } from '@/lib/hooks/useSSEGeneration'
import { ProjectTemplate } from '@/lib/templates/project-templates'

interface ProjectGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  selectedTemplate?: ProjectTemplate | null
}

const TECH_STACKS = [
  { id: 'react', name: 'React', category: 'frontend' },
  { id: 'vue', name: 'Vue.js', category: 'frontend' },
  { id: 'angular', name: 'Angular', category: 'frontend' },
  { id: 'nextjs', name: 'Next.js', category: 'fullstack' },
  { id: 'nuxtjs', name: 'Nuxt.js', category: 'fullstack' },
  { id: 'nodejs', name: 'Node.js', category: 'backend' },
  { id: 'express', name: 'Express.js', category: 'backend' },
  { id: 'fastapi', name: 'FastAPI', category: 'backend' },
  { id: 'django', name: 'Django', category: 'backend' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'database' },
  { id: 'mongodb', name: 'MongoDB', category: 'database' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'styling' },
  { id: 'typescript', name: 'TypeScript', category: 'language' }
]

const COMPLEXITY_OPTIONS = [
  { value: 'simple', label: 'シンプル', description: '基本的な機能のみ' },
  { value: 'medium', label: '標準', description: '一般的な機能セット' },
  { value: 'complex', label: '高度', description: '多機能で複雑な実装' }
]

const CATEGORIES = [
  'Webアプリケーション',
  'モバイルアプリ',
  'API・バックエンド',
  'データ分析',
  'AI・機械学習',
  'eコマース',
  '管理システム',
  'その他'
]

export default function ProjectGenerationModal({ isOpen, onClose, selectedTemplate }: ProjectGenerationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: [] as string[],
    complexity: 'medium',
    category: '',
    features: [] as string[],
    customFeature: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedProjectId, setGeneratedProjectId] = useState<string | null>(null)
  const [generationPhase, setGenerationPhase] = useState('')
  const router = useRouter()
  const { showToast } = useToast()
  const supabase = createClient()

  // テンプレートが選択された場合にフォームデータを初期化
  useEffect(() => {
    if (selectedTemplate) {
      setFormData({
        title: selectedTemplate.name,
        description: selectedTemplate.description,
        techStack: selectedTemplate.techStack,
        complexity: selectedTemplate.complexity,
        category: selectedTemplate.category,
        features: selectedTemplate.features,
        customFeature: ''
      })
    }
  }, [selectedTemplate])

  // SSE接続を管理
  const { status, isConnected, connect } = useSSEGeneration({
    projectId: generatedProjectId,
    onComplete: (project) => {
      if (project?.id) {
        showToast('プロジェクトが正常に生成されました！', 'success')
        setTimeout(() => {
          router.push(`/project/${project.id}`)
          onClose()
        }, 1000)
      }
    },
    onError: (error) => {
      showToast(error, 'error')
      setIsGenerating(false)
    }
  })

  const handleTechStackToggle = (techId: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(techId)
        ? prev.techStack.filter(t => t !== techId)
        : [...prev.techStack, techId]
    }))
  }

  const addCustomFeature = () => {
    if (formData.customFeature.trim() && !formData.features.includes(formData.customFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, prev.customFeature.trim()],
        customFeature: ''
      }))
    }
  }

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || formData.techStack.length === 0) {
      showToast('必須フィールドを入力してください', 'error')
      return
    }

    setIsGenerating(true)
    setGenerationPhase('プロジェクト要件を分析中...')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showToast('ログインが必要です', 'error')
        return
      }

      setGenerationPhase('AI生成を実行中...')
      
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          techStack: formData.techStack,
          complexity: formData.complexity,
          category: formData.category,
          features: formData.features
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'プロジェクト生成に失敗しました')
      }

      // プロジェクトIDを設定してSSEで状況を監視
      setGeneratedProjectId(result.project.id)
      setGenerationPhase('リアルタイム進捗監視中...')

    } catch (error) {
      console.error('Generation error:', error)
      showToast(
        error instanceof Error ? error.message : 'プロジェクト生成に失敗しました',
        'error'
      )
      setIsGenerating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      techStack: [],
      complexity: 'medium',
      category: '',
      features: [],
      customFeature: ''
    })
    setGeneratedProjectId(null)
    setIsGenerating(false)
    setGenerationPhase('')
  }

  const handleClose = () => {
    if (!isGenerating) {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                🤖 AIプロジェクト生成
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {selectedTemplate 
                  ? `テンプレート「${selectedTemplate.preview} ${selectedTemplate.name}」を使用してプロジェクトを生成します`
                  : '要件を入力すると、AIが実装可能なプロジェクトを生成します'
                }
              </p>
              {selectedTemplate && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm">
                    📋 テンプレート使用
                    <button
                      onClick={() => {
                        setFormData({
                          title: '',
                          description: '',
                          techStack: [],
                          complexity: 'medium',
                          category: '',
                          features: [],
                          customFeature: ''
                        })
                      }}
                      className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                      title="テンプレートをクリア"
                    >
                      ×
                    </button>
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              disabled={isGenerating}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 生成中またはフォーム */}
        {isGenerating ? (
          <div className="p-8">
            {/* リアルタイム進捗表示 */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {formData.title} を生成中...
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {generationPhase}
              </p>
            </div>

            {/* SSE接続状況と進捗 */}
            {status && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {status.type === 'status' ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    ) : status.type === 'complete' ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                      {status.project?.message || status.message}
                    </div>
                    {status.project && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-400 mb-1">
                          <span>進捗</span>
                          <span>{status.project.progress}%</span>
                        </div>
                        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${status.project.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 接続状況 */}
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                リアルタイム接続: {isConnected ? '✅ 接続中' : '❌ 切断'}
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                このプロセスには数分かかる場合があります。ページを閉じないでください。
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* フォームコンテンツは既存と同じ */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                基本情報
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  プロジェクト名 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: タスク管理アプリ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  プロジェクト説明 *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="どのようなアプリを作りたいか詳しく説明してください..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    複雑度
                  </label>
                  <select
                    value={formData.complexity}
                    onChange={(e) => setFormData(prev => ({ ...prev, complexity: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COMPLEXITY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 技術スタック */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                技術スタック *
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {TECH_STACKS.map(tech => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => handleTechStackToggle(tech.id)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      formData.techStack.includes(tech.id)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    {tech.name}
                    <div className="text-xs opacity-75 mt-1">{tech.category}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* カスタム機能 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                追加したい機能
              </h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.customFeature}
                  onChange={(e) => setFormData(prev => ({ ...prev, customFeature: e.target.value }))}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例: ユーザー認証、通知機能..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                />
                <button
                  type="button"
                  onClick={addCustomFeature}
                  disabled={!formData.customFeature.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  追加
                </button>
              </div>

              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ボタン */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                リセット
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!formData.title.trim() || !formData.description.trim() || formData.techStack.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  プロジェクト生成
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}