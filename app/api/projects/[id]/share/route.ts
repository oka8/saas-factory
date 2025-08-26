import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoProject } from '@/lib/demo-data'

interface ShareRequest {
  is_public: boolean
  allowed_emails?: string[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // デモモードチェック
    if (isDemoMode()) {
      const project = getDemoProject(id)
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      // デモモードでは固定の共有設定を返す
      return NextResponse.json({
        success: true,
        shareSettings: {
          is_public: false,
          share_token: `demo_share_${id}_${Date.now()}`,
          allowed_emails: ['demo@example.com'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
    }

    const supabase = await createClient()

    // プロジェクトの存在確認
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // 共有設定を取得
    const { data: shareSettings, error } = await supabase
      .from('project_shares')
      .select('*')
      .eq('project_id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({
      success: true,
      shareSettings: shareSettings || null
    })

  } catch (error) {
    console.error('Share settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch share settings' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json() as ShareRequest
    const { is_public, allowed_emails = [] } = body

    // デモモードチェック
    if (isDemoMode()) {
      const project = getDemoProject(id)
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      // デモモードでは成功レスポンスをシミュレート
      const demoToken = `demo_share_${id}_${Date.now()}`
      return NextResponse.json({
        success: true,
        shareSettings: {
          project_id: id,
          share_token: demoToken,
          is_public,
          allowed_emails,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        shareUrl: `${request.nextUrl.origin}/shared/${demoToken}`
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
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // 共有トークンを生成
    const shareToken = `share_${id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 共有設定を作成または更新
    const { data: shareSettings, error } = await supabase
      .from('project_shares')
      .upsert({
        project_id: id,
        user_id: user.id,
        share_token: shareToken,
        is_public,
        allowed_emails,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'project_id,user_id'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      shareSettings,
      shareUrl: `${request.nextUrl.origin}/shared/${shareToken}`
    })

  } catch (error) {
    console.error('Share creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create share settings' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json() as ShareRequest
    const { is_public, allowed_emails = [] } = body

    // デモモードチェック
    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        message: 'デモモード: 共有設定を更新しました'
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

    // 既存の共有設定を更新
    const { data: shareSettings, error } = await supabase
      .from('project_shares')
      .update({
        is_public,
        allowed_emails,
        updated_at: new Date().toISOString()
      })
      .eq('project_id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      shareSettings
    })

  } catch (error) {
    console.error('Share update error:', error)
    return NextResponse.json(
      { error: 'Failed to update share settings' },
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
        message: 'デモモード: 共有設定を削除しました'
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

    // 共有設定を削除
    const { error } = await supabase
      .from('project_shares')
      .delete()
      .eq('project_id', id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Share settings deleted successfully'
    })

  } catch (error) {
    console.error('Share deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete share settings' },
      { status: 500 }
    )
  }
}