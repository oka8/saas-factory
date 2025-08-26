'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { GenerationStep, ProjectGenerationState } from '@/lib/hooks/useProjectGeneration'
import { LoadingSpinner } from './LoadingSpinner'

interface ProjectGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  generationState: ProjectGenerationState
  projectTitle?: string
  onRetry?: () => void
}

export function ProjectGenerationModal({ 
  isOpen, 
  onClose, 
  generationState, 
  projectTitle = 'プロジェクト',
  onRetry
}: ProjectGenerationModalProps) {
  const { isGenerating, steps, progress, currentStep, error } = generationState
  
  const getStepIcon = (step: GenerationStep) => {
    switch (step.status) {
      case 'completed':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'in_progress':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <LoadingSpinner size="sm" color="blue" />
          </div>
        )
      case 'error':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          </div>
        )
    }
  }

  const getStepDuration = (step: GenerationStep) => {
    if (step.startTime && step.endTime) {
      const duration = step.endTime.getTime() - step.startTime.getTime()
      return `${Math.round(duration / 1000)}秒`
    }
    if (step.startTime) {
      const duration = Date.now() - step.startTime.getTime()
      return `${Math.round(duration / 1000)}秒経過`
    }
    return null
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                      {projectTitle}の生成中
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      AIがあなたのSaaSアプリケーションを生成しています
                    </p>
                  </div>
                  {!isGenerating && !error && (
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* 全体の進捗バー */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">全体の進捗</span>
                    <span className="text-sm text-gray-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* エラー表示 */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-red-800 mb-1">
                          エラーが発生しました
                        </h4>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ステップ一覧 */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {steps.map((step, index) => {
                    const isActive = currentStep === step.id
                    const duration = getStepDuration(step)
                    
                    return (
                      <div
                        key={step.id}
                        className={`flex items-start space-x-4 p-4 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 border border-blue-200' 
                            : step.status === 'completed' 
                            ? 'bg-green-50'
                            : step.status === 'error'
                            ? 'bg-red-50'
                            : 'bg-gray-50'
                        }`}
                      >
                        {/* ステップアイコン */}
                        <div className="flex-shrink-0 mt-1">
                          {getStepIcon(step)}
                        </div>

                        {/* ステップ内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {step.name}
                            </h4>
                            {duration && (
                              <span className="text-xs text-gray-500 ml-2">
                                {duration}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {step.description}
                          </p>
                          
                          {/* ステップ別の進捗バー */}
                          {step.status === 'in_progress' && (
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${step.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* エラー詳細 */}
                          {step.status === 'error' && step.error && (
                            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                              {step.error}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* フッター */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  {isGenerating ? (
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">
                        生成中です。このプロセスには数分かかる場合があります...
                      </span>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-red-600 block">
                          生成に失敗しました
                        </span>
                        <span className="text-xs text-gray-500 mt-1 block">
                          ネットワーク接続やAPIキー設定をご確認ください
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {onRetry && (
                          <button
                            onClick={onRetry}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            再試行
                          </button>
                        )}
                        <button
                          onClick={onClose}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          閉じる
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        生成が完了しました！
                      </span>
                      <button
                        onClick={onClose}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        プロジェクトを確認
                      </button>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}