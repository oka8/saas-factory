'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Activity, Calendar, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface AnalyticsData {
  overview: {
    total_projects: number
    active_projects: number
    completed_projects: number
    deployed_projects: number
    favorite_projects: number
  }
  trends: {
    projects_created_this_period: number
    projects_completed_this_period: number
    deployments_this_period: number
    growth_rate: number
  }
  category_breakdown: Array<{
    category: string
    name: string
    count: number
    percentage: number
  }>
  status_breakdown: Array<{
    status: string
    name: string
    count: number
    percentage: number
    color: string
  }>
  activity_timeline: Array<{
    date: string
    count: number
  }>
  tech_stack_usage?: Array<{
    tech: string
    count: number
    percentage: number
  }>
}

interface ProjectAnalytics {
  projects: Array<{
    id: string
    title: string
    status: string
    category: string
    metrics: {
      duration_days: number
      activity_density: number
      progress_score: number
      complexity_score: number
      completion_rate: number
    }
    activity_count: number
    last_activity: string
  }>
  analysis: {
    average_completion_time: string
    success_rate: number
    most_used_categories: Array<{
      category: string
      count: number
      trend: string
    }>
    fastest_projects: any[]
    slowest_projects: any[]
    total_activity_count: number
    average_project_complexity: number
  }
  insights: Array<{
    type: 'success' | 'warning' | 'info'
    title: string
    description: string
    action: string
  }>
}

interface AnalyticsDashboardProps {
  timeRange: string
  onTimeRangeChange: (range: string) => void
}

export function AnalyticsDashboard({ timeRange, onTimeRangeChange }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [projectAnalytics, setProjectAnalytics] = useState<ProjectAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [overviewRes, projectsRes] = await Promise.all([
        fetch(`/api/analytics/overview?timeRange=${timeRange}`),
        fetch(`/api/analytics/projects?timeRange=${timeRange}`)
      ])

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json()
        if (overviewData.success) {
          setAnalyticsData(overviewData.data)
        }
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        if (projectsData.success) {
          setProjectAnalytics(projectsData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const timeRangeOptions = [
    { value: '7d', label: '7日間' },
    { value: '30d', label: '30日間' },
    { value: '90d', label: '90日間' },
    { value: '1y', label: '1年間' },
    { value: 'all', label: '全期間' }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            アナリティクス・レポート
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            プロジェクトの進捗と統計情報を確認
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Tab Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              概要
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              プロジェクト分析
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && analyticsData && (
        <OverviewTab analyticsData={analyticsData} timeRange={timeRange} />
      )}

      {activeTab === 'projects' && projectAnalytics && (
        <ProjectsTab projectAnalytics={projectAnalytics} timeRange={timeRange} />
      )}
    </div>
  )
}

function OverviewTab({ analyticsData, timeRange }: { analyticsData: AnalyticsData, timeRange: string }) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="総プロジェクト数"
          value={analyticsData.overview.total_projects}
          icon={BarChart3}
          color="blue"
          trend={analyticsData.trends.growth_rate > 0 ? `+${analyticsData.trends.growth_rate.toFixed(1)}%` : undefined}
        />
        <MetricCard
          title="アクティブプロジェクト"
          value={analyticsData.overview.active_projects}
          icon={Activity}
          color="yellow"
          subtitle="進行中"
        />
        <MetricCard
          title="完了プロジェクト"
          value={analyticsData.overview.completed_projects}
          icon={CheckCircle2}
          color="green"
          subtitle="成功"
        />
        <MetricCard
          title="デプロイ済み"
          value={analyticsData.overview.deployed_projects}
          icon={TrendingUp}
          color="purple"
          subtitle="公開中"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            カテゴリ別内訳
          </h3>
          <div className="space-y-3">
            {analyticsData.category_breakdown.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {category.count}個
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ({category.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            ステータス別内訳
          </h3>
          <div className="space-y-3">
            {analyticsData.status_breakdown.map((status) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {status.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {status.count}個
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ({status.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          アクティビティタイムライン
        </h3>
        <div className="h-32 flex items-end justify-between gap-1">
          {analyticsData.activity_timeline.map((day, index) => (
            <div key={day.date} className="flex flex-col items-center flex-1">
              <div 
                className="bg-blue-500 rounded-t w-full min-h-[2px] transition-all hover:bg-blue-600"
                style={{ 
                  height: `${Math.max((day.count / Math.max(...analyticsData.activity_timeline.map(d => d.count))) * 100, 2)}px` 
                }}
                title={`${new Date(day.date).toLocaleDateString('ja-JP')}: ${day.count}件`}
              ></div>
              {index % Math.ceil(analyticsData.activity_timeline.length / 7) === 0 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(day.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Usage (if available) */}
      {analyticsData.tech_stack_usage && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            技術スタック使用状況
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {analyticsData.tech_stack_usage.map((tech) => (
              <div key={tech.tech} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {tech.tech}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {tech.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectsTab({ projectAnalytics, timeRange }: { projectAnalytics: ProjectAnalytics, timeRange: string }) {
  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="平均完成時間"
          value={projectAnalytics.analysis.average_completion_time}
          icon={Calendar}
          color="blue"
          isText
        />
        <MetricCard
          title="成功率"
          value={`${projectAnalytics.analysis.success_rate}%`}
          icon={TrendingUp}
          color="green"
          isText
        />
        <MetricCard
          title="総アクティビティ"
          value={projectAnalytics.analysis.total_activity_count}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Insights */}
      {projectAnalytics.insights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            インサイト・推奨事項
          </h3>
          <div className="space-y-4">
            {projectAnalytics.insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20' :
                  insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  'bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex-shrink-0">
                  {insight.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                  {insight.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {insight.description}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">
                    💡 {insight.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          人気カテゴリ
        </h3>
        <div className="space-y-3">
          {projectAnalytics.analysis.most_used_categories.map((category) => (
            <div key={category.category} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {getCategoryDisplayName(category.category)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {category.count}個
                </span>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {category.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fastest Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            🚀 最速完了プロジェクト
          </h3>
          <div className="space-y-3">
            {projectAnalytics.analysis.fastest_projects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {project.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getCategoryDisplayName(project.category)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                    {project.metrics.duration_days}日
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Complex Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            🎯 高複雑度プロジェクト
          </h3>
          <div className="space-y-3">
            {[...projectAnalytics.projects]
              .sort((a, b) => b.metrics.complexity_score - a.metrics.complexity_score)
              .slice(0, 3)
              .map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {project.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getCategoryDisplayName(project.category)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {project.metrics.complexity_score.toFixed(1)}/5.0
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  subtitle,
  isText = false 
}: { 
  title: string
  value: number | string
  icon: any
  color: string
  trend?: string
  subtitle?: string
  isText?: boolean
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold text-gray-900 dark:text-gray-100 ${isText ? 'text-lg' : ''}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {trend && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
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