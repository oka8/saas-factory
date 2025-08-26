'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Project } from '@/lib/types'
import { isDemoMode, getDemoProject } from '@/lib/demo-data'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { logProjectUpdated } from '@/lib/project-history'

export default function EditProject() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const supabase = createClient()
  const { showToast, Toast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    features: '',
    design_preferences: '',
    target_audience: '',
    tech_stack: [] as string[],
    additional_requirements: ''
  })

  const categoryOptions = [
    'Eコマース',
    'SNS・コミュニティ',
    'ビジネスツール',
    '教育・学習',
    'エンターテイメント',
    'ヘルスケア',
    'フィンテック',
    'IoT・スマートホーム',
    'その他'
  ]

  const techStackOptions = [
    'React',
    'Next.js',
    'Vue.js',
    'Angular',
    'Node.js',
    'Express',
    'FastAPI',
    'Django',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'AWS',
    'Vercel',
    'Docker',
    'TypeScript',
    'Tailwind CSS'
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user && projectId) {
      fetchProject()
    }
  }, [user, authLoading, projectId, router])

  const fetchProject = async () => {
    try {
      setLoading(true)
      
      // デモモードの場合
      if (isDemoMode()) {
        const demoProject = getDemoProject(projectId)
        if (demoProject) {
          setProject(demoProject)
          setFormData({
            title: demoProject.title,
            description: demoProject.description,
            category: demoProject.category,
            features: demoProject.features || '',
            design_preferences: demoProject.design_preferences || '',
            target_audience: demoProject.target_audience || '',
            tech_stack: demoProject.tech_stack || [],
            additional_requirements: demoProject.additional_requirements || ''
          })
        } else {
          setError('プロジェクトが見つかりません')
        }
        return
      }

      const response = await fetch(`/api/projects/${projectId}`)
      const result = await response.json()

      if (result.success) {
        const projectData = result.data.project
        setProject(projectData)
        setFormData({
          title: projectData.title,
          description: projectData.description,
          category: projectData.category,
          features: projectData.features || '',
          design_preferences: projectData.design_preferences || '',
          target_audience: projectData.target_audience || '',
          tech_stack: projectData.tech_stack || [],
          additional_requirements: projectData.additional_requirements || ''
        })
      } else {
        setError(result.error || 'プロジェクトの取得に失敗しました')
      }
    } catch (err: any) {
      console.error('Error fetching project:', err)
      setError('プロジェクトの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTechStackToggle = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.includes(tech)
        ? prev.tech_stack.filter(t => t !== tech)
        : [...prev.tech_stack, tech]
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !project) return

    setSaving(true)
    setError(null)

    try {
      // デモモードでは保存をシミュレート
      if (isDemoMode()) {
        // 2秒待機してデモンストレーション
        await new Promise(resolve => setTimeout(resolve, 2000))
        showToast('デモモードでは変更は保存されません', 'info')
        return
      }

      // 変更点を記録
      const changes: { field: string; oldValue: any; newValue: any }[] = []
      Object.keys(formData).forEach(key => {
        const oldValue = (project as any)[key]
        const newValue = (formData as any)[key]
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({ field: key, oldValue, newValue })
        }
      })

      if (changes.length === 0) {
        showToast('変更はありません', 'info')
        return
      }

      const { error } = await supabase
        .from('projects')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (error) throw error

      // 履歴に記録
      await logProjectUpdated(projectId, user.id, changes)

      showToast('プロジェクトを更新しました', 'success')
      
      // 詳細ページにリダイレクト
      setTimeout(() => {
        router.push(`/project/${projectId}`)
      }, 1500)
    } catch (err: any) {
      console.error('Error updating project:', err)
      setError('プロジェクトの更新に失敗しました')
      showToast('プロジェクトの更新に失敗しました', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="プロジェクトを読み込み中..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Link href={`/project/${projectId}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            プロジェクトに戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">プロジェクトが見つかりません</h2>
          <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ナビゲーションバー */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                SaaS Factory
              </Link>
              <span className="text-gray-400 dark:text-gray-500 mx-2">/</span>
              <Link href={`/project/${projectId}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                {project.title}
              </Link>
              <span className="text-gray-400 dark:text-gray-500 mx-2">/ 編集</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/project/${projectId}`}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                キャンセル
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">保存中...</span>
                  </div>
                ) : (
                  '保存'
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">プロジェクト編集</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            プロジェクト情報を更新して、より詳細な要件を設定できます
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* 基本情報 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">基本情報</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  プロジェクトタイトル
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: タスク管理アプリ"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  プロジェクト説明
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="アプリケーションの概要や目的を記述してください"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  カテゴリ
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">カテゴリを選択してください</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 機能要件 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">機能要件</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="features" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  必要な機能
                </label>
                <textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => handleInputChange('features', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="必要な機能を詳しく記述してください&#10;例:&#10;- ユーザー登録・ログイン機能&#10;- タスクの作成・編集・削除&#10;- カテゴリ分け機能&#10;- 期限設定とリマインダー"
                />
              </div>

              <div>
                <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ターゲットユーザー
                </label>
                <input
                  id="target_audience"
                  type="text"
                  value={formData.target_audience}
                  onChange={(e) => handleInputChange('target_audience', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例: 中小企業のプロジェクトマネージャー"
                />
              </div>
            </div>
          </div>

          {/* デザイン・技術要件 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">デザイン・技術要件</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="design_preferences" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  デザイン要望
                </label>
                <textarea
                  id="design_preferences"
                  value={formData.design_preferences}
                  onChange={(e) => handleInputChange('design_preferences', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="デザインの方向性やスタイルについて記述してください&#10;例:&#10;- モダンでシンプルなデザイン&#10;- ダークモード対応&#10;- レスポンシブデザイン"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  希望技術スタック
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {techStackOptions.map((tech) => (
                    <label key={tech} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.tech_stack.includes(tech)}
                        onChange={() => handleTechStackToggle(tech)}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{tech}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 追加要件 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">追加要件</h2>
            
            <div>
              <label htmlFor="additional_requirements" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                その他の要件
              </label>
              <textarea
                id="additional_requirements"
                value={formData.additional_requirements}
                onChange={(e) => handleInputChange('additional_requirements', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="セキュリティ要件、パフォーマンス要件、法的要件など、その他の重要な要件があれば記述してください"
              />
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">保存中...</span>
                </div>
              ) : (
                'プロジェクトを更新'
              )}
            </button>
          </div>
        </form>
      </div>
      <Toast />
    </div>
  )
}