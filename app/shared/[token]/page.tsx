'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Project, GenerationLog } from '@/lib/types'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface SharedProjectData {
  project: Project
  owner_email: string
  generation_logs: GenerationLog[]
  is_public: boolean
  allowed_emails: string[]
}

export default function SharedProject() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const supabase = createClient()

  const [projectData, setProjectData] = useState<SharedProjectData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessGranted, setAccessGranted] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    if (token) {
      fetchSharedProject()
    }
  }, [token])

  const fetchSharedProject = async () => {
    try {
      // 共有トークンでプロジェクトを検索
      const { data: shareData, error: shareError } = await supabase
        .from('project_shares')
        .select(`
          project_id,
          is_public,
          allowed_emails,
          projects (
            *,
            profiles (
              email
            )
          )
        `)
        .eq('share_token', token)
        .single()

      if (shareError) {
        if (shareError.code === 'PGRST116') {
          setError('共有リンクが見つかりません')
        } else {
          throw shareError
        }
        return
      }

      if (!shareData.projects) {
        setError('プロジェクトが見つかりません')
        return
      }

      const project = shareData.projects as any
      
      // アクセス権限をチェック
      if (shareData.is_public) {
        setAccessGranted(true)
      } else {
        // プライベート共有の場合、メール確認が必要
        checkEmailAccess(shareData.allowed_emails)
        setProjectData({
          project,
          owner_email: project.profiles?.email || 'unknown',
          generation_logs: [],
          is_public: shareData.is_public,
          allowed_emails: shareData.allowed_emails
        })
        return
      }

      // 生成ログを取得
      const { data: logsData } = await supabase
        .from('generation_logs')
        .select('*')
        .eq('project_id', project.id)
        .order('started_at', { ascending: true })

      setProjectData({
        project,
        owner_email: project.profiles?.email || 'unknown',
        generation_logs: logsData || [],
        is_public: shareData.is_public,
        allowed_emails: shareData.allowed_emails
      })
    } catch (err: any) {
      console.error('Error fetching shared project:', err)
      setError('プロジェクトの取得中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const checkEmailAccess = (allowedEmails: string[]) => {
    // ここでは簡単なメール入力フォームを表示
    // 実際の実装では、認証されたユーザーのメールアドレスを使用
    if (allowedEmails.length === 0) {
      setAccessGranted(true)
      return
    }

    // メール確認が必要
    setAccessGranted(false)
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectData || !userEmail) return

    if (projectData.allowed_emails.includes(userEmail)) {
      setAccessGranted(true)
    } else {
      setError('このメールアドレスは共有対象に含まれていません')
    }
  }

  const getStatusDisplay = (status: Project['status']) => {
    const statusConfig = {
      draft: { label: '下書き', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      generating: { label: '生成中', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      completed: { label: '完了', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      error: { label: 'エラー', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      deployed: { label: 'デプロイ済み', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="共有プロジェクトを読み込み中..." />
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
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!projectData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">プロジェクトが見つかりません</h2>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  // アクセス許可されていない場合のメール確認フォーム
  if (!accessGranted && !projectData.is_public) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              プライベートプロジェクト
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              このプロジェクトはプライベート共有されています。<br />
              アクセスするにはメールアドレスを入力してください。
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              アクセス確認
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusDisplay = getStatusDisplay(projectData.project.status)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ナビゲーションバー */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                SaaS Factory
              </Link>
              <span className="text-gray-400 dark:text-gray-500 mx-2">/ 共有プロジェクト</span>
              <span className="text-gray-600 dark:text-gray-300">{projectData.project.title}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                by {projectData.owner_email}
              </span>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}>
                {statusDisplay.label}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 共有プロジェクトバナー */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              このプロジェクトは {projectData.is_public ? 'パブリック' : 'プライベート'} で共有されています
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* プロジェクト詳細 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {projectData.project.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {projectData.project.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">カテゴリ</h3>
                  <p className="text-gray-900 dark:text-gray-100">{projectData.project.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">作成日</h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date(projectData.project.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>

              {projectData.project.features && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">機能要件</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {projectData.project.features}
                    </p>
                  </div>
                </div>
              )}

              {projectData.project.design_preferences && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">デザイン要望</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {projectData.project.design_preferences}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 生成されたコード */}
            {projectData.project.generated_code && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">生成されたコード</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">コンポーネント</h3>
                    <div className="flex flex-wrap gap-2">
                      {projectData.project.generated_code.components?.map((component, index) => (
                        <span key={index} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm">
                          {component}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">APIルート</h3>
                    <div className="flex flex-wrap gap-2">
                      {projectData.project.generated_code.api_routes?.map((route, index) => (
                        <span key={index} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                          {route}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 生成ログ */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">生成ログ</h2>
              
              {projectData.generation_logs.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">ログはありません</p>
              ) : (
                <div className="space-y-3">
                  {projectData.generation_logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        log.status === 'completed' ? 'bg-green-500' :
                        log.status === 'processing' ? 'bg-blue-500' :
                        log.status === 'error' ? 'bg-red-500' :
                        'bg-gray-300'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {getStepDisplay(log.step)}
                        </p>
                        {log.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{log.message}</p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(log.started_at).toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 共有情報 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">共有情報</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">作成者:</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">{projectData.owner_email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">共有タイプ:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    projectData.is_public 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                  }`}>
                    {projectData.is_public ? 'パブリック' : 'プライベート'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}