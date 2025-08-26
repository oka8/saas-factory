'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface HistoryEntry {
  id: string
  project_id: string
  action: 'created' | 'updated' | 'shared' | 'deployed' | 'deleted' | 'regenerated'
  details: string
  metadata?: {
    old_values?: Record<string, any>
    new_values?: Record<string, any>
    user_agent?: string
    ip_address?: string
  }
  created_at: string
  user_id: string
  user_email?: string
}

interface ProjectHistoryProps {
  projectId: string
  className?: string
}

export default function ProjectHistory({ projectId, className = '' }: ProjectHistoryProps) {
  const { user } = useAuth()
  const supabase = createClient()
  
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<string | null>(null)

  useEffect(() => {
    if (user && projectId) {
      fetchProjectHistory()
    }
  }, [user, projectId])

  const fetchProjectHistory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_history')
        .select(`
          *,
          profiles (
            email
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const historyWithEmails = data.map(entry => ({
        ...entry,
        user_email: entry.profiles?.email || 'unknown'
      }))

      setHistory(historyWithEmails)
    } catch (err: any) {
      console.error('Error fetching project history:', err)
      setError('履歴の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const getActionDisplay = (action: HistoryEntry['action']) => {
    const actionConfig = {
      created: { 
        label: '作成', 
        icon: '📝', 
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      },
      updated: { 
        label: '更新', 
        icon: '✏️', 
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      },
      shared: { 
        label: '共有', 
        icon: '🔗', 
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
      },
      deployed: { 
        label: 'デプロイ', 
        icon: '🚀', 
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20'
      },
      deleted: { 
        label: '削除', 
        icon: '🗑️', 
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
      },
      regenerated: { 
        label: '再生成', 
        icon: '🔄', 
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
      }
    }
    return actionConfig[action] || actionConfig.updated
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return '今'
    if (diffInMinutes < 60) return `${diffInMinutes}分前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}日前`
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderMetadataDetails = (entry: HistoryEntry) => {
    if (!entry.metadata) return null

    return (
      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
        {entry.metadata.old_values && entry.metadata.new_values && (
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700 dark:text-gray-300">変更内容:</h5>
            {Object.keys(entry.metadata.new_values).map(key => {
              const oldValue = entry.metadata!.old_values![key]
              const newValue = entry.metadata!.new_values![key]
              if (oldValue !== newValue) {
                return (
                  <div key={key} className="text-xs">
                    <span className="font-medium text-gray-600 dark:text-gray-400">{key}:</span>
                    <div className="ml-2">
                      <span className="text-red-600 dark:text-red-400 line-through">{oldValue}</span>
                      {' → '}
                      <span className="text-green-600 dark:text-green-400">{newValue}</span>
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        )}
        
        {entry.metadata.user_agent && (
          <div className="mt-2">
            <span className="font-medium text-gray-600 dark:text-gray-400">ブラウザ:</span>
            <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
              {entry.metadata.user_agent.split(' ')[0]}
            </span>
          </div>
        )}
        
        {entry.metadata.ip_address && (
          <div className="mt-1">
            <span className="font-medium text-gray-600 dark:text-gray-400">IP:</span>
            <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">
              {entry.metadata.ip_address}
            </span>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center py-8`}>
        <LoadingSpinner size="md" text="履歴を読み込み中..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className} text-center py-8`}>
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <button
          onClick={fetchProjectHistory}
          className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
        >
          再試行
        </button>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className={`${className} text-center py-8`}>
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          履歴はありません
        </h4>
        <p className="text-gray-500 dark:text-gray-400">
          プロジェクトの変更履歴がここに表示されます
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {history.map((entry, index) => {
          const actionConfig = getActionDisplay(entry.action)
          const isExpanded = showDetails === entry.id
          
          return (
            <div 
              key={entry.id}
              className={`relative ${actionConfig.bgColor} rounded-lg p-4 border border-gray-200 dark:border-gray-600`}
            >
              {/* Timeline line */}
              {index < history.length - 1 && (
                <div className="absolute left-6 top-12 w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              )}

              <div className="flex items-start gap-4">
                {/* Action icon */}
                <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
                  <span className="text-sm">{actionConfig.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        <span className={actionConfig.color}>{actionConfig.label}</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {entry.details}
                        </span>
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{entry.user_email}</span>
                        <span>•</span>
                        <span>{formatTimestamp(entry.created_at)}</span>
                      </div>
                    </div>

                    {entry.metadata && (
                      <button
                        onClick={() => setShowDetails(isExpanded ? null : entry.id)}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                      >
                        詳細
                        <svg 
                          className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {isExpanded && renderMetadataDetails(entry)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Load more button */}
      {history.length >= 20 && (
        <div className="mt-6 text-center">
          <button
            onClick={fetchProjectHistory}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
          >
            さらに読み込む
          </button>
        </div>
      )}
    </div>
  )
}