import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoProject } from '@/lib/demo-data'

interface AccessRequest {
  user_email?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    // デモモードチェック
    if (isDemoMode() && token.startsWith('demo_share_')) {
      // デモプロジェクトIDを抽出
      const projectId = token.split('_')[2]
      const project = getDemoProject(projectId)
      
      if (!project) {
        return NextResponse.json(
          { error: 'Shared project not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        projectData: {
          project,
          shareSettings: {
            is_public: true,
            allowed_emails: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          owner: {
            email: 'demo@example.com',
            name: 'デモユーザー'
          }
        }
      })
    }

    const supabase = await createClient()

    // 共有トークンからプロジェクト情報を取得
    const { data: shareData, error: shareError } = await supabase
      .from('project_shares')
      .select(`
        project_id,
        is_public,
        allowed_emails,
        created_at,
        updated_at,
        projects (
          *,
          profiles!projects_user_id_fkey (
            email,
            full_name
          )
        )
      `)
      .eq('share_token', token)
      .single()

    if (shareError) {
      if (shareError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Shared project not found' },
          { status: 404 }
        )
      }
      throw shareError
    }

    if (!shareData.projects) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const project = shareData.projects as any
    const owner = project.profiles

    // 基本的な応答データ
    const responseData = {
      project,
      shareSettings: {
        is_public: shareData.is_public,
        allowed_emails: shareData.allowed_emails,
        created_at: shareData.created_at,
        updated_at: shareData.updated_at
      },
      owner: {
        email: owner?.email || 'unknown',
        name: owner?.full_name || null
      }
    }

    // パブリック共有の場合は即座に返す
    if (shareData.is_public) {
      return NextResponse.json({
        success: true,
        projectData: responseData
      })
    }

    // プライベート共有の場合、アクセス権限情報のみ返す
    return NextResponse.json({
      success: true,
      requiresEmailVerification: true,
      allowedEmails: shareData.allowed_emails,
      projectTitle: project.title,
      ownerEmail: owner?.email || 'unknown'
    })

  } catch (error) {
    console.error('Shared project fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shared project' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const body = await request.json() as AccessRequest
    const { user_email } = body

    // デモモードチェック
    if (isDemoMode() && token.startsWith('demo_share_')) {
      const projectId = token.split('_')[2]
      const project = getDemoProject(projectId)
      
      if (!project) {
        return NextResponse.json(
          { error: 'Shared project not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        projectData: {
          project,
          shareSettings: {
            is_public: false,
            allowed_emails: ['demo@example.com', 'test@example.com'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          owner: {
            email: 'demo@example.com',
            name: 'デモユーザー'
          }
        }
      })
    }

    const supabase = await createClient()

    // 共有トークンからプロジェクト情報を取得
    const { data: shareData, error: shareError } = await supabase
      .from('project_shares')
      .select(`
        project_id,
        is_public,
        allowed_emails,
        created_at,
        updated_at,
        projects (
          *,
          profiles!projects_user_id_fkey (
            email,
            full_name
          )
        )
      `)
      .eq('share_token', token)
      .single()

    if (shareError) {
      if (shareError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Shared project not found' },
          { status: 404 }
        )
      }
      throw shareError
    }

    if (!shareData.projects) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const project = shareData.projects as any
    const owner = project.profiles

    // パブリック共有の場合
    if (shareData.is_public) {
      return NextResponse.json({
        success: true,
        projectData: {
          project,
          shareSettings: {
            is_public: shareData.is_public,
            allowed_emails: shareData.allowed_emails,
            created_at: shareData.created_at,
            updated_at: shareData.updated_at
          },
          owner: {
            email: owner?.email || 'unknown',
            name: owner?.full_name || null
          }
        }
      })
    }

    // プライベート共有の場合、メールアドレス確認
    if (!user_email) {
      return NextResponse.json(
        { error: 'Email address is required for private projects' },
        { status: 400 }
      )
    }

    // 許可されたメールアドレスかチェック
    if (!shareData.allowed_emails.includes(user_email)) {
      return NextResponse.json(
        { error: 'Access denied. Your email is not authorized to view this project.' },
        { status: 403 }
      )
    }

    // アクセス許可
    return NextResponse.json({
      success: true,
      projectData: {
        project,
        shareSettings: {
          is_public: shareData.is_public,
          allowed_emails: shareData.allowed_emails,
          created_at: shareData.created_at,
          updated_at: shareData.updated_at
        },
        owner: {
          email: owner?.email || 'unknown',
          name: owner?.full_name || null
        }
      }
    })

  } catch (error) {
    console.error('Shared project access error:', error)
    return NextResponse.json(
      { error: 'Failed to verify access' },
      { status: 500 }
    )
  }
}