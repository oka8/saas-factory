import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoProject, getDemoGenerationLogs, DEMO_USER } from '@/lib/demo-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const projectId = resolvedParams.id
    
    // デモモードチェック（通常はSupabaseを使用）
    const isDemoModeActive = isDemoMode()

    if (isDemoModeActive) {
      // デモモード：デモデータを返す
      const demoProject = getDemoProject(projectId)
      
      if (!demoProject) {
        return NextResponse.json(
          { success: false, error: 'プロジェクトが見つかりません' },
          { status: 404 }
        )
      }

      const demoLogs = getDemoGenerationLogs(projectId)

      return NextResponse.json({
        success: true,
        data: {
          project: demoProject,
          generation_logs: demoLogs
        },
        message: 'デモモード: プロジェクトを取得しました'
      })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // プロジェクトを取得
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'プロジェクトが見つかりません' },
          { status: 404 }
        )
      }
      throw projectError
    }

    // 生成ログを取得
    const { data: generationLogs, error: logsError } = await supabase
      .from('generation_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('started_at', { ascending: true })

    if (logsError) throw logsError

    return NextResponse.json({
      success: true,
      data: {
        project,
        generation_logs: generationLogs || []
      }
    })
  } catch (error: any) {
    console.error('GET project error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    const body = await request.json()
    
    // デモモードチェック（通常はSupabaseを使用）
    const isDemoModeActive = isDemoMode()

    if (isDemoModeActive) {
      // デモモード：ダミー更新結果を返す
      const demoProject = getDemoProject(projectId)
      
      if (!demoProject) {
        return NextResponse.json(
          { success: false, error: 'プロジェクトが見つかりません' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: { ...demoProject, ...body, updated_at: new Date().toISOString() },
        message: 'デモモード: プロジェクトが更新されました'
      })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // プロジェクトを更新
    const { data: project, error } = await supabase
      .from('projects')
      .update(body)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'プロジェクトが見つかりません' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: project,
      message: 'プロジェクトが更新されました'
    })
  } catch (error: any) {
    console.error('PUT project error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    
    // デモモードチェック（通常はSupabaseを使用）
    const isDemoModeActive = isDemoMode()

    if (isDemoModeActive) {
      // デモモード：成功レスポンスを返す
      const demoProject = getDemoProject(projectId)
      
      if (!demoProject) {
        return NextResponse.json(
          { success: false, error: 'プロジェクトが見つかりません' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'デモモード: プロジェクトが削除されました'
      })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // プロジェクトを削除
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'プロジェクトが削除されました'
    })
  } catch (error: any) {
    console.error('DELETE project error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}