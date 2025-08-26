import { createClient } from './supabase/client'
import { createClient as createServerClient } from './supabase/server'
import type { 
  Project, 
  CreateProjectData, 
  GenerationLog, 
  UserPreferences, 
  UserUsage, 
  Template,
  ProjectFormData,
  APIResponse,
  PaginatedResponse 
} from './types'
import { generateProjectCode, generateProjectCodeStream } from './claude-client'

// Client-side database functions
export class ProjectsDB {
  private supabase = createClient()

  async createProject(data: CreateProjectData): Promise<APIResponse<Project>> {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .insert([data])
        .select()
        .single()

      if (error) throw error

      return { success: true, data: project, message: 'プロジェクトが作成されました' }
    } catch (error: any) {
      console.error('Create project error:', error)
      return { success: false, error: error.message }
    }
  }

  async getProjects(page = 1, perPage = 10): Promise<PaginatedResponse<Project>> {
    try {
      const start = (page - 1) * perPage
      const end = start + perPage - 1

      const { data: projects, error, count } = await this.supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end)

      if (error) throw error

      return {
        data: projects || [],
        count: count || 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count || 0) / perPage)
      }
    } catch (error: any) {
      console.error('Get projects error:', error)
      return {
        data: [],
        count: 0,
        page,
        per_page: perPage,
        total_pages: 0
      }
    }
  }

  async getProject(id: string): Promise<APIResponse<Project>> {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return { success: true, data: project }
    } catch (error: any) {
      console.error('Get project error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<APIResponse<Project>> {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data: project, message: 'プロジェクトが更新されました' }
    } catch (error: any) {
      console.error('Update project error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateProjectStatus(id: string, status: Project['status']): Promise<APIResponse<Project>> {
    const updates: Partial<Project> = { status }
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
    }
    if (status === 'deployed') {
      updates.deployed_at = new Date().toISOString()
    }

    return this.updateProject(id, updates)
  }

  async deleteProject(id: string): Promise<APIResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error

      return { success: true, message: 'プロジェクトが削除されました' }
    } catch (error: any) {
      console.error('Delete project error:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserStats(): Promise<APIResponse<{ totalProjects: number; completedProjects: number; deployedProjects: number }>> {
    try {
      const { data: stats, error } = await this.supabase
        .from('projects')
        .select('status')

      if (error) throw error

      const totalProjects = stats?.length || 0
      const completedProjects = stats?.filter(p => p.status === 'completed' || p.status === 'deployed').length || 0
      const deployedProjects = stats?.filter(p => p.status === 'deployed').length || 0

      return {
        success: true,
        data: {
          totalProjects,
          completedProjects,
          deployedProjects
        }
      }
    } catch (error: any) {
      console.error('Get user stats error:', error)
      return { success: false, error: error.message }
    }
  }
}

export class GenerationLogsDB {
  private supabase = createClient()

