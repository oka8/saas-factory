'use client'

import { useState } from 'react'
import { X, Github, Zap, Loader2, CheckCircle, AlertCircle, ExternalLink, Key, Globe, Settings } from 'lucide-react'
import { EnvVarManager } from './EnvVarManager'

interface DeploymentModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectTitle: string
  onDeploySuccess?: (result: any) => void
}

type DeploymentStep = 'select' | 'github' | 'vercel' | 'one-click' | 'deploying' | 'success' | 'error'

export function DeploymentModal({ 
  isOpen, 
  onClose, 
  projectId,
  projectTitle,
  onDeploySuccess 
}: DeploymentModalProps) {
  const [currentStep, setCurrentStep] = useState<DeploymentStep>('select')
  const [githubToken, setGithubToken] = useState('')
  const [vercelToken, setVercelToken] = useState('')
  const [repoName, setRepoName] = useState(projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'))
  const [projectName, setProjectName] = useState(projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deploymentResult, setDeploymentResult] = useState<any>(null)
  const [githubResult, setGithubResult] = useState<any>(null)
  const [envVars, setEnvVars] = useState<{ key: string; value: string; description?: string }[]>([])
  const [oneClickProgress, setOneClickProgress] = useState<string>('')

  const handleGitHubDeploy = async () => {
    if (!githubToken) {
      setError('GitHubトークンを入力してください')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/deploy/github`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubToken,
          repoName
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'GitHub デプロイに失敗しました')
      }

      setGithubResult(result)
      setCurrentStep('vercel')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setCurrentStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleVercelDeploy = async () => {
    if (!vercelToken) {
      setError('Vercelトークンを入力してください')
      return
    }

    setLoading(true)
    setError(null)
    setCurrentStep('deploying')

    try {
      const response = await fetch(`/api/projects/${projectId}/deploy/vercel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vercelToken,
          projectName,
          githubRepo: githubResult?.repository?.full_name
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Vercel デプロイに失敗しました')
      }

      setDeploymentResult(result)
      setCurrentStep('success')
      
      if (onDeploySuccess) {
        onDeploySuccess({
          github: githubResult,
          vercel: result
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setCurrentStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleOneClickDeploy = async () => {
    if (!githubToken || !vercelToken) {
      setError('GitHubトークンとVercelトークンの両方が必要です')
      return
    }

    setLoading(true)
    setError(null)
    setCurrentStep('deploying')

    try {
      setOneClickProgress('GitHubリポジトリを作成中...')
      
      const response = await fetch(`/api/projects/${projectId}/deploy/one-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubToken,
          vercelToken,
          repoName,
          projectName,
          envVars: envVars.filter(env => env.key && env.value)
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'ワンクリックデプロイに失敗しました')
      }

      setDeploymentResult(result)
      setGithubResult(result.steps.github)
      setCurrentStep('success')
      
      if (onDeploySuccess) {
        onDeploySuccess(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setCurrentStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCurrentStep('select')
    setError(null)
    setGithubResult(null)
    setDeploymentResult(null)
    setOneClickProgress('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">プロジェクトをデプロイ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step: Select Platform */}
          {currentStep === 'select' && (
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                プロジェクトをデプロイする方法を選択してください
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setCurrentStep('one-click')}
                  className="p-6 border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:border-blue-500 transition-colors text-left relative"
                >
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    推奨
                  </div>
                  <Settings className="w-8 h-8 mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2">ワンクリックデプロイ</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    全て自動で設定。GitHub + Vercel + 環境変数
                  </p>
                </button>

                <button
                  onClick={() => setCurrentStep('github')}
                  className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                >
                  <Github className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">GitHub + Vercel</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    GitHubにリポジトリを作成し、Vercelでホスティング
                  </p>
                </button>

                <button
                  onClick={() => setCurrentStep('vercel')}
                  className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
                >
                  <Zap className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">Vercelのみ</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vercelに直接デプロイ（GitHub連携なし）
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step: GitHub Setup */}
          {currentStep === 'github' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  GitHub リポジトリ作成
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      リポジトリ名
                    </label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="my-saas-project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      GitHub Personal Access Token
                      <a
                        href="https://github.com/settings/tokens/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-700 text-xs"
                      >
                        トークンを作成 <ExternalLink className="inline w-3 h-3" />
                      </a>
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        placeholder="ghp_xxxxxxxxxxxxx"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      repo スコープの権限が必要です
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCurrentStep('select')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  戻る
                </button>
                <button
                  onClick={handleGitHubDeploy}
                  disabled={loading || !githubToken}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      作成中...
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4" />
                      リポジトリ作成
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Vercel Setup */}
          {currentStep === 'vercel' && (
            <div className="space-y-6">
              {githubResult && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">GitHubリポジトリ作成完了</p>
                      <a
                        href={githubResult.repository.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm underline flex items-center gap-1 mt-1"
                      >
                        {githubResult.repository.full_name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Vercel デプロイ設定
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      プロジェクト名
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="my-saas-project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Vercel Token
                      <a
                        href="https://vercel.com/account/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-700 text-xs"
                      >
                        トークンを作成 <ExternalLink className="inline w-3 h-3" />
                      </a>
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={vercelToken}
                        onChange={(e) => setVercelToken(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        placeholder="xxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCurrentStep(githubResult ? 'github' : 'select')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  戻る
                </button>
                <button
                  onClick={handleVercelDeploy}
                  disabled={loading || !vercelToken}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      デプロイ中...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      デプロイ開始
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: One-Click Deploy */}
          {currentStep === 'one-click' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  ワンクリックデプロイ設定
                </h3>
                
                <div className="space-y-6">
                  {/* Basic Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        リポジトリ名
                      </label>
                      <input
                        type="text"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        placeholder="my-saas-project"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Vercelプロジェクト名
                      </label>
                      <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        placeholder="my-saas-project"
                      />
                    </div>
                  </div>

                  {/* Tokens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        GitHub Personal Access Token
                        <a
                          href="https://github.com/settings/tokens/new"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-700 text-xs"
                        >
                          作成 <ExternalLink className="inline w-3 h-3" />
                        </a>
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                          placeholder="ghp_xxxxxxxxxxxxx"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Vercel Token
                        <a
                          href="https://vercel.com/account/tokens"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-700 text-xs"
                        >
                          作成 <ExternalLink className="inline w-3 h-3" />
                        </a>
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input
                          type="password"
                          value={vercelToken}
                          onChange={(e) => setVercelToken(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                          placeholder="xxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Environment Variables */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <EnvVarManager
                      envVars={envVars}
                      onChange={setEnvVars}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCurrentStep('select')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  戻る
                </button>
                <button
                  onClick={handleOneClickDeploy}
                  disabled={loading || !githubToken || !vercelToken}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      デプロイ中...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      ワンクリックデプロイ
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Deploying */}
          {currentStep === 'deploying' && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">デプロイ中...</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {oneClickProgress || 'プロジェクトをデプロイしています...'}
              </p>
              <div className="text-xs text-gray-500">
                この処理には数分かかる場合があります
              </div>
            </div>
          )}

          {/* Step: Success */}
          {currentStep === 'success' && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">デプロイ成功！</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                プロジェクトが正常にデプロイされました
              </p>

              <div className="space-y-3">
                {githubResult && (
                  <a
                    href={githubResult.repository.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Github className="w-4 h-4" />
                    GitHubリポジトリを見る
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                {deploymentResult && (
                  <div className="flex justify-center">
                    <a
                      href={deploymentResult.deployment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                    >
                      <Globe className="w-4 h-4" />
                      デプロイされたサイトを見る
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                閉じる
              </button>
            </div>
          )}

          {/* Step: Error */}
          {currentStep === 'error' && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">エラーが発生しました</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error || 'デプロイ中にエラーが発生しました'}
              </p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                もう一度試す
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}