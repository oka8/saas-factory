'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isDemoMode, getDemoProjects, getDemoTemplates } from '@/lib/demo-data'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { CategoryManagementModal } from '@/components/project/CategoryManagementModal'

interface Project {
  id: string
  title: string
  description: string
  category: string
  status: 'draft' | 'generating' | 'completed' | 'deployed' | 'error'
  created_at: string
  updated_at: string
  features?: string
  tech_requirements?: string
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  features: string[]
  preview_url?: string
}

const PROJECT_CATEGORIES = [
  { id: 'all', name: '全て', description: '全てのプロジェクト' },
  { id: 'crm', name: 'CRM・顧客管理', description: '顧客情報、営業管理' },
  { id: 'cms', name: 'CMS・コンテンツ管理', description: 'ブログ、記事管理' },
  { id: 'todo', name: 'タスク管理', description: 'TODO、プロジェクト管理' },
  { id: 'inventory', name: '在庫管理', description: '商品、在庫追跡' },
  { id: 'form', name: 'フォーム・アンケート', description: 'データ収集、調査' },
  { id: 'other', name: 'その他', description: 'カスタムアプリケーション' }
]

const PROJECT_STATUSES = [
  { id: 'all', name: '全て', color: 'bg-gray-100 text-gray-800' },
  { id: 'draft', name: '下書き', color: 'bg-gray-100 text-gray-800' },
  { id: 'generating', name: '生成中', color: 'bg-blue-100 text-blue-800' },
  { id: 'completed', name: '完了', color: 'bg-green-100 text-green-800' },
  { id: 'deployed', name: 'デプロイ済み', color: 'bg-purple-100 text-purple-800' },
  { id: 'error', name: 'エラー', color: 'bg-red-100 text-red-800' }
]

const SORT_OPTIONS = [
  { id: 'created_desc', name: '作成日（新しい順）' },
  { id: 'created_asc', name: '作成日（古い順）' },
  { id: 'updated_desc', name: '更新日（新しい順）' },
  { id: 'updated_asc', name: '更新日（古い順）' },
  { id: 'title_asc', name: 'タイトル（A-Z）' },
  { id: 'title_desc', name: 'タイトル（Z-A）' }
]