  async createLog(data: Omit<GenerationLog, 'id' | 'started_at'>): Promise<APIResponse<GenerationLog>> {
    try {
      const { data: log, error } = await this.supabase
        .from('generation_logs')
        .insert([data])
        .select()
        .single()

      if (error) throw error

      return { success: true, data: log }
    } catch (error: any) {
      console.error('Create generation log error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateLog(id: string, updates: Partial<GenerationLog>): Promise<APIResponse<GenerationLog>> {
    try {
      if (updates.status === 'completed') {
        updates.completed_at = new Date().toISOString()
      }

      const { data: log, error } = await this.supabase
        .from('generation_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data: log }
    } catch (error: any) {
      console.error('Update generation log error:', error)
      return { success: false, error: error.message }
    }
  }

  async getProjectLogs(projectId: string): Promise<APIResponse<GenerationLog[]>> {
    try {
      const { data: logs, error } = await this.supabase
        .from('generation_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('started_at', { ascending: true })

      if (error) throw error

      return { success: true, data: logs || [] }
    } catch (error: any) {
      console.error('Get project logs error:', error)
      return { success: false, error: error.message }
    }
  }
}

export class UserPreferencesDB {
  private supabase = createClient()

  async getUserPreferences(): Promise<APIResponse<UserPreferences | null>> {
    try {
      const { data: preferences, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return { success: true, data: preferences }
    } catch (error: any) {
      console.error('Get user preferences error:', error)
      return { success: false, error: error.message }
    }
  }

  async createOrUpdatePreferences(preferences: Partial<UserPreferences>): Promise<APIResponse<UserPreferences>> {
    try {
      const { data: result, error } = await this.supabase
        .from('user_preferences')
        .upsert([preferences])
        .select()
        .single()

      if (error) throw error

      return { success: true, data: result }
    } catch (error: any) {
      console.error('Create/update preferences error:', error)
      return { success: false, error: error.message }
    }
  }
}

export class TemplatesDB {
  private supabase = createClient()

  async getTemplates(category?: string): Promise<APIResponse<Template[]>> {
    try {
      let query = this.supabase
        .from('templates')
        .select('*')
        .eq('is_active', true)

      if (category) {
        query = query.eq('category', category)
      }

      const { data: templates, error } = await query.order('name')

      if (error) throw error

      return { success: true, data: templates || [] }
    } catch (error: any) {
      console.error('Get templates error:', error)
      return { success: false, error: error.message }
    }
  }

  async getTemplate(id: string): Promise<APIResponse<Template>> {
    try {
      const { data: template, error } = await this.supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error

      return { success: true, data: template }
    } catch (error: any) {
      console.error('Get template error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Server-side database functions (for API routes)
export class ServerDB {
  static async createClient() {
    return await createServerClient()
  }

  static async updateUsageStats(userId: string, updates: Partial<UserUsage>) {
    const supabase = await this.createClient()
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'

    try {
      const { error } = await supabase
        .from('user_usage')
        .upsert([
          {
            user_id: userId,
            month: currentMonth,
            ...updates
          }
        ])

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Update usage stats error:', error)
      return { success: false, error: error.message }
    }
  }

  static async incrementUsage(userId: string, field: keyof Pick<UserUsage, 'projects_created' | 'projects_deployed' | 'api_calls'>, amount = 1) {
    const supabase = await this.createClient()
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'

    try {
      // First, get current usage or create new record
      const { data: currentUsage } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .single()

      const updates = {
        user_id: userId,
        month: currentMonth,
        [field]: (currentUsage?.[field] || 0) + amount
      }

      const { error } = await supabase
        .from('user_usage')
        .upsert([updates])

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Increment usage error:', error)
      return { success: false, error: error.message }
    }
  }

  static async logGeneration(projectId: string, step: GenerationLog['step'], status: GenerationLog['status'], message?: string, details?: any) {
    const supabase = await this.createClient()

    try {
      const logData = {
        project_id: projectId,
        step,
        status,
        message,
        details
      }

      if (status === 'completed') {
        logData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('generation_logs')
        .insert([logData])

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Log generation error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Enhanced project generation with Claude API integration
export class ProjectGeneratorDB {
  private static async createClient() {
    return await createServerClient()
  }

  // プロジェクト生成の統合関数
  static async generateProject(
    projectData: CreateProjectData,
    userId: string,
    onProgress?: (step: string, progress: number, status: 'pending' | 'in_progress' | 'completed' | 'failed') => void
  ): Promise<APIResponse<Project & { generation_logs: GenerationLog[] }>> {
    const supabase = await this.createClient()

    try {
      onProgress?.('プロジェクト作成中', 5, 'in_progress')

      // 1. プロジェクトをデータベースに作成
      const { data: project, error: createError } = await supabase
        .from('projects')
        .insert([{ ...projectData, user_id: userId, status: 'generating' }])
        .select()
        .single()

      if (createError) throw createError

      const projectId = project.id

      try {
        // 2. 生成ログを開始
        await this.logGenerationStep(projectId, 'analyze', 'in_progress', '要件分析を開始しています')
        onProgress?.('要件分析中', 10, 'in_progress')

        // 3. Claude APIを使用してプロジェクトコードを生成
        const generationResult = await generateProjectCodeStream(projectData, 
          (step: string, progress: number) => {
            onProgress?.(step, Math.min(20 + (progress * 0.6), 80), 'in_progress')
          }
        )

        if (!generationResult.success) {
          throw new Error(generationResult.error || 'プロジェクト生成に失敗しました')
        }

        await this.logGenerationStep(projectId, 'generate_code', 'completed', 'コード生成が完了しました')
        onProgress?.('生成完了', 90, 'in_progress')

        // 4. 生成されたコードをデータベースに保存
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            status: 'completed',
            generated_code: generationResult.data,
            completed_at: new Date().toISOString()
          })
          .eq('id', projectId)

        if (updateError) throw updateError

        await this.logGenerationStep(projectId, 'finalize', 'completed', 'プロジェクト生成が完了しました')
        onProgress?.('完了', 100, 'completed')

        // 5. 完成したプロジェクトとログを取得
        const { data: finalProject, error: fetchError } = await supabase
          .from('projects')
          .select(`
            *,
            generation_logs(*)
          `)
          .eq('id', projectId)
          .single()

        if (fetchError) throw fetchError

        return {
          success: true,
          data: finalProject,
          message: 'プロジェクトの生成が完了しました'
        }

      } catch (generationError: any) {
        // エラー時にプロジェクトステータスを更新
        await supabase
          .from('projects')
          .update({ status: 'error' })
          .eq('id', projectId)

        await this.logGenerationStep(projectId, 'finalize', 'failed', 
          `生成エラー: ${generationError.message}`, { error: generationError.message })

        onProgress?.('エラー発生', 0, 'failed')
        throw generationError
      }

    } catch (error: any) {
      console.error('Project generation error:', error)
      return {
        success: false,
        error: error.message || 'プロジェクトの生成中にエラーが発生しました'
      }
    }
  }

  // 生成ステップのログ記録
  static async logGenerationStep(
    projectId: string,
    step: GenerationLog['step'],
    status: GenerationLog['status'],
    message: string,
    details?: any
  ): Promise<void> {
    const supabase = await this.createClient()

    const logData: any = {
      project_id: projectId,
      step,
      status,
      message,
      details: details || null
    }

    if (status === 'in_progress') {
      logData.started_at = new Date().toISOString()
    } else if (status === 'completed' || status === 'failed') {
      logData.completed_at = new Date().toISOString()
    }

    await supabase
      .from('generation_logs')
      .insert([logData])
  }

  // プロジェクトテンプレート取得
  static async getTemplates(): Promise<APIResponse<Template[]>> {
    const supabase = await this.createClient()

    try {
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data || []
      }
    } catch (error: any) {
      console.error('Get templates error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // システム設定取得
  static async getSystemConfig(configKey: string): Promise<APIResponse<any>> {
    const supabase = await this.createClient()

    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('config_value')
        .eq('config_key', configKey)
        .single()

      if (error) throw error

      return {
        success: true,
        data: data.config_value
      }
    } catch (error: any) {
      console.error('Get system config error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Initialize database instances
export const projectsDB = new ProjectsDB()
export const generationLogsDB = new GenerationLogsDB()
export const userPreferencesDB = new UserPreferencesDB()
export const templatesDB = new TemplatesDB()
export const projectGeneratorDB = ProjectGeneratorDB