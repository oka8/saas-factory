import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoProject } from '@/lib/demo-data'

interface OneClickDeployRequest {
  githubToken: string
  vercelToken: string
  repoName?: string
  projectName?: string
  envVars?: { key: string; value: string }[]
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json() as OneClickDeployRequest
    const { githubToken, vercelToken, repoName, projectName, envVars = [] } = body

    if (!githubToken || !vercelToken) {
      return NextResponse.json(
        { error: 'GitHub token and Vercel token are required' },
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

      // デモモードでは段階的に進捗を返すシミュレーション
      const demoRepoName = repoName || project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const demoProjectName = projectName || project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')

      // GitHubステップのシミュレーション
      await sleep(2000)
      
      const githubResult = {
        success: true,
        repository: {
          name: demoRepoName,
          full_name: `demo-user/${demoRepoName}`,
          html_url: `https://github.com/demo-user/${demoRepoName}`,
          clone_url: `https://github.com/demo-user/${demoRepoName}.git`,
          private: false
        },
        filesUploaded: 8
      }

      // Vercelステップのシミュレーション
      await sleep(3000)

      const vercelResult = {
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
        }
      }

      return NextResponse.json({
        success: true,
        steps: {
          github: githubResult,
          vercel: vercelResult,
          envVars: { configured: envVars.length }
        },
        deployment: vercelResult.deployment,
        message: 'デモモード: ワンクリックデプロイが完了しました'
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

    const finalRepoName = repoName || project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const finalProjectName = projectName || project.title.toLowerCase().replace(/[^a-z0-9]/g, '-')

    // Step 1: GitHub リポジトリ作成
    const githubResponse = await fetch(`${request.nextUrl.origin}/api/projects/${id}/deploy/github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        githubToken,
        repoName: finalRepoName
      })
    })

    if (!githubResponse.ok) {
      const githubError = await githubResponse.json()
      return NextResponse.json(
        { error: `GitHub deployment failed: ${githubError.error}` },
        { status: 400 }
      )
    }

    const githubResult = await githubResponse.json()

    // Step 2: Vercel プロジェクト作成とデプロイ
    const vercelResponse = await fetch(`${request.nextUrl.origin}/api/projects/${id}/deploy/vercel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vercelToken,
        projectName: finalProjectName,
        githubRepo: githubResult.repository.full_name,
        envVars: Object.fromEntries(envVars.map(env => [env.key, env.value]))
      })
    })

    if (!vercelResponse.ok) {
      const vercelError = await vercelResponse.json()
      return NextResponse.json(
        { error: `Vercel deployment failed: ${vercelError.error}` },
        { status: 400 }
      )
    }

    const vercelResult = await vercelResponse.json()

    // Step 3: 環境変数の設定（Vercel）
    let envVarResult = { configured: 0 }
    if (envVars.length > 0 && vercelResult.project?.id) {
      try {
        for (const envVar of envVars) {
          if (envVar.key && envVar.value) {
            const envResponse = await fetch(`https://api.vercel.com/v9/projects/${vercelResult.project.id}/env`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${vercelToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                key: envVar.key,
                value: envVar.value,
                type: 'encrypted',
                target: ['production', 'preview', 'development']
              })
            })

            if (envResponse.ok) {
              envVarResult.configured++
            }
          }
        }
      } catch (err) {
        console.error('Environment variable configuration error:', err)
      }
    }

    // 最終結果を返す
    return NextResponse.json({
      success: true,
      steps: {
        github: githubResult,
        vercel: vercelResult,
        envVars: envVarResult
      },
      deployment: vercelResult.deployment,
      repository: githubResult.repository
    })

  } catch (error) {
    console.error('One-click deploy error:', error)
    return NextResponse.json(
      { error: 'One-click deployment failed' },
      { status: 500 }
    )
  }
}