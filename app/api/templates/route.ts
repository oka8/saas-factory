import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo-data'

// プリセットテンプレート定義
const PRESET_TEMPLATES = [
  {
    id: 'template-landing-page',
    name: 'ランディングページ',
    description: 'モダンなランディングページテンプレート。ヒーローセクション、機能紹介、価格設定、お問い合わせフォームを含む。',
    category: 'landing-page',
    tags: ['marketing', 'business', 'responsive'],
    thumbnail: '/templates/landing-page.jpg',
    features: `ヒーローセクション
機能紹介セクション
価格設定表
お問い合わせフォーム
レスポンシブデザイン
SEO最適化`,
    design_preferences: `モダンでクリーンなデザイン
ブランドカラーの活用
アニメーション効果
モバイルファースト`,
    tech_requirements: `Next.js 15
TypeScript
Tailwind CSS
Framer Motion
React Hook Form`,
    difficulty: 'beginner',
    estimated_time: '2-3 hours',
    is_featured: true,
    created_by: 'system',
    usage_count: 0
  },
  {
    id: 'template-saas-dashboard',
    name: 'SaaS ダッシュボード',
    description: 'SaaSアプリケーション向けの管理ダッシュボードテンプレート。認証、データ可視化、ユーザー管理機能付き。',
    category: 'dashboard',
    tags: ['saas', 'admin', 'analytics'],
    thumbnail: '/templates/saas-dashboard.jpg',
    features: `ユーザー認証システム
データ可視化（チャート）
ユーザー管理
設定画面
通知システム
ダークモード対応`,
    design_preferences: `プロフェッショナルなUI
データ重視のレイアウト
カスタマイズ可能なテーマ
アクセシビリティ対応`,
    tech_requirements: `Next.js 15
TypeScript
Tailwind CSS
Supabase
Chart.js
NextAuth.js`,
    difficulty: 'intermediate',
    estimated_time: '5-7 hours',
    is_featured: true,
    created_by: 'system',
    usage_count: 0
  },
  {
    id: 'template-ecommerce-store',
    name: 'ECストア',
    description: 'フル機能のEコマースサイトテンプレート。商品管理、カート機能、決済処理、注文管理を含む。',
    category: 'e-commerce',
    tags: ['shopping', 'payment', 'inventory'],
    thumbnail: '/templates/ecommerce-store.jpg',
    features: `商品カタログ
ショッピングカート
決済処理（Stripe連携）
注文管理
在庫管理
レビューシステム`,
    design_preferences: `商品重視のレイアウト
購入しやすいUI
信頼感のあるデザイン
モバイル対応`,
    tech_requirements: `Next.js 15
TypeScript
Tailwind CSS
Stripe
Supabase
Prisma`,
    difficulty: 'advanced',
    estimated_time: '10-15 hours',
    is_featured: true,
    created_by: 'system',
    usage_count: 0
  },
  {
    id: 'template-blog-cms',
    name: 'ブログCMS',
    description: 'コンテンツ管理システム付きのブログテンプレート。記事投稿、カテゴリ管理、コメント機能付き。',
    category: 'blog',
    tags: ['content', 'cms', 'seo'],
    thumbnail: '/templates/blog-cms.jpg',
    features: `記事投稿・編集
カテゴリ・タグ管理
コメントシステム
SEO最適化
検索機能
RSS フィード`,
    design_preferences: `読みやすいタイポグラフィ
コンテンツ重視のレイアウト
シンプルなナビゲーション
軽量な読み込み速度`,
    tech_requirements: `Next.js 15
TypeScript
Tailwind CSS
MDX
Supabase
Algolia`,
    difficulty: 'intermediate',
    estimated_time: '4-6 hours',
    is_featured: false,
    created_by: 'system',
    usage_count: 0
  },
  {
    id: 'template-portfolio',
    name: 'ポートフォリオサイト',
    description: 'クリエイター向けポートフォリオテンプレート。作品ギャラリー、プロフィール、お問い合わせ機能付き。',
    category: 'portfolio',
    tags: ['creative', 'gallery', 'personal'],
    thumbnail: '/templates/portfolio.jpg',
    features: `作品ギャラリー
プロフィールセクション
スキル・経歴表示
お問い合わせフォーム
ブログ機能
SNS連携`,
    design_preferences: `クリエイティブなデザイン
作品を引き立てるレイアウト
パーソナリティを反映
インタラクティブな要素`,
    tech_requirements: `Next.js 15
TypeScript
Tailwind CSS
Framer Motion
Sanity CMS
Vercel`,
    difficulty: 'beginner',
    estimated_time: '3-5 hours',
    is_featured: false,
    created_by: 'system',
    usage_count: 0
  }
]

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const featured = url.searchParams.get('featured')
    const difficulty = url.searchParams.get('difficulty')
    const search = url.searchParams.get('search')

    // デモモードまたは基本的な場合はプリセットテンプレートを返す
    let templates = [...PRESET_TEMPLATES]

    // フィルタリング
    if (category && category !== 'all') {
      templates = templates.filter(t => t.category === category)
    }

    if (featured === 'true') {
      templates = templates.filter(t => t.is_featured)
    }

    if (difficulty) {
      templates = templates.filter(t => t.difficulty === difficulty)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // 実際の環境では、データベースからユーザー作成テンプレートも取得
    if (!isDemoMode()) {
      const supabase = await createClient()
      
      const { data: userTemplates, error } = await supabase
        .from('project_templates')
        .select(`
          *,
          profiles!project_templates_created_by_fkey (
            email,
            full_name
          )
        `)
        .eq('is_public', true)
        .order('usage_count', { ascending: false })

      if (!error && userTemplates) {
        const formattedUserTemplates = userTemplates.map(template => ({
          ...template,
          created_by: template.profiles?.full_name || template.profiles?.email || 'User'
        }))
        
        // ユーザーテンプレートを追加（重複は除く）
        templates = [...templates, ...formattedUserTemplates]
      }
    }

    // 使用回数とフィーチャー順でソート
    templates.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      return b.usage_count - a.usage_count
    })

    return NextResponse.json({
      success: true,
      templates,
      total: templates.length
    })

  } catch (error) {
    console.error('Templates fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

interface CreateTemplateRequest {
  name: string
  description: string
  category: string
  tags: string[]
  project_id: string
  is_public: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateTemplateRequest
    const { name, description, category, tags, project_id, is_public } = body

    if (!name || !description || !category || !project_id) {
      return NextResponse.json(
        { error: 'Name, description, category, and project_id are required' },
        { status: 400 }
      )
    }

    // デモモードチェック
    if (isDemoMode()) {
      const newTemplate = {
        id: `template-user-${Date.now()}`,
        name,
        description,
        category,
        tags: tags || [],
        thumbnail: '/templates/custom-template.jpg',
        difficulty: 'intermediate',
        estimated_time: '3-5 hours',
        is_featured: false,
        is_public,
        created_by: 'Demo User',
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        template: newTemplate,
        message: 'デモモード: テンプレートを作成しました'
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

    // プロジェクトの所有者確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id, title, features, design_preferences, tech_requirements')
      .eq('id', project_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied. You can only create templates from your own projects.' },
        { status: 403 }
      )
    }

    // テンプレートを作成
    const templateData = {
      name,
      description,
      category,
      tags: tags || [],
      project_id,
      features: project.features,
      design_preferences: project.design_preferences,
      tech_requirements: project.tech_requirements,
      difficulty: 'intermediate', // デフォルト値
      estimated_time: '3-5 hours', // デフォルト値
      is_public,
      is_featured: false,
      created_by: user.id,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: template, error: templateError } = await supabase
      .from('project_templates')
      .insert(templateData)
      .select()
      .single()

    if (templateError) {
      throw templateError
    }

    return NextResponse.json({
      success: true,
      template,
      message: 'Template created successfully'
    })

  } catch (error) {
    console.error('Template creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}