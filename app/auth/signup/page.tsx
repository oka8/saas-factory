'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { isDemoMode } from '@/lib/demo-data'
import { devLog } from '@/lib/logger'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isDemo, setIsDemo] = useState(true) // デフォルトでデモモード
  const router = useRouter()
  const { showToast, Toast } = useToast()

  // デモモードの検出（Supabaseクライアントは作成しない）
  useEffect(() => {
    const demoMode = isDemoMode()
    devLog.log('Demo mode detection', { demoMode })
    setIsDemo(demoMode)
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // パスワード確認
    if (password !== confirmPassword) {
      const errorMsg = 'パスワードが一致しません'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      return
    }

    if (password.length < 8) {
      const errorMsg = 'パスワードは8文字以上で設定してください'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      return
    }

    setLoading(true)

    try {
      if (isDemoMode()) {
        // デモモードでは成功として扱う
        devLog.log('handleSignup: Using demo mode flow')
        setTimeout(() => {
          setSuccess(true)
          showToast('デモモードで登録が完了しました', 'success')
          setLoading(false)
        }, 1500) // リアルなUX体験のための遅延
        return
      }

      // 実際のSupabase認証
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        devLog.log('Supabase signup error:', error)
        let errorMessage = error.message
        
        // 日本語エラーメッセージに変換
        if (error.message.includes('Invalid email')) {
          errorMessage = '無効なメールアドレスです'
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'パスワードは8文字以上で設定してください'
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'このメールアドレスは既に登録されています'
        }
        
        setError(errorMessage)
        showToast(`登録エラー: ${errorMessage}`, 'error')
      } else {
        setSuccess(true)
        showToast('登録完了！確認メールをお送りしました', 'success')
      }
    } catch (err) {
      const errorMsg = '予期しないエラーが発生しました'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      if (!isDemoMode()) {
        setLoading(false)
      }
    }
  }

  const handleGoogleSignup = async () => {
    setError(null)
    setLoading(true)

    try {
      // デモモードの場合は実際のAPI呼び出しをスキップ
      if (isDemoMode()) {
        setTimeout(() => {
          showToast('デモモードではソーシャルログインは利用できません', 'info')
          setLoading(false)
        }, 1000)
        return
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        showToast(`Googleログインエラー: ${error.message}`, 'error')
      }
    } catch (err) {
      const errorMsg = '予期しないエラーが発生しました'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      if (!isDemoMode()) {
        setLoading(false)
      }
    }
  }

  const handleGitHubSignup = async () => {
    setError(null)
    setLoading(true)

    try {
      // デモモードの場合は実際のAPI呼び出しをスキップ
      if (isDemoMode()) {
        setTimeout(() => {
          showToast('デモモードではソーシャルログインは利用できません', 'info')
          setLoading(false)
        }, 1000)
        return
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        showToast(`GitHubログインエラー: ${error.message}`, 'error')
      }
    } catch (err) {
      const errorMsg = '予期しないエラーが発生しました'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      if (!isDemoMode()) {
        setLoading(false)
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">登録完了！</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              確認メールを送信しました。メール内のリンクをクリックして、アカウントを有効化してください。
            </p>
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              ログインページへ戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            {isDemo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg mb-4 text-sm">
                🔍 デモモード - 実際のアカウント作成は行われません
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              アカウント作成
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              SaaSの自動生成を始めましょう
            </p>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* サインアップフォーム */}
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="8文字以上"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                パスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="もう一度入力"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">登録中...</span>
                </div>
              ) : (
                'アカウント作成'
              )}
            </button>
          </form>

          {/* 区切り線 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">または</span>
            </div>
          </div>

          {/* ソーシャル登録 */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleで登録
            </button>

            <button
              onClick={handleGitHubSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHubで登録
            </button>
          </div>

          {/* ログインリンク */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
              ログイン
            </Link>
          </p>

          {/* 利用規約 */}
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            アカウントを作成することで、
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">利用規約</Link>
            と
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">プライバシーポリシー</Link>
            に同意したものとみなされます
          </p>
        </div>
        <Toast />
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignupForm />
    </Suspense>
  )
}