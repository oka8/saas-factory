import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoProjects } from '@/lib/demo-data'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // デモモードチェック
    if (isDemoMode()) {
      // デモモードではサンプルのお気に入りプロジェクトを返す
      const demoProjects = getDemoProjects()
      const favoriteProjects = demoProjects.slice(0, 2) // 最初の2つをお気に入りとして扱う

      return NextResponse.json({
        success: true,
        projects: favoriteProjects.map(project => ({
          ...project,
          is_favorite: true,
          favorited_at: new Date().toISOString()
        })),
        pagination: {
          page,
          limit,
          total: favoriteProjects.length,
          pages: Math.ceil(favoriteProjects.length / limit)
        },
        message: 'デモモード: お気に入りプロジェクトを取得しました'
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

    // お気に入りプロジェクトを取得（プロジェクトの詳細情報も含む）
    const { data: favorites, error: favoritesError } = await supabase
      .from('project_favorites')
      .select(`
        created_at,
        projects (
          id,
          title,
          description,
          category,
          status,
          features,
          design_preferences,
          tech_requirements,
          created_at,
          completed_at,
          updated_at,
          user_id,
          repository_url,
          deployment_url,
          generated_code
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (favoritesError) {
      throw favoritesError
    }

    // お気に入りプロジェクトの総数を取得
    const { count, error: countError } = await supabase
      .from('project_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      throw countError
    }

    // レスポンス用にデータを整形
    const formattedProjects = favorites?.map(favorite => ({
      ...favorite.projects,
      is_favorite: true,
      favorited_at: favorite.created_at
    })) || []

    return NextResponse.json({
      success: true,
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Favorites fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorite projects' },
      { status: 500 }
    )
  }
}