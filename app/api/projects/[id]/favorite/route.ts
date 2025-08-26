import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo-data'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // デモモードチェック
    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        message: 'デモモード: プロジェクトをお気に入りに追加しました',
        is_favorite: true
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
      .select('id, title')
      .eq('id', id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // すでにお気に入りに追加されているかチェック
    const { data: existingFavorite, error: checkError } = await supabase
      .from('project_favorites')
      .select('id')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .single()

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Project is already in favorites' },
        { status: 409 }
      )
    }

    // お気に入りに追加
    const { error: favoriteError } = await supabase
      .from('project_favorites')
      .insert({
        project_id: id,
        user_id: user.id,
        created_at: new Date().toISOString()
      })

    if (favoriteError) {
      throw favoriteError
    }

    // アクティビティログを記録
    await supabase
      .from('project_activity')
      .insert({
        project_id: id,
        user_id: user.id,
        action: 'project_favorited',
        description: `プロジェクト "${project.title}" がお気に入りに追加されました`
      })

    return NextResponse.json({
      success: true,
      message: 'Project added to favorites successfully',
      is_favorite: true
    })

  } catch (error) {
    console.error('Favorite add error:', error)
    return NextResponse.json(
      { error: 'Failed to add project to favorites' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // デモモードチェック
    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        message: 'デモモード: プロジェクトをお気に入りから削除しました',
        is_favorite: false
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
      .select('id, title')
      .eq('id', id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // お気に入りから削除
    const { error: deleteError } = await supabase
      .from('project_favorites')
      .delete()
      .eq('project_id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      throw deleteError
    }

    // アクティビティログを記録
    await supabase
      .from('project_activity')
      .insert({
        project_id: id,
        user_id: user.id,
        action: 'project_unfavorited',
        description: `プロジェクト "${project.title}" がお気に入りから削除されました`
      })

    return NextResponse.json({
      success: true,
      message: 'Project removed from favorites successfully',
      is_favorite: false
    })

  } catch (error) {
    console.error('Favorite remove error:', error)
    return NextResponse.json(
      { error: 'Failed to remove project from favorites' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // デモモードチェック
    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        is_favorite: false // デモモードでは常にfalse
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

    // お気に入り状態をチェック
    const { data: favorite, error: favoriteError } = await supabase
      .from('project_favorites')
      .select('id')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      success: true,
      is_favorite: !!favorite
    })

  } catch (error) {
    console.error('Favorite check error:', error)
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    )
  }
}