import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoProject } from '@/lib/demo-data'

interface CollaboratorRequest {
  user_email: string
  role: 'editor' | 'viewer'
}

interface RoleUpdateRequest {
  collaborator_id: string
  role: 'editor' | 'viewer'
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

      // デモモードでは固定のコラボレーターリストを返す
      const demoCollaborators = [
        {
          id: 'demo-collab-1',
          project_id: id,
          user_id: 'demo-user-1',
          role: 'owner',
          status: 'active',
          joined_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          user_email: 'owner@demo.com',
          user_name: 'プロジェクトオーナー'
        },
        {
          id: 'demo-collab-2',
          project_id: id,
          user_id: 'demo-user-2',
          role: 'editor',
          status: 'active',
          joined_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          user_email: 'editor@demo.com',
          user_name: '編集者ユーザー'
        }
      ]

      return NextResponse.json({
        success: true,
        collaborators: demoCollaborators
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

    // プロジェクトの存在確認とアクセス権限チェック
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

    // オーナーまたはコラボレーターかチェック
    const isOwner = project.user_id === user.id
    const { data: collaboration } = await supabase
      .from('project_collaborators')
      .select('role')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .single()

    if (!isOwner && !collaboration) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      )
    }

    // コラボレーターリストを取得（オーナーを含む）
    const collaborators = []

    // オーナーを追加
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', project.user_id)
      .single()

    collaborators.push({
      id: `owner-${project.user_id}`,
      project_id: id,
      user_id: project.user_id,
      role: 'owner',
      status: 'active',
      joined_at: new Date().toISOString(), // プロジェクト作成日を使用すべきだが、簡略化
      user_email: ownerProfile?.email || 'unknown',
      user_name: ownerProfile?.full_name || null
    })

    // コラボレーターを取得
    const { data: collaboratorData, error: collabError } = await supabase
      .from('project_collaborators')
      .select(`
        *,
        profiles (
          email,
          full_name
        )
      `)
      .eq('project_id', id)
      .order('joined_at', { ascending: false })

    if (collabError) {
      throw collabError
    }

    // コラボレーターをフォーマット
    const formattedCollaborators = collaboratorData.map(collab => ({
      ...collab,
      user_email: collab.profiles?.email || 'unknown',
      user_name: collab.profiles?.full_name || null
    }))

    collaborators.push(...formattedCollaborators)

