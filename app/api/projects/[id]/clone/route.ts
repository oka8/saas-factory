import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoProject } from '@/lib/demo-data'

interface CloneRequest {
  title?: string
  description?: string
  category?: string
  clone_settings?: {
    include_generated_code: boolean
    include_deployment_settings: boolean
    include_collaborators: boolean
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json() as CloneRequest
    const { 
      title, 
      description, 
      category,
      clone_settings = {
        include_generated_code: true,
        include_deployment_settings: false,
        include_collaborators: false
      }
    } = body

    // デモモードチェック
    if (isDemoMode()) {
      const originalProject = getDemoProject(id)
      if (!originalProject) {
        return NextResponse.json(
          { error: 'Original project not found' },
          { status: 404 }
        )
      }

      // デモプロジェクトのクローンをシミュレート
      const clonedProject = {
        ...originalProject,
        id: `demo-clone-${Date.now()}`,
        title: title || `${originalProject.title} のコピー`,
        description: description || originalProject.description,
        category: category || originalProject.category,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        deployed_at: null,
        repository_url: clone_settings.include_deployment_settings ? originalProject.repository_url : null,
        deployment_url: clone_settings.include_deployment_settings ? originalProject.deployment_url : null,
        generated_code: clone_settings.include_generated_code ? originalProject.generated_code : null
      }

      return NextResponse.json({
        success: true,
        cloned_project: clonedProject,
        message: 'デモモード: プロジェクトをクローンしました'
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

    // 元のプロジェクトを取得
    const { data: originalProject, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (projectError || !originalProject) {
      return NextResponse.json(
        { error: 'Original project not found' },
        { status: 404 }
      )
    }

    // アクセス権限をチェック（所有者またはコラボレーター）
    const isOwner = originalProject.user_id === user.id
    let hasAccess = isOwner

    if (!isOwner) {
      const { data: collaboration } = await supabase
        .from('project_collaborators')
        .select('role')
        .eq('project_id', id)
        .eq('user_id', user.id)
        .single()

      hasAccess = !!collaboration
    }

    if (!hasAccess) {
      // 公開共有されているかチェック
      const { data: shareData } = await supabase
        .from('project_shares')
        .select('is_public')
        .eq('project_id', id)
        .single()

      if (!shareData?.is_public) {
        return NextResponse.json(
          { error: 'Permission denied. You can only clone your own projects or projects you have access to.' },
          { status: 403 }
        )
      }
    }

    // 新しいプロジェクトを作成
    const clonedProjectData = {
      user_id: user.id,
      title: title || `${originalProject.title} のコピー`,
      description: description || originalProject.description,
      category: category || originalProject.category,
      features: originalProject.features,
      design_preferences: originalProject.design_preferences,
      tech_requirements: originalProject.tech_requirements,
      status: 'draft' as const,
      generated_code: clone_settings.include_generated_code ? originalProject.generated_code : null,
      repository_url: clone_settings.include_deployment_settings ? originalProject.repository_url : null,
      deployment_url: clone_settings.include_deployment_settings ? originalProject.deployment_url : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: clonedProject, error: cloneError } = await supabase
      .from('projects')
      .insert(clonedProjectData)
      .select()
      .single()

    if (cloneError) {
      throw cloneError
    }

    // コラボレーターをコピー（オプション）
    if (clone_settings.include_collaborators && isOwner) {
      const { data: collaborators } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', id)

      if (collaborators && collaborators.length > 0) {
        const collaboratorsToInsert = collaborators.map(collab => ({
          project_id: clonedProject.id,
          user_id: collab.user_id,
          role: collab.role,
          status: collab.status,
          invited_by: user.id,
          joined_at: new Date().toISOString()
        }))

        await supabase
          .from('project_collaborators')
          .insert(collaboratorsToInsert)
      }
    }

    // アクティビティログを記録
    await supabase
      .from('project_activity')
      .insert({
        project_id: clonedProject.id,
        user_id: user.id,
        action: 'project_cloned',
        description: `プロジェクト "${originalProject.title}" からクローンされました`,
        metadata: {
          original_project_id: originalProject.id,
          clone_settings
        }
      })

    return NextResponse.json({
      success: true,
      cloned_project: clonedProject,
      message: 'Project cloned successfully'
    })

  } catch (error) {
    console.error('Project clone error:', error)
    return NextResponse.json(
      { error: 'Failed to clone project' },
      { status: 500 }
    )
  }
}