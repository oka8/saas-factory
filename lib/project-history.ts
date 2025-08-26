import { createClient } from '@/lib/supabase/client'

export type HistoryAction = 'created' | 'updated' | 'shared' | 'deployed' | 'deleted' | 'regenerated'

interface LogHistoryParams {
  projectId: string
  action: HistoryAction
  details: string
  userId: string
  metadata?: {
    old_values?: Record<string, any>
    new_values?: Record<string, any>
    user_agent?: string
    ip_address?: string
    [key: string]: any
  }
}

export const logProjectHistory = async ({
  projectId,
  action,
  details,
  userId,
  metadata
}: LogHistoryParams): Promise<void> => {
  const supabase = createClient()

  try {
    // ブラウザ情報を自動取得
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    
    const historyEntry = {
      project_id: projectId,
      action,
      details,
      user_id: userId,
      metadata: {
        ...metadata,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      }
    }

    const { error } = await supabase
      .from('project_history')
      .insert([historyEntry])

    if (error) {
      console.error('Error logging project history:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to log project history:', error)
    // 履歴ログの失敗は致命的ではないので、エラーを投げない
  }
}

// プロジェクト作成時の履歴記録
export const logProjectCreated = async (projectId: string, userId: string, projectTitle: string) => {
  return logProjectHistory({
    projectId,
    action: 'created',
    details: `プロジェクト「${projectTitle}」を作成しました`,
    userId
  })
}

// プロジェクト更新時の履歴記録
export const logProjectUpdated = async (
  projectId: string, 
  userId: string, 
  changes: { field: string; oldValue: any; newValue: any }[]
) => {
  const changedFields = changes.map(c => c.field).join(', ')
  const oldValues = changes.reduce((acc, c) => ({ ...acc, [c.field]: c.oldValue }), {})
  const newValues = changes.reduce((acc, c) => ({ ...acc, [c.field]: c.newValue }), {})

  return logProjectHistory({
    projectId,
    action: 'updated',
    details: `プロジェクトを更新しました (${changedFields})`,
    userId,
    metadata: {
      old_values: oldValues,
      new_values: newValues
    }
  })
}

// プロジェクト共有時の履歴記録
export const logProjectShared = async (
  projectId: string, 
  userId: string, 
  shareType: 'public' | 'private',
  allowedEmails?: string[]
) => {
  const shareDetails = shareType === 'public' 
    ? 'プロジェクトをパブリック共有しました'
    : `プロジェクトをプライベート共有しました (${allowedEmails?.length || 0}名)`

  return logProjectHistory({
    projectId,
    action: 'shared',
    details: shareDetails,
    userId,
    metadata: {
      share_type: shareType,
      allowed_emails: allowedEmails
    }
  })
}

// プロジェクトデプロイ時の履歴記録
export const logProjectDeployed = async (
  projectId: string, 
  userId: string, 
  deploymentUrl?: string,
  deploymentProvider?: string
) => {
  return logProjectHistory({
    projectId,
    action: 'deployed',
    details: `プロジェクトをデプロイしました${deploymentProvider ? ` (${deploymentProvider})` : ''}`,
    userId,
    metadata: {
      deployment_url: deploymentUrl,
      deployment_provider: deploymentProvider
    }
  })
}

// プロジェクト再生成時の履歴記録
export const logProjectRegenerated = async (
  projectId: string, 
  userId: string, 
  reason?: string
) => {
  return logProjectHistory({
    projectId,
    action: 'regenerated',
    details: `プロジェクトを再生成しました${reason ? ` (${reason})` : ''}`,
    userId,
    metadata: {
      regeneration_reason: reason
    }
  })
}

// プロジェクト削除時の履歴記録
export const logProjectDeleted = async (
  projectId: string, 
  userId: string, 
  projectTitle: string
) => {
  return logProjectHistory({
    projectId,
    action: 'deleted',
    details: `プロジェクト「${projectTitle}」を削除しました`,
    userId
  })
}

// 履歴の取得
export const getProjectHistory = async (projectId: string, limit: number = 20, offset: number = 0) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('project_history')
    .select(`
      *,
      profiles (
        email,
        full_name
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching project history:', error)
    throw error
  }

  return data
}

// 特定のアクションタイプの履歴を取得
export const getProjectHistoryByAction = async (
  projectId: string, 
  action: HistoryAction,
  limit: number = 10
) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('project_history')
    .select(`
      *,
      profiles (
        email,
        full_name
      )
    `)
    .eq('project_id', projectId)
    .eq('action', action)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching project history by action:', error)
    throw error
  }

  return data
}

// ユーザーのアクティビティ統計を取得
export const getUserProjectActivityStats = async (userId: string, days: number = 30) => {
  const supabase = createClient()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('project_history')
    .select('action, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())

  if (error) {
    console.error('Error fetching user activity stats:', error)
    throw error
  }

  // アクションタイプ別の統計を計算
  const stats = data.reduce((acc: Record<string, number>, entry) => {
    acc[entry.action] = (acc[entry.action] || 0) + 1
    return acc
  }, {})

  return {
    total: data.length,
    byAction: stats,
    period: `${days}日間`
  }
}