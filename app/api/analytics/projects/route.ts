import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoProjects } from '@/lib/demo-data'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const timeRange = url.searchParams.get('timeRange') || '30d'
    const sortBy = url.searchParams.get('sortBy') || 'created_at'
    const order = url.searchParams.get('order') || 'desc'

    // デモモードの場合はサンプルデータを返す
    if (isDemoMode()) {
      const demoProjects = getDemoProjects()
      const enhancedProjects = demoProjects.map(project => ({
        ...project,
        metrics: generateDemoMetrics(),
        performance: generateDemoPerformance(),
        usage_stats: generateDemoUsageStats()
      }))

      const performanceAnalysis = {
        average_completion_time: '4.2 days',
        success_rate: 87.5,
        most_used_categories: [
          { category: 'crm', count: 4, trend: '+15%' },
          { category: 'cms', count: 3, trend: '+8%' },
          { category: 'todo', count: 3, trend: '+12%' }
        ],
        fastest_projects: enhancedProjects.slice(0, 3),
        slowest_projects: enhancedProjects.slice(-2)
      }

      return NextResponse.json({
        success: true,
        data: {
          projects: enhancedProjects,
          analysis: performanceAnalysis,
          insights: generateDemoInsights()
        },
        timeRange,
        message: 'デモモード: プロジェクト分析データを取得しました'
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

    // 時間範囲の条件
    const timeRangeCondition = getTimeRangeCondition(timeRange)

    // プロジェクトデータとアクティビティデータを並行取得
    const [projectsResult, activitiesResult] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', timeRangeCondition)
        .order(sortBy, { ascending: order === 'asc' }),
      
      supabase
        .from('project_activity')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', timeRangeCondition)
    ])

    if (projectsResult.error) throw projectsResult.error
    if (activitiesResult.error) throw activitiesResult.error

    const projects = projectsResult.data || []
    const activities = activitiesResult.data || []

    // プロジェクトにメトリクスを付加
    const enhancedProjects = await Promise.all(
      projects.map(async (project) => {
        const projectActivities = activities.filter(a => a.project_id === project.id)
        const metrics = calculateProjectMetrics(project, projectActivities)
        
        return {
          ...project,
          metrics,
          activity_count: projectActivities.length,
          last_activity: projectActivities[0]?.created_at || project.updated_at
        }
      })
    )

    // パフォーマンス分析
    const performanceAnalysis = analyzePerformance(enhancedProjects, activities)

    // インサイト生成
    const insights = generateInsights(enhancedProjects, activities)

    return NextResponse.json({
      success: true,
      data: {
        projects: enhancedProjects,
        analysis: performanceAnalysis,
        insights
      },
      timeRange
    })

  } catch (error) {
    console.error('Project analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project analytics' },
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
      return new Date(0).toISOString()
  }
}

function calculateProjectMetrics(project: any, activities: any[]) {
  const createdAt = new Date(project.created_at)
  const updatedAt = new Date(project.updated_at)
  const completedAt = project.completed_at ? new Date(project.completed_at) : null
  
  // プロジェクト期間の計算
  const duration = completedAt 
    ? completedAt.getTime() - createdAt.getTime()
    : updatedAt.getTime() - createdAt.getTime()
  
  const durationDays = Math.ceil(duration / (24 * 60 * 60 * 1000))
  
  // アクティビティ密度
  const activityDensity = activities.length / Math.max(durationDays, 1)
  
  // 進捗スコア（ステータスベース）
  const progressScore = getProgressScore(project.status)
  
  // 複雑度スコア（機能数、技術要件数ベース）
  const complexityScore = calculateComplexityScore(project)

  return {
    duration_days: durationDays,
    activity_density: activityDensity,
    progress_score: progressScore,
    complexity_score: complexityScore,
    completion_rate: completedAt ? 100 : progressScore
  }
}

function getProgressScore(status: string): number {
  const statusScores: { [key: string]: number } = {
    'draft': 20,
    'generating': 60,
    'completed': 90,
    'deployed': 100,
    'error': 10
  }
  return statusScores[status] || 0
}

function calculateComplexityScore(project: any): number {
  let score = 1 // Base score
  
  // 機能数による複雑度
  if (project.features) {
    const featureCount = project.features.split('\n').filter((f: string) => f.trim()).length
    score += Math.min(featureCount * 0.2, 2) // Max +2 for features
  }
  
  // 技術要件による複雑度
  if (project.tech_requirements) {
    const techCount = project.tech_requirements.split('\n').filter((t: string) => t.trim()).length
    score += Math.min(techCount * 0.3, 3) // Max +3 for tech stack
  }
  
  // カテゴリによる複雑度調整
  const categoryComplexity: { [key: string]: number } = {
    'e-commerce': 1.5,
    'dashboard': 1.3,
    'crm': 1.2,
    'cms': 1.1,
    'todo': 0.8,
    'form': 0.7,
    'portfolio': 0.9,
    'blog': 0.8,
    'landing-page': 0.6
  }
  
  score *= categoryComplexity[project.category] || 1.0
  
  return Math.min(Math.round(score * 10) / 10, 5) // Max score of 5, rounded to 1 decimal
}

