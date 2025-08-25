/**
 * Progress Tracker Component
 * ADHD-optimized progress visualization for ReqAI development
 */

'use client'

import { useState, useEffect } from 'react'

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  phase: string
  week: number
  estimatedHours: number
  actualHours?: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  dependencies: string[]
  completedAt?: Date
  createdAt: Date
}

interface Phase {
  id: string
  name: string
  description: string
  week: number
  tasks: Task[]
  progress: number
  status: 'upcoming' | 'current' | 'completed'
}

interface WeeklyProgress {
  week: number
  planned: number
  completed: number
  efficiency: number
  focusSessions: number
  distractions: number
}

// =============================================================================
// MOCK DATA (will be replaced with real API calls)
// =============================================================================

const MOCK_PHASES: Phase[] = [
  {
    id: 'phase-1-week-1',
    name: 'フェーズ1: 第1週 - 土台構築',
    description: 'データベース設計、AI統合、認証システム',
    week: 1,
    progress: 100,
    status: 'completed',
    tasks: [
      {
        id: 'task-1',
        title: 'Prismaデータベーススキーマの実装',
        description: '15以上のテーブルを含む完全なデータベーススキーマ',
        status: 'completed',
        phase: 'phase-1-week-1',
        week: 1,
        estimatedHours: 8,
        actualHours: 6,
        priority: 'critical',
        dependencies: [],
        completedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 'task-2',
        title: 'Supabase統合のセットアップ',
        description: 'Supabaseクライアントと型定義の設定',
        status: 'completed',
        phase: 'phase-1-week-1',
        week: 1,
        estimatedHours: 4,
        actualHours: 3,
        priority: 'high',
        dependencies: ['task-1'],
        completedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 'task-3',
        title: 'AI開発環境の構築',
        description: 'マルチプロバイダーAI統合のセットアップ',
        status: 'completed',
        phase: 'phase-1-week-1',
        week: 1,
        estimatedHours: 6,
        actualHours: 5,
        priority: 'high',
        dependencies: [],
        completedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 'task-4',
        title: '認証システムの初期化',
        description: 'OAuthプロバイダーを使用したSupabase認証',
        status: 'completed',
        phase: 'phase-1-week-1',
        week: 1,
        estimatedHours: 6,
        actualHours: 4,
        priority: 'high',
        dependencies: ['task-2'],
        completedAt: new Date(),
        createdAt: new Date()
      },
      {
        id: 'task-5',
        title: '進捗追跡ダッシュボードの作成',
        description: 'ADHDに最適化された進捗視覚化',
        status: 'in_progress',
        phase: 'phase-1-week-1',
        week: 1,
        estimatedHours: 4,
        actualHours: 2,
        priority: 'medium',
        dependencies: ['task-4'],
        createdAt: new Date()
      }
    ]
  },
  {
    id: 'phase-1-week-2',
    name: 'フェーズ1: 第2週 - コア機能',
    description: 'API実装、要件フォーム、基本UI',
    week: 2,
    progress: 0,
    status: 'upcoming',
    tasks: [
      {
        id: 'task-6',
        title: '要件APIエンドポイントの実装',
        description: '要件管理のCRUD操作',
        status: 'pending',
        phase: 'phase-1-week-2',
        week: 2,
        estimatedHours: 8,
        priority: 'critical',
        dependencies: ['task-1', 'task-4'],
        createdAt: new Date()
      },
      {
        id: 'task-7',
        title: '要件入力フォームの作成',
        description: '要件作成のためのユーザーフレンドリーなフォーム',
        status: 'pending',
        phase: 'phase-1-week-2',
        week: 2,
        estimatedHours: 6,
        priority: 'high',
        dependencies: ['task-6'],
        createdAt: new Date()
      }
    ]
  }
]

