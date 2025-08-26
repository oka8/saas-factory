'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useParams, useRouter } from 'next/navigation'
import { MonitoringDashboard } from '@/components/monitoring/MonitoringDashboard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { isDemoMode, getDemoProject } from '@/lib/demo-data'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Project } from '@/lib/types'

export default function ProjectMonitoringPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { id } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    } else if (user && id) {
      fetchProject()
    }
  }, [user, authLoading, router, id])

  const fetchProject = async () => {
    setLoading(true)
    try {
      if (isDemoMode()) {
        const demoProject = getDemoProject(id as string)
        if (demoProject) {
          setProject(demoProject)
        }
      } else {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()

        if (!error && data) {
          setProject(data)
        }
      }
    } catch (err) {
      console.error('Error fetching project:', err)
    } finally {
      setLoading(false)
    }
  }

  // 認証チェック
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            プロジェクトが見つかりません
          </h2>
          <Link 
            href="/projects"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            プロジェクト一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            プロジェクト詳細に戻る
          </Link>
        </div>

        {/* Monitoring Dashboard */}
        <MonitoringDashboard
          projectId={id as string}
          projectTitle={project.title}
          refreshInterval={30000}
        />
      </div>
    </div>
  )
}