    return NextResponse.json({
      success: true,
      collaborators
    })

  } catch (error) {
    console.error('Collaborators fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collaborators' },
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
    const body = await request.json() as CollaboratorRequest
    const { user_email, role } = body

    if (!user_email || !role) {
      return NextResponse.json(
        { error: 'User email and role are required' },
        { status: 400 }
      )
    }

    // デモモードチェック
    if (isDemoMode()) {
      const project = getDemoProject(id)
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'デモモード: コラボレーターを招待しました',
        collaborator: {
          id: `demo-collab-${Date.now()}`,
          project_id: id,
          user_id: `demo-user-${Date.now()}`,
          role,
          status: 'active',
          joined_at: new Date().toISOString(),
          user_email,
          user_name: null
        }
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
        { error: 'Only project owner can invite collaborators' },
        { status: 403 }
      )
    }

    // 招待するユーザーが存在するかチェック
    const { data: targetUser, error: targetUserError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', user_email)
      .single()

    if (targetUserError && targetUserError.code !== 'PGRST116') {
      throw targetUserError
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User with this email not found' },
        { status: 404 }
      )
    }

    // 既にコラボレーターでないかチェック
    const { data: existingCollab } = await supabase
      .from('project_collaborators')
      .select('id')
      .eq('project_id', id)
      .eq('user_id', targetUser.id)
      .single()

    if (existingCollab) {
      return NextResponse.json(
        { error: 'User is already a collaborator' },
        { status: 400 }
      )
    }

    // オーナー自身を招待しようとしていないかチェック
    if (targetUser.id === project.user_id) {
      return NextResponse.json(
        { error: 'Cannot invite project owner as collaborator' },
        { status: 400 }
      )
    }

    // コラボレーターを追加
    const { data: newCollaborator, error: inviteError } = await supabase
      .from('project_collaborators')
      .insert({
        project_id: id,
        user_id: targetUser.id,
        role,
        status: 'active',
        invited_by: user.id,
        joined_at: new Date().toISOString()
      })
      .select()
      .single()

    if (inviteError) {
      throw inviteError
    }

    // アクティビティを記録
    await supabase
      .from('collaboration_activity')
      .insert({
        project_id: id,
        user_id: user.id,
        action: 'user_invited',
        description: `${user_email} を ${role === 'editor' ? '編集者' : '閲覧者'} として招待しました`
      })

    return NextResponse.json({
      success: true,
      message: 'Collaborator invited successfully',
      collaborator: {
        ...newCollaborator,
        user_email: targetUser.email,
        user_name: null
      }
    })

  } catch (error) {
    console.error('Collaborator invitation error:', error)
    return NextResponse.json(
      { error: 'Failed to invite collaborator' },
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
    const body = await request.json() as RoleUpdateRequest
    const { collaborator_id, role } = body

    if (!collaborator_id || !role) {
      return NextResponse.json(
        { error: 'Collaborator ID and role are required' },
        { status: 400 }
      )
    }

    // デモモードチェック
    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        message: 'デモモード: 権限を更新しました'
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
        { error: 'Only project owner can update collaborator roles' },
        { status: 403 }
      )
    }

    // コラボレーターの権限を更新
    const { error: updateError } = await supabase
      .from('project_collaborators')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', collaborator_id)
      .eq('project_id', id)

    if (updateError) {
      throw updateError
    }

    // アクティビティを記録
    await supabase
      .from('collaboration_activity')
      .insert({
        project_id: id,
        user_id: user.id,
        action: 'role_changed',
        description: `ユーザーの権限を ${role === 'editor' ? '編集者' : '閲覧者'} に変更しました`
      })

    return NextResponse.json({
      success: true,
      message: 'Collaborator role updated successfully'
    })

  } catch (error) {
    console.error('Collaborator role update error:', error)
    return NextResponse.json(
      { error: 'Failed to update collaborator role' },
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
    const url = new URL(request.url)
    const collaboratorId = url.searchParams.get('collaborator_id')

    if (!collaboratorId) {
      return NextResponse.json(
        { error: 'Collaborator ID is required' },
        { status: 400 }
      )
    }

    // デモモードチェック
    if (isDemoMode()) {
      return NextResponse.json({
        success: true,
        message: 'デモモード: コラボレーターを削除しました'
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
        { error: 'Only project owner can remove collaborators' },
        { status: 403 }
      )
    }

    // コラボレーター情報を取得（アクティビティログ用）
    const { data: collaborator } = await supabase
      .from('project_collaborators')
      .select(`
        user_id,
        profiles (email)
      `)
      .eq('id', collaboratorId)
      .eq('project_id', id)
      .single()

    // コラボレーターを削除
    const { error: deleteError } = await supabase
      .from('project_collaborators')
      .delete()
      .eq('id', collaboratorId)
      .eq('project_id', id)

    if (deleteError) {
      throw deleteError
    }

    // アクティビティを記録
    if (collaborator) {
      await supabase
        .from('collaboration_activity')
        .insert({
          project_id: id,
          user_id: user.id,
          action: 'user_removed',
          description: `${collaborator.profiles?.email || 'ユーザー'} をプロジェクトから削除しました`
        })
    }

    return NextResponse.json({
      success: true,
      message: 'Collaborator removed successfully'
    })

  } catch (error) {
    console.error('Collaborator removal error:', error)
    return NextResponse.json(
      { error: 'Failed to remove collaborator' },
      { status: 500 }
    )
  }
}