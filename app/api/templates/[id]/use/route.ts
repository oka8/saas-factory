import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode } from '@/lib/demo-data'

interface UseTemplateRequest {
  title?: string
  description?: string
  customize?: {
    features?: string
    design_preferences?: string
    tech_requirements?: string
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json() as UseTemplateRequest
    const { title, description, customize } = body

    // デモモードチェック
    if (isDemoMode()) {
      // デモ用の新しいプロジェクトを作成をシミュレート
      const newProject = {
        id: `project-from-template-${Date.now()}`,
        title: title || `テンプレートから作成されたプロジェクト`,
        description: description || 'テンプレートから作成されたプロジェクト',
        category: 'web-app',
        status: 'draft' as const,
        features: customize?.features || 'テンプレートから継承された機能',
        design_preferences: customize?.design_preferences || 'テンプレートから継承されたデザイン',
        tech_requirements: customize?.tech_requirements || 'テンプレートから継承された技術要件',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user'
      }

      return NextResponse.json({
        success: true,
        project: newProject,
        message: 'デモモード: テンプレートからプロジェクトを作成しました'
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

    // テンプレートを取得（プリセットまたはユーザー作成）
    let template = null

    // まずプリセットテンプレートをチェック
    const PRESET_TEMPLATES = [
      {
        id: 'template-landing-page',
        name: 'ランディングページ',
        features: `ヒーローセクション
機能紹介セクション
価格設定表
お問い合わせフォーム
レスポンシブデザイン
SEO最適化`,
        design_preferences: `モダンでクリーンなデザイン
ブランドカラーの活用
アニメーション効果
モバイルファースト`,
        tech_requirements: `Next.js 15
TypeScript
Tailwind CSS
Framer Motion
React Hook Form`,
        category: 'landing-page'
      },
      {
        id: 'template-saas-dashboard',
        name: 'SaaS ダッシュボード',
        features: `ユーザー認証システム
データ可視化（チャート）
ユーザー管理
設定画面
通知システム
ダークモード対応`,
        design_preferences: `プロフェッショナルなUI
データ重視のレイアウト
カスタマイズ可能なテーマ
アクセシビリティ対応`,
        tech_requirements: `Next.js 15
TypeScript
Tailwind CSS
Supabase
Chart.js
NextAuth.js`,
        category: 'dashboard'
      },
      // 他のプリセットテンプレート...
    ]

    const presetTemplate = PRESET_TEMPLATES.find(t => t.id === id)
    
    if (presetTemplate) {
      template = presetTemplate
      
      // プリセットテンプレートの使用回数を増やす処理は、実際のテンプレートシステムでは
      // 別途管理される可能性があります
    } else {
      // ユーザー作成テンプレートから取得
      const { data: userTemplate, error: templateError } = await supabase
        .from('project_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (templateError) {
        if (templateError.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          )
        }
        throw templateError
      }

      // プライベートテンプレートの場合、作成者のみアクセス可能
      if (!userTemplate.is_public && userTemplate.created_by !== user.id) {
        return NextResponse.json(
          { error: 'Permission denied. This template is private.' },
          { status: 403 }
        )
      }

      template = userTemplate

      // 使用回数をインクリメント
      await supabase
        .from('project_templates')
        .update({ 
          usage_count: (userTemplate.usage_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
    }

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // テンプレートから新しいプロジェクトを作成
    const projectData = {
      user_id: user.id,
      title: title || `${template.name}から作成`,
      description: description || `${template.name}テンプレートから作成されたプロジェクト`,
      category: template.category,
      features: customize?.features || template.features,
      design_preferences: customize?.design_preferences || template.design_preferences,
      tech_requirements: customize?.tech_requirements || template.tech_requirements,
      status: 'draft' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      template_id: id // テンプレートIDを記録
    }

    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (projectError) {
      throw projectError
    }

    // アクティビティログを記録
    await supabase
      .from('project_activity')
      .insert({
        project_id: newProject.id,
        user_id: user.id,
        action: 'project_created_from_template',
        description: `テンプレート "${template.name}" からプロジェクトが作成されました`,
        metadata: {
          template_id: id,
          template_name: template.name
        }
      })

    return NextResponse.json({
      success: true,
      project: newProject,
      template: template,
      message: 'Project created from template successfully'
    })

  } catch (error) {
    console.error('Template usage error:', error)
    return NextResponse.json(
      { error: 'Failed to create project from template' },
      { status: 500 }
    )
  }
}