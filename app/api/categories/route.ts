import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo-data'

// デフォルトカテゴリ定義
const DEFAULT_CATEGORIES = [
  { id: 'crm', name: 'CRM・顧客管理', description: '顧客情報、営業管理', color: '#3B82F6' },
  { id: 'cms', name: 'CMS・コンテンツ管理', description: 'ブログ、記事管理', color: '#10B981' },
  { id: 'todo', name: 'タスク管理', description: 'TODO、プロジェクト管理', color: '#F59E0B' },
  { id: 'inventory', name: '在庫管理', description: '商品、在庫追跡', color: '#8B5CF6' },
  { id: 'form', name: 'フォーム・アンケート', description: 'データ収集、調査', color: '#EF4444' },
  { id: 'e-commerce', name: 'Eコマース', description: 'オンラインストア、決済', color: '#06B6D4' },
  { id: 'dashboard', name: 'ダッシュボード', description: 'データ可視化、分析', color: '#84CC16' },
  { id: 'landing-page', name: 'ランディングページ', description: 'マーケティング、LP', color: '#F97316' },
  { id: 'blog', name: 'ブログ', description: '記事投稿、コンテンツ', color: '#6366F1' },
  { id: 'portfolio', name: 'ポートフォリオ', description: '作品展示、個人サイト', color: '#EC4899' },
  { id: 'other', name: 'その他', description: 'カスタムアプリケーション', color: '#6B7280' }
]

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const includeStats = url.searchParams.get('includeStats') === 'true'

    // デモモードの場合はデフォルトカテゴリを返す
    if (isDemoMode()) {
      const categoriesWithStats = DEFAULT_CATEGORIES.map(category => ({
        ...category,
        project_count: Math.floor(Math.random() * 10) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_system: true
      }))

      return NextResponse.json({
        success: true,
        categories: categoriesWithStats,
        message: 'デモモード: カテゴリを取得しました'
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

    // システムカテゴリとユーザーカテゴリを取得
    const { data: categories, error: categoriesError } = await supabase
      .from('project_categories')
      .select('*')
      .or(`is_system.eq.true,created_by.eq.${user.id}`)
      .order('is_system', { ascending: false })
      .order('name', { ascending: true })

    if (categoriesError) {
      throw categoriesError
    }

    let result = categories || []

    // 統計情報を含める場合
    if (includeStats) {
      const categoriesWithStats = await Promise.all(
        result.map(async (category) => {
          const { count } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('category', category.id)
            .eq('user_id', user.id)

          return {
            ...category,
            project_count: count || 0
          }
        })
      )
      result = categoriesWithStats
    }

    return NextResponse.json({
      success: true,
      categories: result
    })

  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

interface CreateCategoryRequest {
  name: string
  description?: string
  color?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateCategoryRequest
    const { name, description, color } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // デモモードチェック
    if (isDemoMode()) {
      const newCategory = {
        id: `custom-${Date.now()}`,
        name,
        description: description || '',
        color: color || '#6B7280',
        is_system: false,
        project_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'demo-user'
      }

      return NextResponse.json({
        success: true,
        category: newCategory,
        message: 'デモモード: カテゴリを作成しました'
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

    // 同じ名前のカテゴリが既に存在するかチェック
    const { data: existing, error: checkError } = await supabase
      .from('project_categories')
      .select('id')
      .eq('name', name)
      .or(`is_system.eq.true,created_by.eq.${user.id}`)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    // 新しいカテゴリを作成
    const categoryData = {
      id: `custom-${Date.now()}`,
      name,
      description: description || '',
      color: color || '#6B7280',
      is_system: false,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: category, error: categoryError } = await supabase
      .from('project_categories')
      .insert(categoryData)
      .select()
      .single()

    if (categoryError) {
      throw categoryError
    }

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        project_count: 0
      },
      message: 'Category created successfully'
    })

  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}