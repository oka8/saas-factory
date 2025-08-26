'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'

interface Collaborator {
  id: string
  user_id: string
  role: 'owner' | 'editor' | 'viewer'
  joined_at: string
  user_email: string
  user_name: string | null
  status: 'active' | 'pending' | 'disabled'
}

interface CollaborationActivity {
  id: string
  user_id: string
  action: string
  description: string
  created_at: string
  user_email: string
  user_name: string | null
}

interface CollaborationPanelProps {
  projectId: string
  className?: string
}

export default function CollaborationPanel({ projectId, className = '' }: CollaborationPanelProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const { showToast, Toast } = useToast()
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [activities, setActivities] = useState<CollaborationActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer')
  const [inviting, setInviting] = useState(false)
  const [activeTab, setActiveTab] = useState<'collaborators' | 'activity'>('collaborators')

  useEffect(() => {
    if (user && projectId) {
      fetchCollaborators()
      fetchActivity()
    }
  }, [user, projectId])

  const fetchCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('project_collaborators')
        .select(`
          *,
          profiles (
            email,
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('joined_at', { ascending: false })

      if (error) throw error

      const collaboratorsWithDetails = data.map(collab => ({
        ...collab,
        user_email: collab.profiles?.email || 'unknown',
        user_name: collab.profiles?.full_name || null
      }))

      setCollaborators(collaboratorsWithDetails)
    } catch (err: any) {
      console.error('Error fetching collaborators:', err)
      showToast('コラボレーターの取得に失敗しました', 'error')
    }
  }

  const fetchActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_activity')
        .select(`
          *,
          profiles (
            email,
            full_name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      const activitiesWithDetails = data.map(activity => ({
        ...activity,
        user_email: activity.profiles?.email || 'unknown',
        user_name: activity.profiles?.full_name || null
      }))

      setActivities(activitiesWithDetails)
    } catch (err: any) {
      console.error('Error fetching activity:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !inviteEmail) return

    setInviting(true)
    try {
      // まず、招待するユーザーが存在するかチェック
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', inviteEmail)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }

      if (!userData) {
        showToast('指定されたメールアドレスのユーザーが見つかりません', 'error')
        return
      }

      // 既にコラボレーターでないかチェック
      const { data: existingCollab } = await supabase
        .from('project_collaborators')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userData.id)
        .single()

      if (existingCollab) {
        showToast('このユーザーは既にコラボレーターです', 'error')
        return
      }

      // コラボレーターを追加
      const { error: inviteError } = await supabase
        .from('project_collaborators')
        .insert([{
          project_id: projectId,
          user_id: userData.id,
          role: inviteRole,
          status: 'active',
          invited_by: user.id
        }])

      if (inviteError) throw inviteError

      // アクティビティを記録
      await supabase
        .from('collaboration_activity')
        .insert([{
          project_id: projectId,
          user_id: user.id,
          action: 'user_invited',
          description: `${inviteEmail} を ${inviteRole === 'editor' ? '編集者' : '閲覧者'} として招待しました`
        }])

      setInviteEmail('')
      setInviteRole('viewer')
      fetchCollaborators()
      fetchActivity()
      showToast(`${inviteEmail} を招待しました`, 'success')
    } catch (err: any) {
      console.error('Error inviting collaborator:', err)
      showToast('招待の送信に失敗しました', 'error')
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (collaboratorId: string, newRole: 'editor' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('project_collaborators')
        .update({ role: newRole })
        .eq('id', collaboratorId)

      if (error) throw error

      // アクティビティを記録
      await supabase
        .from('collaboration_activity')
        .insert([{
          project_id: projectId,
          user_id: user!.id,
          action: 'role_changed',
          description: `ユーザーの権限を ${newRole === 'editor' ? '編集者' : '閲覧者'} に変更しました`
        }])

      fetchCollaborators()
      fetchActivity()
      showToast('権限を更新しました', 'success')
    } catch (err: any) {
      console.error('Error updating role:', err)
      showToast('権限の更新に失敗しました', 'error')
    }
  }

  const handleRemoveCollaborator = async (collaboratorId: string, userEmail: string) => {
    if (!confirm(`${userEmail} をコラボレーターから削除しますか？`)) return

    try {
      const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('id', collaboratorId)

      if (error) throw error

      // アクティビティを記録
      await supabase
        .from('collaboration_activity')
        .insert([{
          project_id: projectId,
          user_id: user!.id,
          action: 'user_removed',
          description: `${userEmail} をプロジェクトから削除しました`
        }])

      fetchCollaborators()
      fetchActivity()
      showToast('コラボレーターを削除しました', 'success')
    } catch (err: any) {
      console.error('Error removing collaborator:', err)
      showToast('コラボレーターの削除に失敗しました', 'error')
    }
  }

  const getRoleDisplay = (role: string) => {
    const roleConfig = {
      owner: { label: 'オーナー', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
      editor: { label: '編集者', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      viewer: { label: '閲覧者', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
    }
    return roleConfig[role as keyof typeof roleConfig] || roleConfig.viewer
  }

  const getActivityIcon = (action: string) => {
    const iconMap: Record<string, string> = {
      user_invited: '👤',
      user_joined: '✅',
      user_removed: '❌',
      role_changed: '🔧',
      file_edited: '📝',
      comment_added: '💬',
      deployment: '🚀'
    }
    return iconMap[action] || '📋'
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return '今'
    if (diffInMinutes < 60) return `${diffInMinutes}分前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`
    
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center py-8`}>
        <LoadingSpinner size="md" text="コラボレーション情報を読み込み中..." />
      </div>
    )
  }

  return (
    <div className={className}>
      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'collaborators'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            👥 コラボレーター ({collaborators.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            📋 アクティビティ
          </button>
        </nav>
      </div>

      {activeTab === 'collaborators' ? (
        <div>
          {/* 招待フォーム */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              新しいコラボレーターを招待
            </h4>
            <form onSubmit={handleInvite} className="flex gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="メールアドレス"
                required
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="viewer">閲覧者</option>
                <option value="editor">編集者</option>
              </select>
              <button
                type="submit"
                disabled={inviting || !inviteEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviting ? '招待中...' : '招待'}
              </button>
            </form>
          </div>

          {/* コラボレーター一覧 */}
          <div className="space-y-3">
            {collaborators.length > 0 ? (
              collaborators.map((collaborator) => {
                const roleConfig = getRoleDisplay(collaborator.role)
                const isOwner = collaborator.role === 'owner'
                const isCurrentUser = collaborator.user_id === user?.id
                
                return (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {(collaborator.user_name || collaborator.user_email)[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {collaborator.user_name || collaborator.user_email}
                          {isCurrentUser && <span className="text-gray-500 dark:text-gray-400 ml-2">(あなた)</span>}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {collaborator.user_email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {!isOwner && !isCurrentUser ? (
                        <select
                          value={collaborator.role}
                          onChange={(e) => handleRoleChange(collaborator.id, e.target.value as 'editor' | 'viewer')}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs"
                        >
                          <option value="viewer">閲覧者</option>
                          <option value="editor">編集者</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleConfig.color}`}>
                          {roleConfig.label}
                        </span>
                      )}
                      
                      {!isOwner && !isCurrentUser && (
                        <button
                          onClick={() => handleRemoveCollaborator(collaborator.id, collaborator.user_email)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  まだコラボレーターはいません
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{getActivityIcon(activity.action)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-medium">
                      {activity.user_name || activity.user_email}
                    </span>
                    <span className="ml-2">{activity.description}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTimestamp(activity.created_at)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                アクティビティはありません
              </p>
            </div>
          )}
        </div>
      )}

      <Toast />
    </div>
  )
}