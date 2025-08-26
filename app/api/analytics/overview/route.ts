import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo-data'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const timeRange = url.searchParams.get('timeRange') || '30d' // 7d, 30d, 90d, 1y, all

    // デモモードの場合はサンプルデータを返す
    if (isDemoMode()) {
      const demoStats = {
        overview: {
          total_projects: 15,
          active_projects: 8,
          completed_projects: 6,
          deployed_projects: 4,
          total_templates: 12,
          favorite_projects: 3
        },
        trends: {
          projects_created_this_period: 5,
          projects_completed_this_period: 3,
          deployments_this_period: 2,
          growth_rate: 25.5
        },
        category_breakdown: [
          { category: 'crm', name: 'CRM・顧客管理', count: 4, percentage: 26.7 },
          { category: 'cms', name: 'CMS・コンテンツ管理', count: 3, percentage: 20.0 },
          { category: 'todo', name: 'タスク管理', count: 3, percentage: 20.0 },
          { category: 'dashboard', name: 'ダッシュボード', count: 2, percentage: 13.3 },
          { category: 'other', name: 'その他', count: 3, percentage: 20.0 }
        ],
        status_breakdown: [
          { status: 'completed', name: '完了', count: 6, percentage: 40.0, color: '#10B981' },
          { status: 'draft', name: '下書き', count: 5, percentage: 33.3, color: '#6B7280' },
          { status: 'deployed', name: 'デプロイ済み', count: 4, percentage: 26.7, color: '#3B82F6' }
        ],
        activity_timeline: generateDemoTimeline(timeRange),
        tech_stack_usage: [
          { tech: 'Next.js', count: 8, percentage: 53.3 },
          { tech: 'React', count: 12, percentage: 80.0 },
          { tech: 'TypeScript', count: 10, percentage: 66.7 },
          { tech: 'Tailwind CSS', count: 9, percentage: 60.0 },
          { tech: 'Supabase', count: 6, percentage: 40.0 },
          { tech: 'Node.js', count: 5, percentage: 33.3 }
        ]
      }

      return NextResponse.json({
        success: true,
        data: demoStats,
        timeRange,
        message: 'デモモード: アナリティクスデータを取得しました'
      })
    }

    const supabase = await createClient()

    // 現在のユーザーを取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 時間範囲の計算
    const timeRangeCondition = getTimeRangeCondition(timeRange)

    // 基本統計を並行取得
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      deployedProjects,
      favoriteProjects,
      categoryBreakdown,
      statusBreakdown,
      recentActivity
    ] = await Promise.all([
      // 総プロジェクト数
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // アクティブプロジェクト数（下書きまたは生成中）
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['draft', 'generating']),
      
      // 完了プロジェクト数
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed'),
      
      // デプロイ済みプロジェクト数
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'deployed'),
      
      // お気に入りプロジェクト数
      supabase
        .from('project_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      
      // カテゴリ別内訳
      supabase
        .from('projects')
        .select('category')
        .eq('user_id', user.id),
      
      // ステータス別内訳
      supabase
        .from('projects')
        .select('status')
        .eq('user_id', user.id),
      
      // 最近のアクティビティ
      supabase
        .from('project_activity')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', timeRangeCondition)
        .order('created_at', { ascending: false })
        .limit(50)
    ])

    // カテゴリ別集計
    const categoryStats = processCategoryBreakdown(categoryBreakdown.data || [])
    
    // ステータス別集計
    const statusStats = processStatusBreakdown(statusBreakdown.data || [])

    // アクティビティタイムラインの生成
    const timeline = processActivityTimeline(recentActivity.data || [], timeRange)

    const analytics = {
      overview: {
        total_projects: totalProjects.count || 0,
        active_projects: activeProjects.count || 0,
        completed_projects: completedProjects.count || 0,
        deployed_projects: deployedProjects.count || 0,
        favorite_projects: favoriteProjects.count || 0
      },
      trends: calculateTrends(recentActivity.data || [], timeRange),
      category_breakdown: categoryStats,
      status_breakdown: statusStats,
      activity_timeline: timeline
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      timeRange
    })

  } catch (error) {
    console.error('Analytics overview error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

function getTimeRangeCondition(timeRange: string): string {
  const now = new Date()
  
  switch (timeRange) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
    default:
      return new Date(0).toISOString() // all time
  }
}

function processCategoryBreakdown(projects: any[]) {
  const categoryMap = new Map()
  const total = projects.length
  
  projects.forEach(project => {
    const category = project.category
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
  })

  return Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    name: getCategoryDisplayName(category),
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  }))
}

