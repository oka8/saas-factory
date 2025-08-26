'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, AlertTriangle, CheckCircle2, Clock, Eye, Server, TrendingUp, Users, Zap } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface MonitoringData {
  performance?: {
    response_time: number
    availability: number
    throughput: number
    error_rate: number
    cpu_usage: number
    memory_usage: number
    disk_usage: number
  }
  usage?: {
    page_views: number
    unique_visitors: number
    api_calls: number
    data_transfer: string
    storage_used: string
    bandwidth_used: string
    activity_count: number
  }
  errors?: {
    total_errors: number
    error_rate: number
    critical_errors: number
    warnings: number
    recent_errors: Array<{
      type: string
      count: number
    }>
  }
  activity?: {
    total_activities_24h: number
    hourly_distribution: number[]
    recent_activities: Array<{
      action: string
      description: string
      created_at: string
    }>
    activity_types: Array<{
      type: string
      count: number
      percentage: number
    }>
  }
  realtime?: {
    current_users: number
    requests_per_minute: number
    average_response_time: number
    status: 'healthy' | 'degraded' | 'critical'
    last_deployment: string
    uptime: string
  }
}

interface MonitoringDashboardProps {
  projectId: string
  projectTitle: string
  refreshInterval?: number
}

export function MonitoringDashboard({ 
  projectId, 
  projectTitle, 
  refreshInterval = 30000 
}: MonitoringDashboardProps) {
  const [data, setData] = useState<MonitoringData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLive, setIsLive] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/monitoring/projects/${projectId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setData(result.data)
          setLastUpdated(new Date())
        }
      }
    } catch (error) {
      console.error('Error fetching monitoring data:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchData()
    
    let interval: NodeJS.Timeout | null = null
    if (isLive) {
      interval = setInterval(fetchData, refreshInterval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [fetchData, refreshInterval, isLive])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">
          監視データを取得できませんでした
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {projectTitle} - リアルタイム監視
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            最終更新: {lastUpdated?.toLocaleTimeString('ja-JP') || '--'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              isLive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isLive ? 'ライブ' : 'ポーズ'}
          </button>
          <button
            onClick={fetchData}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            更新
          </button>
        </div>
      </div>

      {/* Status Overview */}
      {data.realtime && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              システム状態
            </h3>
            <StatusBadge status={data.realtime.status} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.realtime.current_users}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">現在のユーザー</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.realtime.requests_per_minute}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">リクエスト/分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {Math.round(data.realtime.average_response_time)}ms
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">平均応答時間</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.realtime.uptime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">稼働率</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {data.performance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="応答時間"
            value={`${Math.round(data.performance.response_time)}ms`}
            icon={Zap}
            status={data.performance.response_time < 500 ? 'good' : data.performance.response_time < 1000 ? 'warning' : 'critical'}
          />
          <MetricCard
            title="可用性"
            value={`${data.performance.availability.toFixed(2)}%`}
            icon={CheckCircle2}
            status={data.performance.availability > 99.5 ? 'good' : 'warning'}
          />
          <MetricCard
            title="スループット"
            value={`${data.performance.throughput}/h`}
            icon={TrendingUp}
            status="good"
          />
          <SystemResourceCard
            title="CPU使用率"
            value={data.performance.cpu_usage}
            icon={Server}
          />
          <SystemResourceCard
            title="メモリ使用率"
            value={data.performance.memory_usage}
            icon={Server}
          />
          <SystemResourceCard
            title="ディスク使用率"
            value={data.performance.disk_usage}
            icon={Server}
          />
        </div>
      )}

      {/* Usage and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Metrics */}
        {data.usage && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              使用状況
            </h3>
            <div className="space-y-4">
              <UsageItem label="ページビュー" value={data.usage.page_views.toLocaleString()} />
              <UsageItem label="ユニークビジター" value={data.usage.unique_visitors.toLocaleString()} />
              <UsageItem label="API コール" value={data.usage.api_calls.toLocaleString()} />
              <UsageItem label="データ転送" value={data.usage.data_transfer} />
              <UsageItem label="ストレージ使用" value={data.usage.storage_used} />
              <UsageItem label="帯域幅使用" value={data.usage.bandwidth_used} />
            </div>
          </div>
        )}

        {/* Activity Chart */}
        {data.activity && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              24時間のアクティビティ
            </h3>
            <div className="h-32 flex items-end justify-between gap-1">
              {data.activity.hourly_distribution.map((count, hour) => (
                <div key={hour} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-blue-500 rounded-t w-full min-h-[2px] transition-all hover:bg-blue-600"
                    style={{ 
                      height: `${Math.max((count / Math.max(...data.activity!.hourly_distribution)) * 100, 2)}px` 
                    }}
                    title={`${hour}:00 - ${count}件`}
                  />
                  {hour % 6 === 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {hour}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              総アクティビティ: {data.activity.total_activities_24h}件
            </div>
          </div>
        )}
      </div>

      {/* Errors and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Error Summary */}
        {data.errors && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              エラー状況
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {data.errors.total_errors}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">総エラー数</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {data.errors.critical_errors}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">重要エラー</div>
              </div>
            </div>
            {data.errors.recent_errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  最近のエラー
                </h4>
                <div className="space-y-2">
                  {data.errors.recent_errors.map((error, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">{error.type}</span>
                      <span className="text-red-600 dark:text-red-400 font-medium">{error.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Activities */}
        {data.activity && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              最近のアクティビティ
            </h3>
            {data.activity.recent_activities.length > 0 ? (
              <div className="space-y-3">
                {data.activity.recent_activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {activity.description}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.created_at).toLocaleString('ja-JP')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                最近のアクティビティがありません
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    healthy: { label: '正常', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
    degraded: { label: '低下', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
    critical: { label: '重大', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.healthy

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  status 
}: { 
  title: string
  value: string
  icon: any
  status: 'good' | 'warning' | 'critical'
}) {
  const statusColors = {
    good: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    critical: 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-xl font-bold ${statusColors[status]}`}>{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${statusColors[status]}`} />
      </div>
    </div>
  )
}

function SystemResourceCard({ 
  title, 
  value, 
  icon: Icon 
}: { 
  title: string
  value: number
  icon: any
}) {
  const getStatusColor = (percentage: number) => {
    if (percentage < 60) return 'text-green-600 dark:text-green-400'
    if (percentage < 80) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getBarColor = (percentage: number) => {
    if (percentage < 60) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-xl font-bold ${getStatusColor(value)}`}>
            {Math.round(value)}%
          </p>
        </div>
        <Icon className={`w-8 h-8 ${getStatusColor(value)}`} />
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getBarColor(value)}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  )
}

function UsageItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  )
}