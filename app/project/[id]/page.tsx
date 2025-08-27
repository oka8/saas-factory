'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Project, GenerationLog } from '@/lib/types'
import { isDemoMode, getDemoProject, getDemoGenerationLogs } from '@/lib/demo-data'
import ShareModal from '@/components/project/ShareModal'
import ProjectHistory from '@/components/project/ProjectHistory'
import { DeploymentModal } from '@/components/project/DeploymentModal'
import CollaborationPanel from '@/components/project/CollaborationPanel'
import { createClient } from '@/lib/supabase/client'

interface ProjectDetailData {
  project: Project
  generation_logs: GenerationLog[]
}

export default function ProjectDetail() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const supabase = createClient()

  const [project, setProject] = useState<Project | null>(null)
  const [generationLogs, setGenerationLogs] = useState<GenerationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [deployModalOpen, setDeployModalOpen] = useState(false)
  const [shareSettings, setShareSettings] = useState<{
    is_public: boolean
    share_token: string | null
    allowed_emails: string[]
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user && projectId) {
      fetchProjectDetails()
      fetchShareSettings()
    }
  }, [user, loading, projectId, router])

  const fetchProjectDetails = async () => {
    try {
      // デモモードの場合はデモデータを使用
      if (isDemoMode()) {
        const demoProject = getDemoProject(projectId)
        if (demoProject) {
          setProject(demoProject)
          setGenerationLogs(getDemoGenerationLogs(projectId))
        } else {
          setError('プロジェクトが見つかりません')
        }
        setIsLoading(false)
        return
      }

      const response = await fetch(`/api/projects/${projectId}`)
      const result = await response.json()

      if (result.success) {
        setProject(result.data.project)
        setGenerationLogs(result.data.generation_logs || [])
      } else {
        setError(result.error || 'プロジェクトの取得に失敗しました')
      }
    } catch (err: any) {
      setError('プロジェクトの取得中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchShareSettings = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('project_shares')
        .select('is_public, share_token, allowed_emails')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching share settings:', error)
        return
      }

      if (data) {
        setShareSettings(data)
      }
    } catch (err: any) {
      console.error('Error fetching share settings:', err)
    }
  }

  const getStatusDisplay = (status: Project['status']) => {
    const statusConfig = {
      draft: { label: '下書き', color: 'bg-gray-100 text-gray-800' },
      generating: { label: '生成中', color: 'bg-blue-100 text-blue-800' },
      completed: { label: '完了', color: 'bg-green-100 text-green-800' },
      error: { label: 'エラー', color: 'bg-red-100 text-red-800' },
      deployed: { label: 'デプロイ済み', color: 'bg-purple-100 text-purple-800' }
    }
    return statusConfig[status] || statusConfig.draft
  }

  const getStepDisplay = (step: GenerationLog['step']) => {
    const stepNames = {
      analysis: 'プロジェクト分析',
      planning: 'コード生成計画',
      database_design: 'データベース設計',
      component_generation: 'コンポーネント生成',
      api_generation: 'API生成',
      styling: 'スタイリング',
      testing: 'テスト作成',
      deployment_prep: 'デプロイ準備',
      completed: '完了'
    }
    return stepNames[step] || step
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">プロジェクトが見つかりません</h2>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    )
  }

  const statusDisplay = getStatusDisplay(project.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                SaaS Factory
              </Link>
              <span className="text-gray-400 mx-2">/ プロジェクト</span>
              <span className="text-gray-600">{project.title}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
              {statusDisplay.label}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* タブナビゲーション */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'details'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    プロジェクト詳細
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'history'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    変更履歴
                  </button>
                </nav>
              </div>
            </div>

            {activeTab === 'details' ? (
              <div className="space-y-6">
            {/* プロジェクト詳細 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{project.title}</h1>
              <p className="text-gray-600 mb-6">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">カテゴリ</h3>
                  <p className="text-gray-900">{project.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">作成日</h3>
                  <p className="text-gray-900">{new Date(project.created_at).toLocaleDateString('ja-JP')}</p>
                </div>
              </div>

              {project.features && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">機能要件</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{project.features}</p>
                  </div>
                </div>
              )}

              {project.design_preferences && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">デザイン要望</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{project.design_preferences}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 生成されたコード */}
            {project.generated_code && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">生成されたコード</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">コンポーネント</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.generated_code.components?.map((component, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {component}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">APIルート</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.generated_code.api_routes?.map((route, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {route}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      コードをダウンロード
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      デプロイ開始
                    </button>
                  </div>
                </div>
              </div>
            )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">プロジェクト変更履歴</h2>
                <ProjectHistory projectId={projectId} />
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 生成ログ */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">生成ログ</h2>
              
              {generationLogs.length === 0 ? (
                <p className="text-gray-500">ログはありません</p>
              ) : (
                <div className="space-y-3">
                  {generationLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        log.status === 'completed' ? 'bg-green-500' :
                        log.status === 'processing' ? 'bg-blue-500' :
                        log.status === 'error' ? 'bg-red-500' :
                        'bg-gray-300'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {getStepDisplay(log.step)}
                        </p>
                        {log.message && (
                          <p className="text-sm text-gray-600">{log.message}</p>
                        )}
                        <p className="text-xs text-gray-400">
                          {new Date(log.started_at).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* アクション */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">アクション</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  プロジェクトを共有
                </button>
                <Link 
                  href={`/project/${project.id}/edit`}
                  className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  プロジェクト編集
                </Link>
                <Link 
                  href={`/project/${project.id}/code`}
                  className="block w-full text-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  コードエディタ
                </Link>
                <Link 
                  href={`/project/${project.id}/preview`}
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  プレビュー
                </Link>
                {project.status === 'completed' && (
                  <>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      再生成
                    </button>
                    <button
                      onClick={() => setDeployModalOpen(true)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      デプロイ
                    </button>
                  </>
                )}
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  削除
                </button>
              </div>
            </div>

            {/* コラボレーション */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">コラボレーション</h2>
              <CollaborationPanel projectId={projectId} />
            </div>
          </div>
        </div>
      </div>

      {/* ShareModal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        projectId={projectId}
        projectTitle={project.title}
        currentShareSettings={shareSettings || undefined}
      />

      {/* DeploymentModal */}
      <DeploymentModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        projectId={projectId}
        projectTitle={project.title}
      />
    </div>
  )
}