function processStatusBreakdown(projects: any[]) {
  const statusMap = new Map()
  const total = projects.length
  
  projects.forEach(project => {
    const status = project.status
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })

  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    name: getStatusDisplayName(status),
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    color: getStatusColor(status)
  }))
}

function processActivityTimeline(activities: any[], timeRange: string) {
  // アクティビティを日付別にグループ化
  const dailyActivity = new Map()
  
  activities.forEach(activity => {
    const date = new Date(activity.created_at).toISOString().split('T')[0]
    dailyActivity.set(date, (dailyActivity.get(date) || 0) + 1)
  })

  // 時間範囲に基づいてデータ点数を調整
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
  const timeline = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    timeline.push({
      date: dateStr,
      count: dailyActivity.get(dateStr) || 0
    })
  }

  return timeline
}

function calculateTrends(activities: any[], timeRange: string) {
  const now = new Date()
  const timeRangeMs = getTimeRangeMs(timeRange)
  const previousPeriodStart = new Date(now.getTime() - timeRangeMs * 2)
  const currentPeriodStart = new Date(now.getTime() - timeRangeMs)

  const currentPeriodActivities = activities.filter(a => 
    new Date(a.created_at) >= currentPeriodStart
  )
  const previousPeriodActivities = activities.filter(a => 
    new Date(a.created_at) >= previousPeriodStart && 
    new Date(a.created_at) < currentPeriodStart
  )

  const currentCount = currentPeriodActivities.length
  const previousCount = previousPeriodActivities.length

  const growthRate = previousCount > 0 
    ? ((currentCount - previousCount) / previousCount) * 100 
    : currentCount > 0 ? 100 : 0

  return {
    projects_created_this_period: currentPeriodActivities.filter(a => a.action === 'project_created').length,
    projects_completed_this_period: currentPeriodActivities.filter(a => a.action === 'project_completed').length,
    deployments_this_period: currentPeriodActivities.filter(a => a.action === 'project_deployed').length,
    growth_rate: growthRate
  }
}

function getTimeRangeMs(timeRange: string): number {
  switch (timeRange) {
    case '7d': return 7 * 24 * 60 * 60 * 1000
    case '30d': return 30 * 24 * 60 * 60 * 1000
    case '90d': return 90 * 24 * 60 * 60 * 1000
    case '1y': return 365 * 24 * 60 * 60 * 1000
    default: return 30 * 24 * 60 * 60 * 1000
  }
}

function getCategoryDisplayName(category: string): string {
  const categoryNames: { [key: string]: string } = {
    'crm': 'CRM・顧客管理',
    'cms': 'CMS・コンテンツ管理',
    'todo': 'タスク管理',
    'inventory': '在庫管理',
    'form': 'フォーム・アンケート',
    'dashboard': 'ダッシュボード',
    'e-commerce': 'Eコマース',
    'landing-page': 'ランディングページ',
    'blog': 'ブログ',
    'portfolio': 'ポートフォリオ',
    'other': 'その他'
  }
  return categoryNames[category] || category
}

function getStatusDisplayName(status: string): string {
  const statusNames: { [key: string]: string } = {
    'draft': '下書き',
    'generating': '生成中',
    'completed': '完了',
    'deployed': 'デプロイ済み',
    'error': 'エラー'
  }
  return statusNames[status] || status
}

function getStatusColor(status: string): string {
  const statusColors: { [key: string]: string } = {
    'draft': '#6B7280',
    'generating': '#F59E0B',
    'completed': '#10B981',
    'deployed': '#3B82F6',
    'error': '#EF4444'
  }
  return statusColors[status] || '#6B7280'
}

function generateDemoTimeline(timeRange: string) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
  const timeline = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    timeline.push({
      date: dateStr,
      count: Math.floor(Math.random() * 5) + (i < 7 ? 2 : 0) // Recent days have more activity
    })
  }

  return timeline
}