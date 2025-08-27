import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { projectsDB, ServerDB } from '@/lib/database'
import type { CreateProjectData } from '@/lib/types'
import { getDemoProjects, DEMO_USER, addDemoProject } from '@/lib/demo-data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // デモモードチェック（通常はSupabaseを使用）
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
                      searchParams.get('demo') === 'true' || 
                      request.headers.get('referer')?.includes('demo=true') ||
                      request.headers.get('referer')?.includes('/demo')

    if (isDemoMode) {
      // デモモード：デモデータを返す
      const page = parseInt(searchParams.get('page') || '1')
      const perPage = parseInt(searchParams.get('per_page') || '10')
      const demoProjects = getDemoProjects()
      
      const startIndex = (page - 1) * perPage
      const endIndex = startIndex + perPage
      const paginatedProjects = demoProjects.slice(startIndex, endIndex)

      return NextResponse.json({
        success: true,
        data: paginatedProjects,
        pagination: {
          page,
          per_page: perPage,
          total: demoProjects.length,
          total_pages: Math.ceil(demoProjects.length / perPage)
        }
      })
    }

    // 通常モード：認証が必要
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('per_page') || '10')

    const { data: projects, error, count } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: projects || [],
      pagination: {
        page,
        per_page: perPage,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / perPage)
      }
    })
  } catch (error: any) {
    console.error('GET projects error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // デモモードチェック（通常はSupabaseを使用）
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
                      request.headers.get('referer')?.includes('demo=true') ||
                      request.headers.get('referer')?.includes('/demo') ||
                      body.demo === true

    if (isDemoMode) {
      // デモモード：ダミープロジェクトを作成してリストに追加
      const demoProject = {
        id: `demo-project-${Date.now()}`,
        user_id: DEMO_USER.id,
        title: body.title,
        description: body.description,
        category: body.category || 'other',
        features: body.features || '',
        design_preferences: body.design_preferences || '',
        tech_requirements: body.tech_requirements || '',
        status: 'draft',
        generated_code: null,
        deployment_url: null,
        repository_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        deployed_at: null
      }

      // 動的リストに追加
      addDemoProject(demoProject)

      return NextResponse.json({
        success: true,
        data: demoProject,
        message: 'デモプロジェクトが作成されました'
      })
    }

    // 通常モード：認証が必要
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // demo フィールドを除外してプロジェクトデータを作成
    const { demo, ...cleanBody } = body
    const projectData: CreateProjectData = {
      ...cleanBody,
      user_id: user.id
    }

    // プロジェクトをデータベースに作成
    const { data: project, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()

    if (error) throw error

    // 使用統計を更新
    await ServerDB.incrementUsage(user.id, 'projects_created')

    return NextResponse.json({
      success: true,
      data: project,
      message: 'プロジェクトが作成されました'
    })
  } catch (error: any) {
    console.error('POST projects error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}