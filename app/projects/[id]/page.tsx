'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Code, Download, Github, Globe, Rocket, Eye, Clock, CheckCircle, AlertCircle, Share, Users, Copy, Heart, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { CodePreview } from '@/components/project/CodePreview'
import { DeploymentModal } from '@/components/project/DeploymentModal'
import ShareModal from '@/components/project/ShareModal'
import CollaborationPanel from '@/components/project/CollaborationPanel'
import { ProjectCloneModal } from '@/components/project/ProjectCloneModal'
import { isDemoMode, getDemoProject } from '@/lib/demo-data'
import type { Project } from '@/lib/types'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCodePreview, setShowCodePreview] = useState(false)
  const [showDeploymentModal, setShowDeploymentModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const [shareSettings, setShareSettings] = useState<any>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (isDemoMode()) {
          // デモモードの場合はデモデータから取得
          const demoProject = getDemoProject(id as string)
          if (demoProject) {
            setProject(demoProject)
          }
        } else {
          // 実際のデータベースから取得
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single()

          if (!error && data) {
            setProject(data)
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
    fetchShareSettings()
    fetchFavoriteStatus()
  }, [id])

  const fetchShareSettings = async () => {
    if (isDemoMode()) return
    
    try {
      const response = await fetch(`/api/projects/${id}/share`)
      if (response.ok) {
        const data = await response.json()
        setShareSettings(data.shareSettings)
      }
    } catch (err) {
      console.error('Error fetching share settings:', err)
    }
  }

  const fetchFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/projects/${id}/favorite`)
      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.is_favorite)
      }
    } catch (err) {
      console.error('Error fetching favorite status:', err)
    }
  }

  const handleToggleFavorite = async () => {
    setFavoriteLoading(true)
    
    try {
      const method = isFavorite ? 'DELETE' : 'POST'
      const response = await fetch(`/api/projects/${id}/favorite`, {
        method
      })

      if (response.ok) {
        const data = await response.json()
        setIsFavorite(data.is_favorite)
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: '下書き', color: 'bg-gray-100 text-gray-800', icon: Clock },
      generating: { label: '生成中', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      completed: { label: '完了', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      deployed: { label: 'デプロイ済み', color: 'bg-blue-100 text-blue-800', icon: Rocket }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    )
  }

  const handleDownload = async () => {
    if (!project) return
    
    try {
      const response = await fetch(`/api/projects/${project.id}/download`)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.tar`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const handleDeploy = async () => {
    setShowDeploymentModal(true)
  }

  const handleDeploySuccess = (result: any) => {
    // デプロイ成功時の処理
    if (project && result.vercel?.deployment?.url) {
      setProject({
        ...project,
        deployment_url: result.vercel.deployment.url,
        status: 'deployed',
        deployed_at: new Date().toISOString()
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">プロジェクトが見つかりません</h2>
          <Link href="/projects" className="text-blue-600 hover:text-blue-700">
            プロジェクト一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/projects"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            プロジェクト一覧に戻る
          </Link>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
              </div>
              {getStatusBadge(project.status)}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              {project.status === 'completed' && (
                <>
                  <button
                    onClick={() => setShowCodePreview(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    コードを確認
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    ダウンロード
                  </button>
                  <button
                    onClick={handleDeploy}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Rocket className="w-4 h-4" />
                    デプロイ
                  </button>
                </>
              )}

              {project.status === 'deployed' && (
                <Link
                  href={`/projects/${project.id}/monitoring`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  監視ダッシュボード
                </Link>
              )}
              
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                  isFavorite
                    ? 'border-red-300 bg-red-50 hover:bg-red-100 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'お気に入り済み' : 'お気に入り'}
              </button>
              
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Share className="w-4 h-4" />
                共有
              </button>
              
              <button
                onClick={() => setShowCollaboration(!showCollaboration)}
                className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${
                  showCollaboration ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <Users className="w-4 h-4" />
                コラボレーション
              </button>
              
              <button
                onClick={() => setShowCloneModal(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                クローン
              </button>
            </div>
          </div>
        </div>

        {/* Collaboration Panel */}
        {showCollaboration && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <CollaborationPanel projectId={project.id} />
          </div>
        )}

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Features */}
            {project.features && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">機能要件</h2>
                <div className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                  {project.features}
                </div>
              </div>
            )}

            {/* Design Preferences */}
            {project.design_preferences && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">デザイン要件</h2>
                <div className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                  {project.design_preferences}
                </div>
              </div>
            )}

            {/* Generated Code Info */}
            {project.generated_code && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">生成されたコード</h2>
                <div className="space-y-4">
                  {project.generated_code.components && (
                    <div>
                      <h3 className="font-medium mb-2">コンポーネント</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.generated_code.components.map((comp: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.generated_code.pages && (
                    <div>
                      <h3 className="font-medium mb-2">ページ</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.generated_code.pages.map((page: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full text-sm">
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">プロジェクト情報</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">カテゴリ</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {project.category?.toUpperCase() || '未分類'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">作成日</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(project.created_at).toLocaleDateString('ja-JP')}
                  </dd>
                </div>
                {project.completed_at && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">完成日</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(project.completed_at).toLocaleDateString('ja-JP')}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* External Links */}
            {(project.repository_url || project.deployment_url) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">リンク</h2>
                <div className="space-y-3">
                  {project.repository_url && (
                    <a
                      href={project.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Github className="w-4 h-4" />
                      GitHubリポジトリ
                    </a>
                  )}
                  {project.deployment_url && (
                    <a
                      href={project.deployment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      デプロイ済みサイト
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {project.tech_requirements && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">技術スタック</h2>
                <div className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                  {project.tech_requirements}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Preview Modal */}
      <CodePreview
        isOpen={showCodePreview}
        onClose={() => setShowCodePreview(false)}
        fileStructure={project.generated_code?.file_structure}
        generatedCode={project.generated_code}
        projectTitle={project.title}
        projectId={project.id}
      />

      {/* Deployment Modal */}
      <DeploymentModal
        isOpen={showDeploymentModal}
        onClose={() => setShowDeploymentModal(false)}
        projectId={project.id}
        projectTitle={project.title}
        onDeploySuccess={handleDeploySuccess}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectId={project.id}
        projectTitle={project.title}
        currentShareSettings={shareSettings}
      />
    </div>
  )
}