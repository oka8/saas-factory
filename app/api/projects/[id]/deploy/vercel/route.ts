import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoProject } from '@/lib/demo-data'

interface VercelDeployment {
  name: string
  gitRepository?: {
    repo: string
    type: string
  }
  projectSettings?: {
    framework?: string
    buildCommand?: string
    outputDirectory?: string
    installCommand?: string
    devCommand?: string
  }
  env?: Record<string, string>
}

async function createVercelProject(
  token: string,
  projectName: string,
  gitRepo?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const body: any = {
      name: projectName,
      framework: 'nextjs',
      publicSource: false,
      buildCommand: 'npm run build',
      outputDirectory: '.next',
      installCommand: 'npm install',
      devCommand: 'npm run dev'
    }

    // GitHubリポジトリと連携する場合
    if (gitRepo) {
      body.gitRepository = {
        repo: gitRepo,
        type: 'github'
      }
    }

    const response = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json()
      return { 
        success: false, 
        error: error.error?.message || 'Failed to create Vercel project' 
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

async function triggerDeployment(
  token: string,
  projectId: string,
  gitRepo?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const body: any = {
      name: projectId,
      target: 'production',
      gitSource: gitRepo ? {
        ref: 'main',
        repo: gitRepo,
        type: 'github'
      } : undefined
    }

    const response = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json()
      return { 
        success: false, 
        error: error.error?.message || 'Failed to trigger deployment' 
      }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { vercelToken, projectName, githubRepo, envVars } = body

    if (!vercelToken) {
      return NextResponse.json(
        { error: 'Vercel token is required' },
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

      // デモモードでは実際のデプロイをせず、成功レスポンスを返す
      const demoProjectName = projectName || project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')
      return NextResponse.json({
        success: true,
        deployment: {
          id: 'demo-deployment-' + Date.now(),
          name: demoProjectName,
          url: `https://${demoProjectName}.vercel.app`,
          readyState: 'READY',
          createdAt: new Date().toISOString()
        },
        project: {
          name: demoProjectName,
          id: 'demo-project-' + Date.now()
        },
        message: 'デモモード: デプロイメントをシミュレートしました'
      })
    }

    // 実際のSupabaseから取得
    const supabase = await createClient()
    
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // プロジェクト名を生成
    const finalProjectName = projectName || project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    
    // Vercelプロジェクトを作成
    const createResult = await createVercelProject(
      vercelToken,
      finalProjectName,
      githubRepo
    )

    if (!createResult.success) {
      return NextResponse.json(
        { error: createResult.error },
        { status: 400 }
      )
    }

    const vercelProject = createResult.data

    // デプロイメントをトリガー（GitHubリポジトリが連携されている場合）
    let deployment = null
    if (githubRepo) {
      const deployResult = await triggerDeployment(
        vercelToken,
        vercelProject.id,
        githubRepo
      )

      if (deployResult.success) {
        deployment = deployResult.data
      }
    }

    // Supabaseのプロジェクトを更新
    const deploymentUrl = deployment?.url || `https://${finalProjectName}.vercel.app`
    
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        deployment_url: deploymentUrl,
        status: 'deployed',
        deployed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update project:', updateError)
    }

    return NextResponse.json({
      success: true,
      deployment: deployment || {
        url: deploymentUrl,
        readyState: 'BUILDING'
      },
      project: {
        name: vercelProject.name,
        id: vercelProject.id
      }
    })

  } catch (error) {
    console.error('Vercel deploy error:', error)
    return NextResponse.json(
      { error: 'Failed to deploy to Vercel' },
      { status: 500 }
    )
  }
}