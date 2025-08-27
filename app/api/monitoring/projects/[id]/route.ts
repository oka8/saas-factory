import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo-data'

interface MonitoringData {
  performance?: Record<string, unknown>
  usage?: Record<string, unknown>
  errors?: Record<string, unknown>
  activity?: Record<string, unknown>
  realtime?: Record<string, unknown>
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const url = new URL(request.url)
    const metric = url.searchParams.get('metric') || 'all' // all, performance, usage, errors, activity

    // デモモードの場合はサンプルデータを返す
    if (isDemoMode()) {
      const demoMetrics = generateDemoMetrics(metric)
      return NextResponse.json({
        success: true,
        data: demoMetrics,
        timestamp: new Date().toISOString(),
        message: 'デモモード: プロジェクト監視データを取得しました'
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

    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // メトリクス別にデータを取得
    const monitoringData: MonitoringData = {}

    if (metric === 'all' || metric === 'performance') {
      monitoringData.performance = await getPerformanceMetrics(supabase, id)
    }

    if (metric === 'all' || metric === 'usage') {
      monitoringData.usage = await getUsageMetrics(supabase, id)
    }

    if (metric === 'all' || metric === 'errors') {
      monitoringData.errors = await getErrorMetrics(supabase, id)
    }

    if (metric === 'all' || metric === 'activity') {
      monitoringData.activity = await getActivityMetrics(supabase, id)
    }

    // リアルタイム統計
    if (metric === 'all') {
      monitoringData.realtime = await getRealtimeStats(supabase, id)
    }

    return NextResponse.json({
      success: true,
      data: monitoringData,
      project_info: {
        id: project.id,
        title: project.title,
        status: project.status,
        category: project.category
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Project monitoring error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

async function getPerformanceMetrics(supabase: any, projectId: string) {
  // デプロイメントURL関連のパフォーマンスメトリクス（実際の実装では外部APIfetch）
  const mockPerformanceData = {
    response_time: Math.random() * 1000 + 200, // 200-1200ms
    availability: 99.9,
    throughput: Math.floor(Math.random() * 1000) + 100, // requests per hour
    error_rate: Math.random() * 0.5, // 0-0.5%
    cpu_usage: Math.random() * 100,
    memory_usage: Math.random() * 100,
    disk_usage: Math.random() * 100
  }

  return mockPerformanceData
}

async function getUsageMetrics(supabase: any, projectId: string) {
  // 使用量メトリクス
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // プロジェクト関連のアクティビティ数を取得
  const { count: activityCount } = await supabase
    .from('project_activity')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .gte('created_at', last24h.toISOString())

  return {
    page_views: Math.floor(Math.random() * 10000) + 100,
    unique_visitors: Math.floor(Math.random() * 1000) + 50,
    api_calls: Math.floor(Math.random() * 5000) + 200,
    data_transfer: `${(Math.random() * 100).toFixed(2)} MB`,
    storage_used: `${(Math.random() * 500).toFixed(1)} MB`,
    bandwidth_used: `${(Math.random() * 1000).toFixed(1)} MB`,
    activity_count: activityCount || 0
  }
}

async function getErrorMetrics(supabase: any, projectId: string) {
  // エラーメトリクス（実際の実装ではログ集計システムから取得）
  return {
    total_errors: Math.floor(Math.random() * 50),
    error_rate: Math.random() * 2, // 0-2%
    critical_errors: Math.floor(Math.random() * 5),
    warnings: Math.floor(Math.random() * 20),
    recent_errors: generateRecentErrors()
  }
}

async function getActivityMetrics(supabase: any, projectId: string) {
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // 最近のアクティビティを取得
  const { data: activities, error } = await supabase
    .from('project_activity')
    .select('*')
    .eq('project_id', projectId)
    .gte('created_at', last24h.toISOString())
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Activity fetch error:', error)
  }

  // 時間別のアクティビティ分布
  const hourlyActivity = new Array(24).fill(0)
  activities?.forEach(activity => {
    const hour = new Date(activity.created_at).getHours()
    hourlyActivity[hour]++
  })

  return {
    total_activities_24h: activities?.length || 0,
    hourly_distribution: hourlyActivity,
    recent_activities: activities?.slice(0, 10) || [],
    activity_types: analyzeActivityTypes(activities || [])
  }
}

async function getRealtimeStats(supabase: any, projectId: string) {
  // リアルタイム統計（実際の実装では各種データソースから取得）
  return {
    current_users: Math.floor(Math.random() * 100),
    requests_per_minute: Math.floor(Math.random() * 500) + 10,
    average_response_time: Math.random() * 1000 + 100,
    status: Math.random() > 0.1 ? 'healthy' : 'degraded',
    last_deployment: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    uptime: `${(99 + Math.random()).toFixed(3)}%`
  }
}

function analyzeActivityTypes(activities: any[]) {
  const typeCount = new Map()
  activities.forEach(activity => {
    const type = activity.action
    typeCount.set(type, (typeCount.get(type) || 0) + 1)
  })

  return Array.from(typeCount.entries()).map(([type, count]) => ({
    type,
    count,
    percentage: activities.length > 0 ? (count / activities.length) * 100 : 0
  }))
}

function generateRecentErrors() {
  const errorTypes = [
    { type: '404 Not Found', count: Math.floor(Math.random() * 10) },
    { type: '500 Internal Server Error', count: Math.floor(Math.random() * 5) },
    { type: 'Database Connection Error', count: Math.floor(Math.random() * 3) },
    { type: 'API Rate Limit', count: Math.floor(Math.random() * 8) },
    { type: 'Timeout Error', count: Math.floor(Math.random() * 6) }
  ]

  return errorTypes.filter(error => error.count > 0)
}

function generateDemoMetrics(metric: string) {
  const baseMetrics = {
    performance: {
      response_time: Math.random() * 800 + 150,
      availability: 99.8 + Math.random() * 0.2,
      throughput: Math.floor(Math.random() * 800) + 200,
      error_rate: Math.random() * 0.3,
      cpu_usage: Math.random() * 80 + 10,
      memory_usage: Math.random() * 70 + 15,
      disk_usage: Math.random() * 60 + 20
    },
    usage: {
      page_views: Math.floor(Math.random() * 8000) + 500,
      unique_visitors: Math.floor(Math.random() * 800) + 100,
      api_calls: Math.floor(Math.random() * 3000) + 300,
      data_transfer: `${(Math.random() * 80).toFixed(2)} MB`,
      storage_used: `${(Math.random() * 300).toFixed(1)} MB`,
      bandwidth_used: `${(Math.random() * 800).toFixed(1)} MB`,
      activity_count: Math.floor(Math.random() * 50) + 5
    },
    errors: {
      total_errors: Math.floor(Math.random() * 30),
      error_rate: Math.random() * 1.5,
      critical_errors: Math.floor(Math.random() * 3),
      warnings: Math.floor(Math.random() * 15),
      recent_errors: generateRecentErrors()
    },
    activity: {
      total_activities_24h: Math.floor(Math.random() * 100) + 10,
      hourly_distribution: Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)),
      recent_activities: generateDemoActivities(),
      activity_types: [
        { type: 'project_updated', count: 8, percentage: 40 },
        { type: 'code_generated', count: 6, percentage: 30 },
        { type: 'deployment_created', count: 4, percentage: 20 },
        { type: 'project_shared', count: 2, percentage: 10 }
      ]
    },
    realtime: {
      current_users: Math.floor(Math.random() * 50) + 5,
      requests_per_minute: Math.floor(Math.random() * 300) + 50,
      average_response_time: Math.random() * 600 + 200,
      status: Math.random() > 0.15 ? 'healthy' : 'degraded',
      last_deployment: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      uptime: `${(99 + Math.random()).toFixed(3)}%`
    }
  }

  if (metric === 'all') {
    return baseMetrics
  } else {
    return { [metric]: baseMetrics[metric as keyof typeof baseMetrics] }
  }
}

function generateDemoActivities() {
  const activities = [
    { action: 'project_updated', description: 'プロジェクトが更新されました', created_at: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString() },
    { action: 'code_generated', description: 'コードが生成されました', created_at: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString() },
    { action: 'deployment_created', description: 'デプロイメントが作成されました', created_at: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString() },
    { action: 'project_shared', description: 'プロジェクトが共有されました', created_at: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000).toISOString() }
  ]

  return activities.slice(0, Math.floor(Math.random() * 4) + 1)
}