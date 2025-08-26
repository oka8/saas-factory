'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'

export interface GenerationStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  progress: number
  startTime?: Date
  endTime?: Date
  error?: string
}

export interface ProjectGenerationState {
  isGenerating: boolean
  currentStep: string | null
  steps: GenerationStep[]
  progress: number
  error: string | null
}

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

export function useProjectGeneration() {
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
  
  const supabase = createClient()
  const { showToast } = useToast()

  const updateStep = useCallback((stepId: string, updates: Partial<GenerationStep>) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId
          ? { ...step, ...updates }
          : step
      )
    }))
  }, [])

  const calculateProgress = useCallback((steps: GenerationStep[]) => {
    const totalSteps = steps.length
    const completedSteps = steps.filter(step => step.status === 'completed').length
    const inProgressSteps = steps.filter(step => step.status === 'in_progress')
    
    let progress = (completedSteps / totalSteps) * 100
    
    // 進行中のステップがある場合、その進捗も加味
    if (inProgressSteps.length > 0) {
      const inProgressStep = inProgressSteps[0]
      progress += (inProgressStep.progress / totalSteps)
    }
    
    return Math.min(100, Math.round(progress))
  }, [])

  const startGeneration = useCallback(async (projectId: string, projectData: any) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      currentStep: GENERATION_STEPS[0].id,
      error: null,
      progress: 0,
      steps: GENERATION_STEPS.map(step => ({
        ...step,
        status: 'pending' as const,
        progress: 0
      }))
    }))

    try {
      // 実際のプロジェクト生成APIを呼び出し
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

      // 生成を開始したら、進捗をシミュレート
      // （将来的にはWebSocketやSSEで実際の進捗を受信）
      for (let i = 0; i < GENERATION_STEPS.length; i++) {
        const step = GENERATION_STEPS[i]
        
        setState(prev => ({
          ...prev,
          currentStep: step.id
        }))

        // ステップを開始
        updateStep(step.id, {
          status: 'in_progress',
          startTime: new Date(),
          progress: 0
        })

        // 各ステップの進捗をシミュレート
        const stepDuration = step.id === 'generate_code' ? 3000 : 1500 // コード生成は長め
        const progressInterval = stepDuration / 10

        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, progressInterval))
          
          updateStep(step.id, { progress })
          
          setState(prev => ({
            ...prev,
            progress: calculateProgress(prev.steps)
          }))

          // 生成中断チェック
          if (!prev.isGenerating) break
        }

        // ステップを完了
        updateStep(step.id, {
          status: 'completed',
          endTime: new Date(),
          progress: 100
        })

        setState(prev => ({
          ...prev,
          progress: calculateProgress(prev.steps)
        }))
      }

      // 生成結果を確認
      const result = await generateResponse.json()
      
      if (!result.success) {
        throw new Error(result.error || '生成に失敗しました')
      }

      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentStep: null
      }))

      showToast('プロジェクトの生成が完了しました！', 'success')
      return { success: true, data: result.data }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '生成中にエラーが発生しました'
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
        currentStep: null
      }))

      // 現在のステップにエラーを設定
      setState(prev => {
        if (prev.currentStep) {
          return {
            ...prev,
            steps: prev.steps.map(step =>
              step.id === prev.currentStep
                ? { ...step, status: 'error' as const, error: errorMessage, endTime: new Date() }
                : step
            )
          }
        }
        return prev
      })

      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }, [updateStep, calculateProgress, showToast])

  const resetGeneration = useCallback(() => {
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
  }, [])

  return {
    ...state,
    startGeneration,
    resetGeneration
  }
}