function analyzePerformance(projects: any[], activities: any[]) {
  const completedProjects = projects.filter(p => p.status === 'completed' || p.status === 'deployed')
  
  // 平均完成時間
  const averageCompletionTime = completedProjects.length > 0
    ? completedProjects.reduce((sum, p) => sum + p.metrics.duration_days, 0) / completedProjects.length
    : 0
  
  // 成功率
  const successRate = projects.length > 0
    ? (completedProjects.length / projects.length) * 100
    : 0

  // カテゴリ別使用統計
  const categoryUsage = new Map()
  projects.forEach(p => {
    const category = p.category
    const existing = categoryUsage.get(category) || { count: 0, trend: 0 }
    categoryUsage.set(category, { ...existing, count: existing.count + 1 })
  })

  const mostUsedCategories = Array.from(categoryUsage.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      trend: `+${Math.floor(Math.random() * 20)}%` // デモ用のトレンド
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 最速・最遅プロジェクト
  const sortedByDuration = [...completedProjects].sort((a, b) => 
    a.metrics.duration_days - b.metrics.duration_days
  )
  
  return {
    average_completion_time: `${averageCompletionTime.toFixed(1)} days`,
    success_rate: Math.round(successRate * 10) / 10,
    most_used_categories: mostUsedCategories,
    fastest_projects: sortedByDuration.slice(0, 3),
    slowest_projects: sortedByDuration.slice(-3).reverse(),
    total_activity_count: activities.length,
    average_project_complexity: projects.length > 0
      ? projects.reduce((sum, p) => sum + p.metrics.complexity_score, 0) / projects.length
      : 0
  }
}

function generateInsights(projects: any[], activities: any[]) {
  const insights = []
  
  // プロジェクト数に基づくインサイト
  if (projects.length > 10) {
    insights.push({
      type: 'success',
      title: '高いプロダクティビティ',
      description: `${projects.length}個のプロジェクトを管理しており、活発な開発活動を行っています。`,
      action: '継続してこのペースを維持しましょう。'
    })
  } else if (projects.length < 3) {
    insights.push({
      type: 'info',
      title: 'プロジェクト開始のチャンス',
      description: '新しいプロジェクトを開始して、開発スキルを向上させる絶好の機会です。',
      action: 'テンプレートを使って新しいプロジェクトを始めてみませんか？'
    })
  }

  // 完了率に基づくインサイト
  const completedCount = projects.filter(p => 
    p.status === 'completed' || p.status === 'deployed'
  ).length
  const completionRate = projects.length > 0 ? completedCount / projects.length : 0

  if (completionRate > 0.8) {
    insights.push({
      type: 'success',
      title: '素晴らしい完了率',
      description: `${Math.round(completionRate * 100)}%のプロジェクトが完了しています。`,
      action: 'この調子で新しいチャレンジに取り組みましょう。'
    })
  } else if (completionRate < 0.3) {
    insights.push({
      type: 'warning',
      title: '完了率の改善が必要',
      description: `完了率が${Math.round(completionRate * 100)}%と低めです。`,
      action: 'プロジェクトのスコープを見直し、小さな目標から始めることをお勧めします。'
    })
  }

  // アクティビティに基づくインサイト
  const recentActivities = activities.filter(a => {
    const activityDate = new Date(a.created_at)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return activityDate > weekAgo
  })

  if (recentActivities.length === 0) {
    insights.push({
      type: 'info',
      title: '活動を再開しましょう',
      description: '最近1週間のプロジェクト活動が少なくなっています。',
      action: '既存のプロジェクトの進捗を確認し、次のステップを計画してみましょう。'
    })
  } else if (recentActivities.length > 20) {
    insights.push({
      type: 'success',
      title: '活発な開発活動',
      description: `最近1週間で${recentActivities.length}件の活動がありました。`,
      action: 'この調子で継続していきましょう。'
    })
  }

  return insights
}

// デモ用のメトリクス生成関数
function generateDemoMetrics() {
  return {
    duration_days: Math.floor(Math.random() * 30) + 1,
    activity_density: Math.random() * 2,
    progress_score: Math.floor(Math.random() * 100),
    complexity_score: Math.random() * 5,
    completion_rate: Math.floor(Math.random() * 100)
  }
}

function generateDemoPerformance() {
  return {
    views: Math.floor(Math.random() * 1000),
    deployments: Math.floor(Math.random() * 10),
    last_deployed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }
}

function generateDemoUsageStats() {
  return {
    api_calls: Math.floor(Math.random() * 10000),
    storage_used: `${Math.floor(Math.random() * 100)}MB`,
    bandwidth_used: `${Math.floor(Math.random() * 1000)}MB`
  }
}

function generateDemoInsights() {
  return [
    {
      type: 'success',
      title: 'プロダクティビティの向上',
      description: '先月と比較してプロジェクト完了率が25%向上しています。',
      action: 'この調子で継続してください。'
    },
    {
      type: 'info',
      title: 'おすすめのテンプレート',
      description: 'CRM系プロジェクトの需要が高まっています。',
      action: 'CRMテンプレートを使った新しいプロジェクトを検討してみましょう。'
    },
    {
      type: 'warning',
      title: 'デプロイメントの最適化',
      description: '一部のプロジェクトでデプロイメントに時間がかかっています。',
      action: 'デプロイメント設定を見直すことをお勧めします。'
    }
  ]
}