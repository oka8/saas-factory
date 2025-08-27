import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { projectGeneratorDB } from '@/lib/database'
import { generateProjectCode } from '@/lib/claude-client'
import type { CreateProjectData } from '@/lib/types'
import { isDemoMode as checkDemoMode } from '@/lib/demo-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_id, project_data } = body

    if (!project_id || !project_data) {
      return NextResponse.json(
        { success: false, error: 'プロジェクトIDとデータが必要です' },
        { status: 400 }
      )
    }

    // AI生成モードの判定
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY
    const isDemoMode = checkDemoMode() || project_id.startsWith('demo-project-')

    if (isDemoMode) {
      // デモモード：簡易生成結果を返す
      return NextResponse.json({
        success: true,
        data: {
          project_id,
          status: 'completed',
          generated_code: {
            project_structure: {
              folders: ['app', 'components', 'lib', 'types'],
              files: [
                {
                  path: 'package.json',
                  content: JSON.stringify({
                    name: project_data.title?.toLowerCase().replace(/\s+/g, '-') || 'demo-project',
                    version: '1.0.0',
                    dependencies: {
                      'next': '^15.0.0',
                      'react': '^19.0.0',
                      'typescript': '^5.0.0'
                    }
                  }, null, 2)
                }
              ]
            },
            database_schema: { tables: [] },
            api_endpoints: [],
            features: []
          }
        },
        message: 'デモプロジェクトの生成が完了しました'
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

    try {
      // タイムアウト設定（3分）
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Generation timeout after 3 minutes')), 180000)
      })
      
      // 新しい統合されたプロジェクト生成を使用
      const generationPromise = projectGeneratorDB.generateProject(
        project_data,
        user.id,
        (step: string, progress: number, status: string) => {
          // リアルタイム進捗は将来のWebSocket実装で使用
          console.log(`Generation progress: ${step} - ${progress}% (${status})`)
        }
      )
      
      const result = await Promise.race([generationPromise, timeoutPromise])

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            project_id: result.data.id,
            status: result.data.status,
            generated_code: result.data.generated_code,
            generation_logs: result.data.generation_logs
          },
          message: result.message
        })
      } else {
        return NextResponse.json({
          success: false,
          error: result.error
        }, { status: 500 })
      }

    } catch (error: unknown) {
      console.error('AI Generation error:', error)
      
      let errorMessage = 'プロジェクトの生成中にエラーが発生しました'
      let statusCode = 500
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'APIキーが無効です。設定を確認してください。'
          statusCode = 401
        } else if (error.message.includes('429')) {
          errorMessage = 'API利用制限に達しました。しばらく待ってから再試行してください。'
          statusCode = 429
        } else if (error.message.includes('timeout')) {
          errorMessage = 'リクエストがタイムアウトしました。もう一度お試しください。'
          statusCode = 504
        }
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, { status: statusCode })
    }

  } catch (error: any) {
    console.error('Generate project error:', error)
    
    // より詳細なエラーメッセージ
    let errorMessage = 'リクエストの処理中にエラーが発生しました'
    
    if (error.message) {
      if (error.message.includes('required')) {
        errorMessage = '必須項目が不足しています。すべての項目を入力してください。'
      } else if (error.message.includes('database')) {
        errorMessage = 'データベースエラーが発生しました。しばらくお待ちください。'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'プロジェクトIDが必要です' },
        { status: 400 }
      )
    }

    // 生成ログを取得
    const { data: logs, error } = await supabase
      .from('generation_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('started_at', { ascending: true })

    if (error) throw error

    // プロジェクトの現在の状態も取得
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('status, generated_code')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError) throw projectError

    return NextResponse.json({
      success: true,
      data: {
        project_status: project.status,
        generated_code: project.generated_code,
        generation_logs: logs || []
      }
    })

  } catch (error: any) {
    console.error('Get generation status error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}