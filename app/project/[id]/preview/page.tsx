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

interface CodeFile {
  path: string
  content: string
  language: string
}

export default function ProjectPreview() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const supabase = createClient()
  const { showToast, Toast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<CodeFile[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [buildLogs, setBuildLogs] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'preview' | 'mobile' | 'logs'>('preview')

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
          // デモ用のプレビューURLを設定
          setPreviewUrl(`https://saas-factory-demo-${projectId}.vercel.app`)
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
        
        // 生成されたコードがある場合は使用
        if (projectData.generated_code?.files) {
          setFiles(projectData.generated_code.files)
        }
        
        // プレビューURLがある場合は設定
        if (projectData.preview_url) {
          setPreviewUrl(projectData.preview_url)
        }
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

  const handleBuildPreview = async () => {
    if (!user || !project) return

    setIsBuilding(true)
    setBuildLogs([])

    try {
      // デモモードでは模擬ビルドプロセス
      if (isDemoMode()) {
        const logs = [
          '📦 プロジェクトをビルド中...',
          '🔍 依存関係を解決中...',
          '⚡ コンポーネントをコンパイル中...',
          '🎨 スタイルを処理中...',
          '🚀 最適化を実行中...',
          '✅ ビルド完了!'
        ]
        
        for (const log of logs) {
          setBuildLogs(prev => [...prev, log])
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
        
        setPreviewUrl(`https://saas-factory-demo-${projectId}.vercel.app`)
        showToast('プレビューのビルドが完了しました', 'success')
        return
      }

      // 実際のビルドプロセス（API実装時）
      const response = await fetch(`/api/projects/${projectId}/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files })
      })

      const result = await response.json()
      
      if (result.success) {
        setPreviewUrl(result.preview_url)
        setBuildLogs(result.build_logs || [])
        showToast('プレビューのビルドが完了しました', 'success')
      } else {
        throw new Error(result.error || 'ビルドに失敗しました')
      }
    } catch (err: any) {
      console.error('Error building preview:', err)
      setBuildLogs(prev => [...prev, `❌ エラー: ${err.message}`])
      showToast('プレビューのビルドに失敗しました', 'error')
    } finally {
      setIsBuilding(false)
    }
  }

  const getScreenSize = (type: 'preview' | 'mobile') => {
    switch (type) {
      case 'mobile':
        return { width: 375, height: 812 } // iPhone 13 Pro
      default:
        return { width: 1200, height: 800 } // Desktop
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="プレビューを準備中..." />
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

  const screenSize = getScreenSize(activeTab as 'preview' | 'mobile')

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/project/${projectId}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              ← {project.title}
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              プロジェクトプレビュー
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                新しいタブで開く
              </a>
            )}
            
            <button
              onClick={handleBuildPreview}
              disabled={isBuilding}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBuilding ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">ビルド中...</span>
                </div>
              ) : (
                '🚀 プレビューをビルド'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* タブとメインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* タブナビゲーション */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex px-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              🖥️ デスクトップ
            </button>
            <button
              onClick={() => setActiveTab('mobile')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'mobile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              📱 モバイル
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              📋 ビルドログ
            </button>
          </nav>
        </div>

        {/* コンテンツエリア */}
        <main className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-800 p-4">
          {activeTab === 'logs' ? (
            <div className="h-full bg-black text-green-400 rounded-lg p-4 font-mono text-sm overflow-y-auto">
              <div className="mb-4 text-gray-300">
                <span className="text-blue-400">$</span> ビルドログ
              </div>
              {buildLogs.length > 0 ? (
                buildLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">
                  プレビューをビルドするとログがここに表示されます
                </div>
              )}
              {isBuilding && (
                <div className="flex items-center mt-2 text-yellow-400">
                  <div className="animate-spin mr-2">⟳</div>
                  ビルド処理中...
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              {previewUrl ? (
                <div 
                  className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300 dark:border-gray-600"
                  style={{
                    width: screenSize.width,
                    height: screenSize.height,
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                >
                  <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 flex items-center gap-2 border-b border-gray-300 dark:border-gray-600">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-gray-600 rounded px-3 py-1 text-sm text-gray-600 dark:text-gray-300 truncate ml-4">
                      {previewUrl}
                    </div>
                  </div>
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title={`${project.title} プレビュー`}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  />
                </div>
              ) : (
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    プレビューを準備
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    プロジェクトのプレビューを表示するには、<br />
                    まずビルドを実行してください。
                  </p>
                  <button
                    onClick={handleBuildPreview}
                    disabled={isBuilding}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBuilding ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" color="white" />
                        <span className="ml-2">ビルド中...</span>
                      </div>
                    ) : (
                      '🚀 プレビューをビルド'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Toast />
    </div>
  )
}