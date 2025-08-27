import type { Project, GenerationLog, UserPreferences } from './types'

// デモユーザー情報
export const DEMO_USER = {
  id: 'demo-user-id',
  email: 'demo@saas-factory.com',
  name: 'デモユーザー',
  created_at: '2024-01-01T00:00:00.000Z'
}

// デモプロジェクトデータ
export const DEMO_PROJECTS: Project[] = [
  {
    id: 'demo-project-1',
    user_id: 'demo-user-id',
    title: '美容院予約管理システム',
    description: '小規模な美容院向けの顧客管理・予約システムを作りたい。お客さんの来店履歴や施術内容を記録し、次回予約の管理ができる機能が欲しい。シンプルで使いやすいUIを重視したい。',
    category: 'crm',
    features: '・顧客情報の登録・編集・検索\n・来店履歴の記録と表示\n・予約管理（日時、スタッフ、メニュー）\n・売上レポートの表示\n・顧客へのメール通知機能',
    design_preferences: '・シンプルで清潔感のあるデザイン\n・ブルーとホワイトを基調とした配色\n・大きなボタンと読みやすいフォント\n・モバイルでも使いやすいレスポンシブデザイン',
    tech_requirements: '・多言語対応は不要\n・CSVエクスポート機能\n・データのバックアップ機能',
    status: 'completed',
    generated_code: {
      components: ['CustomerList', 'CustomerForm', 'AppointmentCalendar', 'ServiceHistory', 'Dashboard'],
      pages: ['顧客管理', '予約管理', 'ダッシュボード', '設定'],
      api_routes: ['/api/customers', '/api/appointments', '/api/services', '/api/reports'],
      database_schema: `
        CREATE TABLE customers (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          email VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE appointments (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          customer_id UUID REFERENCES customers(id),
          service_name VARCHAR(255) NOT NULL,
          appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
          duration_minutes INTEGER DEFAULT 60,
          price DECIMAL(10,2),
          status VARCHAR(20) DEFAULT 'scheduled',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      package_json: {
        name: 'salon-management-system',
        version: '1.0.0',
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          '@supabase/supabase-js': '^2.0.0',
          'tailwindcss': '^3.0.0'
        }
      },
      deployment_config: {
        platform: 'vercel',
        build_command: 'npm run build',
        output_directory: '.next'
      },
      file_structure: [
        {
          path: 'components/CustomerList.tsx',
          content: 'import React from "react"; // 顧客一覧コンポーネント',
          type: 'file'
        },
        {
          path: 'pages/dashboard.tsx',
          content: 'import React from "react"; // ダッシュボードページ',
          type: 'file'
        }
      ]
    },
    deployment_url: undefined,
    repository_url: undefined,
    created_at: '2024-11-15T10:00:00.000Z',
    updated_at: '2024-11-15T10:30:00.000Z',
    completed_at: '2024-11-15T10:30:00.000Z',
    deployed_at: undefined
  },
  {
    id: 'demo-project-2',
    user_id: 'demo-user-id',
    title: 'タスク管理アプリ',
    description: 'チーム向けのタスク管理ツールを作成したい。プロジェクトごとにタスクを管理し、進捗を可視化できる機能が必要。',
    category: 'todo',
    features: '・プロジェクト作成と管理\n・タスクの作成、編集、削除\n・優先度設定\n・期限管理\n・進捗の可視化',
    design_preferences: '・モダンで直感的なデザイン\n・カンバンボード形式\n・ダークモード対応',
    tech_requirements: '・リアルタイム同期\n・通知機能',
    status: 'generating',
    generated_code: undefined,
    deployment_url: undefined,
    repository_url: undefined,
    created_at: '2024-11-20T09:00:00.000Z',
    updated_at: '2024-11-20T09:15:00.000Z',
    completed_at: undefined,
    deployed_at: undefined
  },
  {
    id: 'demo-project-3',
    user_id: 'demo-user-id',
    title: 'ブログCMS',
    description: 'シンプルなブログ管理システム。記事の作成、編集、公開機能を持つCMSを作りたい。',
    category: 'cms',
    features: '・記事の作成と編集\n・カテゴリ管理\n・タグ機能\n・コメント機能',
    design_preferences: '・ミニマルなデザイン\n・読みやすいタイポグラフィ',
    tech_requirements: '・SEO対応\n・RSS配信',
    status: 'draft',
    generated_code: undefined,
    deployment_url: undefined,
    repository_url: undefined,
    created_at: '2024-11-22T14:30:00.000Z',
    updated_at: '2024-11-22T14:30:00.000Z',
    completed_at: undefined,
    deployed_at: undefined
  }
]

// デモ生成ログ
export const DEMO_GENERATION_LOGS: GenerationLog[] = [
  {
    id: 'log-1',
    project_id: 'demo-project-1',
    step: 'analysis',
    status: 'completed',
    message: 'プロジェクト要件を分析しました',
    details: { complexity_score: 7 },
    started_at: '2024-11-15T10:00:00.000Z',
    completed_at: '2024-11-15T10:05:00.000Z',
    error_message: undefined
  },
  {
    id: 'log-2',
    project_id: 'demo-project-1',
    step: 'planning',
    status: 'completed',
    message: 'コード生成計画を作成しました',
    details: undefined,
    started_at: '2024-11-15T10:05:00.000Z',
    completed_at: '2024-11-15T10:10:00.000Z',
    error_message: undefined
  },
  {
    id: 'log-3',
    project_id: 'demo-project-1',
    step: 'database_design',
    status: 'completed',
    message: 'データベース設計が完了しました',
    details: undefined,
    started_at: '2024-11-15T10:10:00.000Z',
    completed_at: '2024-11-15T10:15:00.000Z',
    error_message: undefined
  },
  {
    id: 'log-4',
    project_id: 'demo-project-1',
    step: 'component_generation',
    status: 'completed',
    message: 'Reactコンポーネントを生成しました',
    details: undefined,
    started_at: '2024-11-15T10:15:00.000Z',
    completed_at: '2024-11-15T10:25:00.000Z',
    error_message: undefined
  },
  {
    id: 'log-5',
    project_id: 'demo-project-1',
    step: 'completed',
    status: 'completed',
    message: 'プロジェクト生成が完了しました',
    details: { total_files: 12, estimated_time: 30 },
    started_at: '2024-11-15T10:25:00.000Z',
    completed_at: '2024-11-15T10:30:00.000Z',
    error_message: undefined
  },
  // 生成中プロジェクト用のログ
  {
    id: 'log-6',
    project_id: 'demo-project-2',
    step: 'analysis',
    status: 'completed',
    message: 'プロジェクト要件を分析しました',
    details: undefined,
    started_at: '2024-11-20T09:00:00.000Z',
    completed_at: '2024-11-20T09:05:00.000Z',
    error_message: undefined
  },
  {
    id: 'log-7',
    project_id: 'demo-project-2',
    step: 'planning',
    status: 'completed',
    message: 'コード生成計画を作成しました',
    details: undefined,
    started_at: '2024-11-20T09:05:00.000Z',
    completed_at: '2024-11-20T09:10:00.000Z',
    error_message: undefined
  },
  {
    id: 'log-8',
    project_id: 'demo-project-2',
    step: 'component_generation',
    status: 'processing',
    message: 'Reactコンポーネントを生成中...',
    details: undefined,
    started_at: '2024-11-20T09:10:00.000Z',
    completed_at: undefined,
    error_message: undefined
  }
]

// デモユーザー設定
export const DEMO_USER_PREFERENCES: UserPreferences = {
  id: 'pref-1',
  user_id: 'demo-user-id',
  preferred_tech_stack: {
    frontend: 'react',
    backend: 'nextjs',
    database: 'supabase',
    styling: 'tailwindcss'
  },
  default_deployment_platform: 'vercel',
  adhd_settings: {
    focus_session_length: 25,
    break_length: 5,
    visual_progress: true,
    auto_save: true
  },
  notification_preferences: {
    email: true,
    in_app: true,
    generation_complete: true,
    deployment_ready: true
  },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
}

// デモモードかどうかを判定する関数
export const isDemoMode = (): boolean => {
  // 強制的にデモモードを有効にする（Supabase APIキーエラー回避）
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return true
  }
  
  if (typeof window !== 'undefined') {
    // URL based demo mode detection
    const urlDemo = window.location.pathname.startsWith('/demo') || 
                   window.location.search.includes('demo=true')
    
    if (urlDemo) return true
  }
  
  // Environment based demo mode detection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Invalid or demo configuration detection
  // Supabase APIキーエラーの場合もデモモードに切り替え
  const isInvalidKey = !supabaseUrl || !supabaseKey || 
                      supabaseUrl === 'https://demo.supabase.co' || 
                      supabaseKey === 'demo-anon-key' ||
                      supabaseUrl?.includes('demo') === true
  
  return isInvalidKey
}

// 動的デモプロジェクト管理
let dynamicDemoProjects: Project[] = [...DEMO_PROJECTS]

// デモプロジェクトを追加
export const addDemoProject = (project: Project): void => {
  dynamicDemoProjects.unshift(project) // 最新のプロジェクトを先頭に追加
}

// デモデータ取得用関数
export const getDemoProjects = (limit?: number): Project[] => {
  return limit ? dynamicDemoProjects.slice(0, limit) : dynamicDemoProjects
}

export const getDemoProject = (id: string): Project | undefined => {
  return dynamicDemoProjects.find(project => project.id === id)
}

export const getDemoGenerationLogs = (projectId: string): GenerationLog[] => {
  return DEMO_GENERATION_LOGS.filter(log => log.project_id === projectId)
}

export const getDemoStats = () => {
  const totalProjects = dynamicDemoProjects.length
  const completedProjects = dynamicDemoProjects.filter(p => p.status === 'completed' || p.status === 'deployed').length
  const deployedProjects = dynamicDemoProjects.filter(p => p.status === 'deployed').length

  return {
    totalProjects,
    completedProjects,
    deployedProjects
  }
}

export function getDemoTemplates() {
  return [
    {
      id: 'template-1',
      name: 'CRM・顧客管理システム',
      description: '顧客情報の管理と営業活動の追跡',
      category: 'crm',
      features: ['顧客管理', '営業活動記録', 'レポート機能'],
      preview_url: '#'
    },
    {
      id: 'template-2', 
      name: 'ブログ・CMS',
      description: '記事投稿とコンテンツ管理システム',
      category: 'cms',
      features: ['記事投稿', '画像管理', 'SEO最適化'],
      preview_url: '#'
    },
    {
      id: 'template-3',
      name: 'タスク管理アプリ',
      description: 'プロジェクトとタスクの管理',
      category: 'todo',
      features: ['タスク作成', 'プロジェクト管理', '進捗追跡'],
      preview_url: '#'
    }
  ]
}

