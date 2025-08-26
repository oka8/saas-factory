'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { GenerationStep, ProjectGenerationState } from './useProjectGeneration'
import { useToast } from '@/components/ui/Toast'

const GENERATION_STEPS: Omit<GenerationStep, 'status' | 'progress' | 'startTime' | 'endTime' | 'error'>[] = [
  {
    id: 'analyze',
    name: '要件分析',
    description: 'プロジェクト要件を分析しています'
  },
  {
    id: 'design', 
    name: 'アーキテクチャ設計',
    description: 'システム設計を作成しています'
  },
  {
    id: 'generate_code',
    name: 'コード生成',
    description: 'AIがコードを生成しています'
  },
  {
    id: 'create_database',
    name: 'データベース構築',
    description: 'データベーススキーマを作成しています'
  },
  {
    id: 'setup_auth',
    name: '認証設定',
    description: '認証システムを設定しています'
  },
  {
    id: 'optimize',
    name: 'コード最適化',
    description: 'コードを最適化しています'
  },
  {
    id: 'test',
    name: 'テスト生成',
    description: 'テストコードを生成しています'
  },
  {
    id: 'finalize',
    name: '最終処理',
    description: 'プロジェクトを完了しています'
  }
]

export function useSSEGeneration() {
  const [state, setState] = useState<ProjectGenerationState>({
    isGenerating: false,
    currentStep: null,
    steps: GENERATION_STEPS.map(step => ({
      ...step,
      status: 'pending' as const,
      progress: 0
    })),
    progress: 0,
    error: null
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const { showToast } = useToast()

  const calculateProgress = useCallback((steps: GenerationStep[]) => {
    const totalSteps = steps.length
    const completedSteps = steps.filter(step => step.status === 'completed').length
    const inProgressSteps = steps.filter(step => step.status === 'in_progress')
    
    let progress = (completedSteps / totalSteps) * 100
    
    if (inProgressSteps.length > 0) {
      const inProgressStep = inProgressSteps[0]
      progress += (inProgressStep.progress / totalSteps)
    }
    
    return Math.min(100, Math.round(progress))
  }, [])

  const updateStep = useCallback((stepId: string, updates: Partial<GenerationStep>) => {
    setState(prev => {
      const newSteps = prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
      return {
        ...prev,
        steps: newSteps,
        progress: calculateProgress(newSteps)
      }
    })
  }, [calculateProgress])

  const startSSEGeneration = useCallback(async (projectId: string, projectData: any) => {
    // まず通常の生成APIを呼び出し
    try {
      const generateResponse = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: projectId,
          project_data: projectData
        })
      })

      if (!generateResponse.ok) {
        throw new Error(`生成APIエラー: ${generateResponse.status}`)
      }

      // 生成開始後、SSEで進捗を受信
      setState(prev => ({
        ...prev,
        isGenerating: true,
        currentStep: null,
        error: null,
        progress: 0,
        steps: GENERATION_STEPS.map(step => ({
          ...step,
          status: 'pending' as const,
          progress: 0
        }))
      }))

      // EventSourceを作成してSSE接続
      const eventSource = new EventSource(
        `/api/projects/generate/stream?project_id=${encodeURIComponent(projectId)}`
      )
      eventSourceRef.current = eventSource

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'start':
              setState(prev => ({
                ...prev,
                isGenerating: true,
                currentStep: data.steps[0]?.id || null
              }))
              break

            case 'step_progress':
              setState(prev => ({
                ...prev,
                currentStep: data.step_id
              }))
              updateStep(data.step_id, {
                status: 'in_progress',
                progress: data.progress,
                startTime: new Date()
              })
              break

            case 'step_complete':
              updateStep(data.step_id, {
                status: 'completed',
                progress: 100,
                endTime: new Date()
              })
              break

            case 'complete':
              setState(prev => ({
                ...prev,
                isGenerating: false,
                currentStep: null
              }))
              showToast(data.message || 'プロジェクト生成が完了しました', 'success')
              eventSource.close()
              break

            case 'error':
              setState(prev => ({
                ...prev,
                isGenerating: false,
                error: data.message,
                currentStep: null
              }))
              if (data.step_id) {
                updateStep(data.step_id, {
                  status: 'error',
                  error: data.message,
                  endTime: new Date()
                })
              }
              showToast(data.message, 'error')
              eventSource.close()
              break
          }
        } catch (error) {
          console.error('SSE data parsing error:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: 'リアルタイム更新の接続に失敗しました'
        }))
        eventSource.close()
      }

      return { success: true }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '生成開始に失敗しました'
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }))
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }, [updateStep, showToast])

  const stopGeneration = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setState(prev => ({
      ...prev,
      isGenerating: false,
      currentStep: null
    }))
  }, [])

  const resetGeneration = useCallback(() => {
    stopGeneration()
    setState({
      isGenerating: false,
      currentStep: null,
      steps: GENERATION_STEPS.map(step => ({
        ...step,
        status: 'pending' as const,
        progress: 0
      })),
      progress: 0,
      error: null
    })
  }, [stopGeneration])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return {
    ...state,
    startGeneration: startSSEGeneration,
    stopGeneration,
    resetGeneration
  }
}