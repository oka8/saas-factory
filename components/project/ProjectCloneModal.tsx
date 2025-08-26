'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, X, Settings, Code, Users, Globe } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'

interface ProjectCloneModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
}

export function ProjectCloneModal({ 
  isOpen, 
  onClose, 
  projectId, 
  projectTitle 
}: ProjectCloneModalProps) {
  const router = useRouter()
  const { showToast, Toast } = useToast()
  
  const [title, setTitle] = useState(`${projectTitle} のコピー`)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  
  // クローン設定
  const [cloneSettings, setCloneSettings] = useState({
    include_generated_code: true,
    include_deployment_settings: false,
    include_collaborators: false
  })

  if (!isOpen) return null

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      showToast('プロジェクト名を入力してください', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          clone_settings: cloneSettings
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clone project')
      }

      const data = await response.json()
      showToast('プロジェクトをクローンしました', 'success')
      
      // 新しいプロジェクトページに遷移
      router.push(`/projects/${data.cloned_project.id}`)
      onClose()
    } catch (error: any) {
      console.error('Clone error:', error)
      showToast(error.message || 'クローンに失敗しました', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (setting: keyof typeof cloneSettings) => {
    setCloneSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* オーバーレイ */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* モーダルコンテンツ */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Copy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    プロジェクトをクローン
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {projectTitle}
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

            <form onSubmit={handleClone} className="space-y-6">
              {/* 基本情報 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">基本情報</h4>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    プロジェクト名 *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="新しいプロジェクト名"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    説明
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="プロジェクトの説明（オプション）"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    カテゴリ
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">カテゴリを選択</option>
                    <option value="web-app">Webアプリケーション</option>
                    <option value="mobile-app">モバイルアプリ</option>
                    <option value="api">API</option>
                    <option value="dashboard">ダッシュボード</option>
                    <option value="landing-page">ランディングページ</option>
                    <option value="e-commerce">ECサイト</option>
                    <option value="blog">ブログ</option>
                    <option value="portfolio">ポートフォリオ</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>

              {/* クローン設定 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  クローン設定
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={cloneSettings.include_generated_code}
                      onChange={() => handleSettingChange('include_generated_code')}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        生成されたコードを含める
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={cloneSettings.include_deployment_settings}
                      onChange={() => handleSettingChange('include_deployment_settings')}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        デプロイメント設定を含める
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={cloneSettings.include_collaborators}
                      onChange={() => handleSettingChange('include_collaborators')}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        コラボレーターを含める
                      </span>
                    </div>
                  </label>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 ヒント: 生成されたコードを含めると、元のプロジェクトと同じ状態からスタートできます。
                    デプロイメント設定とコラボレーターはプロジェクトオーナーのみがコピーできます。
                  </p>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={loading}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      クローン中...
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      クローン
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Toast />
    </div>
  )
}