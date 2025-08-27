'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isDemoMode, getDemoProjects, getDemoStats } from '@/lib/demo-data'
import { PageLoader, InlineLoader } from '@/components/ui/LoadingSpinner'
import { APIErrorDisplay, NetworkErrorDisplay } from '@/components/ui/ErrorBoundary'
import ProjectGenerationModal from '@/components/project/ProjectGenerationModal'
import ProjectTemplateModal from '@/components/project/ProjectTemplateModal'
import { ProjectTemplate } from '@/lib/templates/project-templates'
import type { Project } from '@/lib/types'

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    deployedProjects: 0
  })
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [showGenerationModal, setShowGenerationModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchProjects()
      fetchStats()
    }
  }, [user, loading, router])

  const fetchProjects = async () => {
    setIsLoadingProjects(true)
    setProjectsError(null)
    
    try {
      // デモモードの場合はデモデータを使用
      if (isDemoMode()) {
        setProjects(getDemoProjects(5))
        setIsLoadingProjects(false)
        return
      }

      const response = await fetch('/api/projects?per_page=5')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setProjects(result.data)
      } else {
        throw new Error(result.error || 'プロジェクトの取得に失敗しました')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Failed to fetch projects:', errorMessage)
      setProjectsError(errorMessage)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const fetchStats = async () => {
    setIsLoadingStats(true)
    setStatsError(null)
    
    try {
      // デモモードの場合はデモ統計を使用
      if (isDemoMode()) {
        setStats(getDemoStats())
        setIsLoadingStats(false)
        return
      }

      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        const allProjects = result.data
        setStats({
          totalProjects: allProjects.length,
          completedProjects: (allProjects as Project[]).filter(p => p.status === 'completed' || p.status === 'deployed').length,
          deployedProjects: (allProjects as Project[]).filter(p => p.status === 'deployed').length
        })
      } else {
        throw new Error(result.error || '統計情報の取得に失敗しました')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('Failed to fetch stats:', errorMessage)
      setStatsError(errorMessage)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateModal(false)
    // テンプレートデータを使ってプロジェクト生成モーダルを開く
    setShowGenerationModal(true)
  }

  if (loading) {
    return <PageLoader />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">SaaS Factory</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">こんにちは、{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">ダッシュボード</h2>
            <p className="text-gray-600 mt-2">
              アイディアを完動するSaaSアプリケーションに変換しましょう
            </p>
          </div>
          
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {isLoadingStats ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        <div className="ml-4 flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : statsError ? (
              <div className="col-span-3">
                <APIErrorDisplay error={statsError} onRetry={fetchStats} />
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">総プロジェクト数</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalProjects}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">完了済み</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.completedProjects}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">デプロイ済み</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.deployedProjects}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* プロジェクト作成セクション */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                新しいプロジェクトを作成
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                自然な日本語でアイディアを記述するだけで、完動するSaaSアプリケーションを自動生成します。
                ADHD配慮の開発ワークフローで効率的な構築を支援。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowGenerationModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  🤖 AIで生成
                </button>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  📋 テンプレートから選択
                </button>
                <Link
                  href="/project/new"
                  className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  手動で作成
                </Link>
              </div>
            </div>
          </div>

          {/* プロジェクト一覧 */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">最近のプロジェクト</h3>
              <Link href="/projects" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                すべて表示
              </Link>
            </div>
            
            {isLoadingProjects ? (
              <InlineLoader text="プロジェクトを読み込んでいます..." />
            ) : projectsError ? (
              <APIErrorDisplay error={projectsError} onRetry={fetchProjects} />
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  まだプロジェクトがありません
                </h4>
                <p className="text-gray-500 mb-4">
                  最初のSaaSプロジェクトを作成して始めましょう
                </p>
                <Link
                  href="/project/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  プロジェクト作成
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {project.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {project.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(project.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'deployed' ? 'bg-purple-100 text-purple-800' :
                          project.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status === 'completed' ? '完了' :
                           project.status === 'generating' ? '生成中' :
                           project.status === 'deployed' ? 'デプロイ済み' :
                           project.status === 'error' ? 'エラー' :
                           '下書き'}
                        </span>
                        <Link
                          href={`/project/${project.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          詳細
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* プロジェクト生成モーダル */}
      <ProjectGenerationModal
        isOpen={showGenerationModal}
        onClose={() => {
          setShowGenerationModal(false)
          setSelectedTemplate(null)
        }}
        selectedTemplate={selectedTemplate}
      />

      {/* プロジェクトテンプレートモーダル */}
      <ProjectTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  )
}