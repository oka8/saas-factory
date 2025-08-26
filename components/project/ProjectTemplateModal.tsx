'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Search, Star, Clock, Users, Zap, Layout, ShoppingCart, FileText, User, Sparkles } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'

interface Template {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  thumbnail?: string
  features: string
  design_preferences: string
  tech_requirements: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_time: string
  is_featured: boolean
  created_by: string
  usage_count: number
}

interface ProjectTemplateModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProjectTemplateModal({ isOpen, onClose }: ProjectTemplateModalProps) {
  const router = useRouter()
  const { showToast, Toast } = useToast()
  
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [customizing, setCustomizing] = useState(false)
  
  // カスタマイズフォーム
  const [customTitle, setCustomTitle] = useState('')
  const [customDescription, setCustomDescription] = useState('')

  const categoryConfig = {
    'all': { label: 'すべて', icon: Layout },
    'landing-page': { label: 'ランディングページ', icon: Layout },
    'dashboard': { label: 'ダッシュボード', icon: Zap },
    'e-commerce': { label: 'ECサイト', icon: ShoppingCart },
    'blog': { label: 'ブログ', icon: FileText },
    'portfolio': { label: 'ポートフォリオ', icon: User },
    'web-app': { label: 'Webアプリ', icon: Layout },
    'other': { label: 'その他', icon: Layout }
  }

  const difficultyConfig = {
    'beginner': { label: '初級', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    'intermediate': { label: '中級', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    'advanced': { label: '上級', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
  }

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
    }
  }, [isOpen, selectedCategory, selectedDifficulty, searchQuery, showFeaturedOnly])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedDifficulty) params.append('difficulty', selectedDifficulty)
      if (searchQuery) params.append('search', searchQuery)
      if (showFeaturedOnly) params.append('featured', 'true')

      const response = await fetch(`/api/templates?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      showToast('テンプレートの取得に失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = async (template: Template) => {
    setCustomizing(true)
    try {
      const response = await fetch(`/api/templates/${template.id}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: customTitle || `${template.name}から作成`,
          description: customDescription || `${template.name}テンプレートから作成されたプロジェクト`
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create project from template')
      }

      const data = await response.json()
      showToast(`テンプレート「${template.name}」からプロジェクトを作成しました`, 'success')
      
      // 新しいプロジェクトページに遷移
      router.push(`/projects/${data.project.id}`)
      onClose()
    } catch (error: any) {
      console.error('Template usage error:', error)
      showToast(error.message || 'テンプレートの使用に失敗しました', 'error')
    } finally {
      setCustomizing(false)
    }
  }

  if (!isOpen) return null

  const filteredTemplates = templates

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* オーバーレイ */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* モーダルコンテンツ */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full sm:p-6">
          
          {selectedTemplate ? (
            /* テンプレート詳細・カスタマイズビュー */
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ← 戻る
                  </button>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      テンプレートをカスタマイズ
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* テンプレート情報 */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">テンプレート情報</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{selectedTemplate.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedTemplate.estimated_time}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {selectedTemplate.usage_count} 回使用
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${difficultyConfig[selectedTemplate.difficulty].color}`}>
                          {difficultyConfig[selectedTemplate.difficulty].label}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">機能</h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">{selectedTemplate.features}</p>
                        </div>
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">技術要件</h5>
                          <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">{selectedTemplate.tech_requirements}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* カスタマイズフォーム */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">プロジェクト設定</h4>
                  
                  <div>
                    <label htmlFor="customTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      プロジェクト名
                    </label>
                    <input
                      type="text"
                      id="customTitle"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder={`${selectedTemplate.name}から作成`}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="customDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      説明
                    </label>
                    <textarea
                      id="customDescription"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      rows={3}
                      placeholder={`${selectedTemplate.name}テンプレートから作成されたプロジェクト`}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleUseTemplate(selectedTemplate)}
                      disabled={customizing}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {customizing ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          作成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          このテンプレートを使用
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* テンプレート一覧ビュー */
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    プロジェクトテンプレートを選択
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    事前に定義されたテンプレートから新しいプロジェクトを作成します
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* フィルターとサーチ */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="テンプレートを検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>

                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">すべての難易度</option>
                    <option value="beginner">初級</option>
                    <option value="intermediate">中級</option>
                    <option value="advanced">上級</option>
                  </select>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showFeaturedOnly}
                      onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">おすすめのみ</span>
                  </label>
                </div>
              </div>

              {/* テンプレート一覧 */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="md" text="テンプレートを読み込み中..." />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layout className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">条件に一致するテンプレートが見つかりません</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {filteredTemplates.map((template) => {
                    const CategoryIcon = categoryConfig[template.category as keyof typeof categoryConfig]?.icon || Layout
                    
                    return (
                      <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="w-4 h-4 text-gray-400" />
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{template.name}</h4>
                          </div>
                          {template.is_featured && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{template.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${difficultyConfig[template.difficulty].color}`}>
                            {difficultyConfig[template.difficulty].label}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {template.estimated_time}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => setSelectedTemplate(template)}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-sm transition-colors"
                        >
                          このテンプレートを使用
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Toast />
    </div>
  )
}