const TECH_STACK_OPTIONS = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js',
  'Node.js', 'Python', 'Django', 'FastAPI', 'Express.js',
  'PostgreSQL', 'MongoDB', 'MySQL', 'Supabase', 'Firebase',
  'TypeScript', 'JavaScript', 'Tailwind CSS', 'Bootstrap', 'Material-UI'
]

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast, Toast } = useToast()

  // フィルターとソート状態
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('created_desc')
  const [viewMode, setViewMode] = useState<'projects' | 'templates'>('projects')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([])
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favoriteProjects, setFavoriteProjects] = useState<string[]>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    } else if (user) {
      fetchData()
    }
  }, [user, authLoading, router])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      if (isDemoMode()) {
        setProjects(getDemoProjects())
        setTemplates(getDemoTemplates())
        setLoading(false)
        return
      }

      // 実際のAPIコール（プロジェクト、テンプレート、お気に入り全て）
      const [projectsRes, templatesRes, favoritesRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/templates'),
        fetch('/api/projects/favorites')
      ])

      if (!projectsRes.ok) {
        throw new Error('プロジェクトの取得に失敗しました')
      }

      const projectsResult = await projectsRes.json()
      if (projectsResult.success) {
        setProjects(projectsResult.data)
      }

      // テンプレートAPIが404でも続行
      if (templatesRes.ok) {
        const templatesResult = await templatesRes.json()
        if (templatesResult.success) {
          setTemplates(templatesResult.templates || templatesResult.data)
        }
      } else {
        setTemplates(getDemoTemplates()) // フォールバックとしてデモテンプレートを使用
      }

      // お気に入りプロジェクトのIDリストを取得
      if (favoritesRes.ok) {
        const favoritesResult = await favoritesRes.json()
        if (favoritesResult.success) {
          const favoriteIds = favoritesResult.projects.map((p: any) => p.id)
          setFavoriteProjects(favoriteIds)
        }
      }

    } catch (error: any) {
      console.error('Failed to fetch data:', error)
      setError(error.message)
      showToast('データの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  // フィルタリング・ソート処理
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects]

    // 検索フィルター（タイトル、説明、特徴、技術要件）
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        (project.features && project.features.toLowerCase().includes(query)) ||
        (project.tech_requirements && project.tech_requirements.toLowerCase().includes(query))
      )
    }

    // カテゴリフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory)
    }

    // ステータスフィルター
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus)
    }

    // お気に入りフィルター
    if (showFavoritesOnly) {
      filtered = filtered.filter(project => favoriteProjects.includes(project.id))
    }

    // 日付範囲フィルター
    if (dateRange.start) {
      const startDate = new Date(dateRange.start)
      filtered = filtered.filter(project => new Date(project.created_at) >= startDate)
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999) // 日付の終わりまで含める
      filtered = filtered.filter(project => new Date(project.created_at) <= endDate)
    }

    // 技術スタックフィルター
    if (selectedTechStack.length > 0) {
      filtered = filtered.filter(project => {
        const techText = (project.tech_requirements || '').toLowerCase()
        return selectedTechStack.some(tech => techText.includes(tech.toLowerCase()))
      })
    }

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'updated_desc':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case 'updated_asc':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        case 'title_asc':
          return a.title.localeCompare(b.title, 'ja')
        case 'title_desc':
          return b.title.localeCompare(a.title, 'ja')
        default:
          return 0
      }
    })

    return filtered
  }, [projects, searchQuery, selectedCategory, selectedStatus, sortBy, dateRange, selectedTechStack, showFavoritesOnly, favoriteProjects])

  const handleTechStackToggle = (tech: string) => {
    setSelectedTechStack(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedStatus('all')
    setDateRange({ start: '', end: '' })
    setSelectedTechStack([])
    setSortBy('created_desc')
    setShowFavoritesOnly(false)
  }

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || 
    dateRange.start || dateRange.end || selectedTechStack.length > 0 || showFavoritesOnly

  const handleProjectFromTemplate = async (template: Template) => {
    try {
      showToast('テンプレートからプロジェクトを作成中...', 'info')
      
      // テンプレートデータを使ってプロジェクト作成ページに遷移
      const templateData = {
        title: template.name,
        description: template.description,
        category: template.category,
        features: template.features.join('\n'),
      }
      
      // クエリパラメータとしてテンプレートデータを渡す
      const params = new URLSearchParams({
        template: 'true',
        ...templateData
      })
      
      router.push(`/project/new?${params.toString()}`)
    } catch (error) {
      showToast('テンプレートの読み込みに失敗しました', 'error')
    }
  }

  const handleCategoryUpdate = () => {
    // カテゴリが更新された際にプロジェクト一覧を再取得
    fetchData()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="プロジェクトを読み込み中..." />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                SaaS Factory
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link 
                href="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                ダッシュボード
              </Link>
              <Link 
                href="/profile"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                プロフィール
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">プロジェクト管理</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                あなたのSaaSプロジェクトを管理・検索・テンプレートから作成
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/analytics"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                アナリティクス
              </Link>
              <Link
                href="/backup"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                バックアップ
              </Link>
              <Link
                href="/workspace"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                ワークスペース
              </Link>
              <Link
                href="/integrations"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                API統合
              </Link>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                カテゴリ管理
              </button>
              <Link
                href="/project/new"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                新規作成
              </Link>
            </div>
          </div>
        </div>

        {/* ビューモード切り替え */}
        <div className="mb-6">
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('projects')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'projects'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              プロジェクト ({filteredAndSortedProjects.length})
            </button>
            <button
              onClick={() => setViewMode('templates')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'templates'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              テンプレート ({templates.length})
            </button>
          </div>
        </div>

        {viewMode === 'projects' ? (
          <>
            {/* 検索・フィルター */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 検索 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    検索
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="プロジェクト名、説明、特徴、技術で検索..."
                    />
                  </div>
                </div>

                {/* カテゴリフィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    カテゴリ
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PROJECT_CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ステータスフィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ステータス
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PROJECT_STATUSES.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* お気に入りフィルターボタン */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    showFavoritesOnly
                      ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill={showFavoritesOnly ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {showFavoritesOnly ? 'お気に入りのみ表示中' : 'お気に入りのみ表示'}
                </button>
              </div>

              {/* 高度なフィルターの切り替えボタン */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                  className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  <svg className={`w-4 h-4 mr-1 transition-transform ${advancedFiltersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  高度なフィルター
                </button>
                
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                  >
                    すべてクリア
                  </button>
                )}
              </div>

              {/* 高度なフィルター */}
              {advancedFiltersOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  {/* 日付範囲フィルター */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        開始日
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        終了日
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* 技術スタックフィルター */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      技術スタック
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {TECH_STACK_OPTIONS.map(tech => (
                        <button
                          key={tech}
                          onClick={() => handleTechStackToggle(tech)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedTechStack.includes(tech)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                    {selectedTechStack.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          選択中: {selectedTechStack.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ソート:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredAndSortedProjects.length} / {projects.length} プロジェクト
                </div>
              </div>
            </div>

            {/* プロジェクト一覧 */}
            {error ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                <div className="text-red-600 dark:text-red-400 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">エラーが発生しました</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                <button
                  onClick={fetchData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  再試行
                </button>
              </div>
            ) : filteredAndSortedProjects.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  プロジェクトが見つかりません
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? '検索条件を変更してもう一度お試しください'
                    : '最初のプロジェクトを作成して始めましょう'}
                </p>
                <Link
                  href="/project/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  プロジェクト作成
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedProjects.map((project) => (
                  <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-2 flex-1">
                          <Link href={`/projects/${project.id}`} className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 line-clamp-2 flex-1">
                            {project.title}
                          </Link>
                          {favoriteProjects.includes(project.id) && (
                            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                          PROJECT_STATUSES.find(s => s.id === project.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {PROJECT_STATUSES.find(s => s.id === project.status)?.name || project.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {PROJECT_CATEGORIES.find(c => c.id === project.category)?.name || project.category}
                        </span>
                        <span>{new Date(project.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          href={`/project/${project.id}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          詳細を見る
                        </Link>
                        <button
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md text-sm font-medium transition-colors"
                          title="プロジェクトメニュー"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* テンプレート表示 */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {template.description}
                    </p>
                    <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                      {PROJECT_CATEGORIES.find(c => c.id === template.category)?.name || template.category}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">主要機能:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      {template.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                      {template.features.length > 3 && (
                        <li className="text-xs text-gray-500 dark:text-gray-400">
                          他 {template.features.length - 3} 個の機能...
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => handleProjectFromTemplate(template)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    このテンプレートを使用
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Toast />
      
      {/* カテゴリ管理モーダル */}
      <CategoryManagementModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryUpdate={handleCategoryUpdate}
      />
    </div>
  )
}