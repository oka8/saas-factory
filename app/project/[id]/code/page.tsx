'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Project } from '@/lib/types'
import { isDemoMode, getDemoProject } from '@/lib/demo-data'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import CodeEditor from '@/components/code-editor/CodeEditor'
import { logProjectUpdated } from '@/lib/project-history'

interface CodeFile {
  path: string
  content: string
  language: string
}

const DEMO_FILES: CodeFile[] = [
  {
    path: 'app/page.tsx',
    language: 'tsx',
    content: `import { useState } from 'react'
import './globals.css'

export default function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome to your SaaS App
        </h1>
        
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            Count: {count}
          </p>
          
          <div className="space-x-4">
            <button
              onClick={() => setCount(count + 1)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Increment
            </button>
            
            <button
              onClick={() => setCount(count - 1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Decrement
            </button>
            
            <button
              onClick={() => setCount(0)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}`
  },
  {
    path: 'app/globals.css',
    language: 'css',
    content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

/* Custom utilities */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors;
}

.card {
  @apply bg-white rounded-lg shadow-lg p-6;
}`
  },
  {
    path: 'components/Button.tsx',
    language: 'tsx',
    content: `import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button`
  },
  {
    path: 'lib/utils.ts',
    language: 'typescript',
    content: `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}`
  },
  {
    path: 'package.json',
    language: 'json',
    content: `{
  "name": "my-saas-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}`
  }
]

export default function CodeEditorPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const supabase = createClient()
  const { showToast, Toast } = useToast()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<CodeFile[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activePanel, setActivePanel] = useState<'editor' | 'preview'>('editor')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user && projectId) {
      fetchProject()
    }
  }, [user, authLoading, projectId, router])

  const fetchProject = async () => {
    try {
      setLoading(true)
      
      // デモモードの場合
      if (isDemoMode()) {
        const demoProject = getDemoProject(projectId)
        if (demoProject) {
          setProject(demoProject)
          setFiles(DEMO_FILES)
        } else {
          setError('プロジェクトが見つかりません')
        }
        return
      }

      const response = await fetch(`/api/projects/${projectId}`)
      const result = await response.json()

      if (result.success) {
        const projectData = result.data.project
        setProject(projectData)
        
        // 生成されたコードがある場合は使用、ない場合はデモファイル
        if (projectData.generated_code?.files) {
          setFiles(projectData.generated_code.files)
        } else {
          setFiles(DEMO_FILES)
        }
      } else {
        setError(result.error || 'プロジェクトの取得に失敗しました')
      }
    } catch (err: any) {
      console.error('Error fetching project:', err)
      setError('プロジェクトの取得中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleFilesChange = useCallback((newFiles: CodeFile[]) => {
    setFiles(newFiles)
    setHasUnsavedChanges(true)
  }, [])

  const handleSave = async () => {
    if (!user || !project || !hasUnsavedChanges) return

    setSaving(true)
    try {
      // デモモードでは保存をシミュレート
      if (isDemoMode()) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        showToast('デモモードでは変更は保存されません', 'info')
        return
      }

      const { error } = await supabase
        .from('projects')
        .update({
          generated_code: {
            ...project.generated_code,
            files: files,
            last_updated: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)

      if (error) throw error

      // 履歴に記録
      await logProjectUpdated(projectId, user.id, [{
        field: 'generated_code',
        oldValue: 'previous code',
        newValue: 'updated code'
      }])

      setHasUnsavedChanges(false)
      showToast('コードを保存しました', 'success')
    } catch (err: any) {
      console.error('Error saving code:', err)
      showToast('コードの保存に失敗しました', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    try {
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      files.forEach(file => {
        zip.file(file.path, file.content)
      })
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project?.title || 'project'}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showToast('ファイルをダウンロードしました', 'success')
    } catch (error) {
      console.error('Error downloading files:', error)
      showToast('ダウンロードに失敗しました', 'error')
    }
  }

  // ページ離脱時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="コードエディタを準備中..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">エラーが発生しました</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <Link href={`/project/${projectId}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            プロジェクトに戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">プロジェクトが見つかりません</h2>
          <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/project/${projectId}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              ← {project.title}
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              コードエディタ
            </h1>
            {hasUnsavedChanges && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-full text-xs">
                未保存の変更
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* パネル切り替え */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActivePanel('editor')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activePanel === 'editor'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                エディタ
              </button>
              <button
                onClick={() => setActivePanel('preview')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activePanel === 'preview'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                プレビュー
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ダウンロード
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving || !hasUnsavedChanges}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">保存中...</span>
                </div>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-hidden">
        {activePanel === 'editor' ? (
          <CodeEditor
            files={files}
            onFilesChange={handleFilesChange}
            className="h-full"
          />
        ) : (
          <div className="h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg m-4 overflow-auto">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                プレビュー機能
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                ライブプレビュー機能は開発中です。<br />
                現在はコードの編集とダウンロードが可能です。
              </p>
              <button
                onClick={() => setActivePanel('editor')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                エディタに戻る
              </button>
            </div>
          </div>
        )}
      </main>

      <Toast />
    </div>
  )
}