const MOCK_WEEKLY_PROGRESS: WeeklyProgress[] = [
  {
    week: 1,
    planned: 28,
    completed: 20,
    efficiency: 71,
    focusSessions: 8,
    distractions: 3
  }
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProgressTracker() {
  const [phases, setPhases] = useState<Phase[]>(MOCK_PHASES)
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>(MOCK_WEEKLY_PROGRESS)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [showCompleted, setShowCompleted] = useState(true)

  // Calculate overall statistics
  const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0)
  const completedTasks = phases.reduce((sum, phase) => 
    sum + phase.tasks.filter(task => task.status === 'completed').length, 0)
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const currentWeekProgress = weeklyProgress.find(w => w.week === selectedWeek)

  return (
    <div className="space-y-6">
      {/* Header with Overall Stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">ReqAI 開発進捗</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{overallProgress}%</div>
            <div className="text-sm opacity-90">全体進捗</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{completedTasks}/{totalTasks}</div>
            <div className="text-sm opacity-90">タスク完了</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{currentWeekProgress?.focusSessions || 0}</div>
            <div className="text-sm opacity-90">集中セッション</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{currentWeekProgress?.efficiency || 0}%</div>
            <div className="text-sm opacity-90">効率</div>
          </div>
        </div>
      </div>

      {/* Week Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">週:</label>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {[1, 2, 3, 4].map(week => (
            <option key={week} value={week}>第{week}週</option>
          ))}
        </select>
        
        <label className="flex items-center space-x-2 text-sm text-gray-700 ml-6">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded"
          />
          <span>完了タスクを表示</span>
        </label>
      </div>

      {/* Weekly Progress Bar */}
      {currentWeekProgress && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">第{selectedWeek}週 進捗</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>完了時間</span>
                <span>{currentWeekProgress.completed}/{currentWeekProgress.planned} hours</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((currentWeekProgress.completed / currentWeekProgress.planned) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            {/* ADHD-Specific Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{currentWeekProgress.focusSessions}</div>
                <div className="text-sm text-green-700">集中セッション</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{currentWeekProgress.distractions}</div>
                <div className="text-sm text-yellow-700">雑念</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentWeekProgress.efficiency}%</div>
                <div className="text-sm text-blue-700">効率</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phases and Tasks */}
      <div className="space-y-6">
        {phases.filter(phase => phase.week === selectedWeek).map(phase => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            showCompleted={showCompleted}
          />
        ))}
      </div>

      {/* Motivation Section */}
      <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">🎯 とてもよく進んでいます！</h3>
        <p className="opacity-90 mb-4">
          {overallProgress >= 80 && "素晴らしい進捗です！もうすぐゴールです。"}
          {overallProgress >= 60 && overallProgress < 80 && "素晴らしい勢いです！集中した作業を継続しましょう。"}
          {overallProgress >= 40 && overallProgress < 60 && "着実に進捗しています。一定のペースを維持しましょう！"}
          {overallProgress < 40 && "完了したタスクはすべて前進です。きっとできます！"}
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <span>💡 ADHDティップ: 持続した集中のためにポモドーロテクニックを使用</span>
          <span>🎵 雑念を減らすためにバックグラウンドミュージックを流す</span>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// PHASE CARD COMPONENT
// =============================================================================

interface PhaseCardProps {
  phase: Phase
  showCompleted: boolean
}

function PhaseCard({ phase, showCompleted }: PhaseCardProps) {
  const filteredTasks = showCompleted 
    ? phase.tasks 
    : phase.tasks.filter(task => task.status !== 'completed')

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-900">{phase.name}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{phase.progress}% 完了</span>
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${phase.progress}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-gray-600">{phase.description}</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {filteredTasks.map(task => (
            <div key={task.id} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
              <div className={`w-1 h-8 rounded-full ${getPriorityColor(task.priority)}`} />
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(task.status)}`}>
                    {task.status === 'completed' ? '完了' : task.status === 'in_progress' ? '進行中' : task.status === 'blocked' ? 'ブロック' : '保留中'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>予定: {task.estimatedHours}h</span>
                  {task.actualHours && <span>実際: {task.actualHours}h</span>}
                  <span>優先度: {task.priority === 'critical' ? '緊急' : task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</span>
                  {task.dependencies.length > 0 && (
                    <span>依存: {task.dependencies.length}件</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}