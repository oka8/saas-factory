import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')

  if (!projectId) {
    return new Response('Missing project_id', { status: 400 })
  }

  // Server-Sent Events用のヘッダーを設定
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  })

  // ReadableStreamを作成してSSEを実装
  const stream = new ReadableStream({
    start(controller) {
      // 進捗更新をシミュレート
      let stepIndex = 0
      const steps = [
        { id: 'analyze', name: '要件分析', progress: 0 },
        { id: 'design', name: 'アーキテクチャ設計', progress: 0 },
        { id: 'generate_code', name: 'コード生成', progress: 0 },
        { id: 'create_database', name: 'データベース構築', progress: 0 },
        { id: 'setup_auth', name: '認証設定', progress: 0 },
        { id: 'optimize', name: 'コード最適化', progress: 0 },
        { id: 'test', name: 'テスト生成', progress: 0 },
        { id: 'finalize', name: '最終処理', progress: 0 }
      ]

      const sendUpdate = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(new TextEncoder().encode(message))
      }

      // 初期状態を送信
      sendUpdate({
        type: 'start',
        project_id: projectId,
        steps: steps.map(s => ({ ...s, status: 'pending' }))
      })

      const progressInterval = setInterval(() => {
        if (stepIndex >= steps.length) {
          // 生成完了
          sendUpdate({
            type: 'complete',
            project_id: projectId,
            message: 'プロジェクト生成が完了しました'
          })
          controller.close()
          clearInterval(progressInterval)
          return
        }

        const currentStep = steps[stepIndex]
        currentStep.progress += 20

        if (currentStep.progress >= 100) {
          // 現在のステップ完了
          sendUpdate({
            type: 'step_complete',
            project_id: projectId,
            step_id: currentStep.id,
            step_name: currentStep.name,
            progress: 100
          })
          stepIndex++
        } else {
          // ステップの進捗更新
          sendUpdate({
            type: 'step_progress',
            project_id: projectId,
            step_id: currentStep.id,
            step_name: currentStep.name,
            progress: currentStep.progress
          })
        }
      }, 500) // 0.5秒ごとに更新

      // クライアントが接続を切った時のクリーンアップ
      return () => {
        clearInterval(progressInterval)
      }
    },

    cancel() {
      // 接続がキャンセルされた時の処理
      console.log('SSE connection cancelled for project:', projectId)
    }
  })

  return new Response(stream, { headers })
}