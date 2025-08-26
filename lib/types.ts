export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: string
          features: string | null
          design_preferences: string | null
          tech_requirements: string | null
          status: 'draft' | 'generating' | 'completed' | 'error' | 'deployed'
          generated_code: any | null
          deployment_url: string | null
          repository_url: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
          deployed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: string
          features?: string | null
          design_preferences?: string | null
          tech_requirements?: string | null
          status?: 'draft' | 'generating' | 'completed' | 'error' | 'deployed'
          generated_code?: any | null
          deployment_url?: string | null
          repository_url?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          deployed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          features?: string | null
          design_preferences?: string | null
          tech_requirements?: string | null
          status?: 'draft' | 'generating' | 'completed' | 'error' | 'deployed'
          generated_code?: any | null
          deployment_url?: string | null
          repository_url?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          deployed_at?: string | null
        }
      }
      generation_logs: {
        Row: {
          id: string
          project_id: string
          step: string
          status: 'pending' | 'processing' | 'completed' | 'error'
          message: string | null
          details: any | null
          started_at: string
          completed_at: string | null
          error_message: string | null
        }
        Insert: {
          id?: string
          project_id: string
          step: string
          status: 'pending' | 'processing' | 'completed' | 'error'
          message?: string | null
          details?: any | null
          started_at?: string
          completed_at?: string | null
          error_message?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          step?: string
          status?: 'pending' | 'processing' | 'completed' | 'error'
          message?: string | null
          details?: any | null
          started_at?: string
          completed_at?: string | null
          error_message?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preferred_tech_stack: any
          default_deployment_platform: string
          adhd_settings: any
          notification_preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_tech_stack?: any
          default_deployment_platform?: string
          adhd_settings?: any
          notification_preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_tech_stack?: any
          default_deployment_platform?: string
          adhd_settings?: any
          notification_preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      user_usage: {
        Row: {
          id: string
          user_id: string
          month: string
          projects_created: number
          projects_deployed: number
          api_calls: number
          generation_time_seconds: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          projects_created?: number
          projects_deployed?: number
          api_calls?: number
          generation_time_seconds?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          projects_created?: number
          projects_deployed?: number
          api_calls?: number
          generation_time_seconds?: number
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          category: string
          description: string
          template_config: any
          code_template: any
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description: string
          template_config: any
          code_template: any
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string
          template_config?: any
          code_template?: any
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Project related types
export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  category: ProjectCategory
  features?: string
  design_preferences?: string
  tech_requirements?: string
  status: ProjectStatus
  generated_code?: GeneratedCode
  deployment_url?: string
  repository_url?: string
  created_at: string
  updated_at: string
  completed_at?: string
  deployed_at?: string
}

export interface CreateProjectData {
  title: string
  description: string
  category: ProjectCategory
  features?: string
  design_preferences?: string
  tech_requirements?: string
}

export type ProjectCategory = 'crm' | 'cms' | 'todo' | 'inventory' | 'form' | 'other'

export type ProjectStatus = 'draft' | 'generating' | 'completed' | 'error' | 'deployed'

export interface GeneratedCode {
  components: string[]
  pages: string[]
  api_routes: string[]
  database_schema: string
  package_json: any
  deployment_config: any
  file_structure: FileStructure[]
}

export interface FileStructure {
  path: string
  content: string
  type: 'file' | 'directory'
}

// Generation related types
export interface GenerationLog {
  id: string
  project_id: string
  step: GenerationStep
  status: GenerationStatus
  message?: string
  details?: any
  started_at: string
  completed_at?: string
  error_message?: string
}

export type GenerationStep = 
  | 'analysis' 
  | 'planning' 
  | 'database_design' 
  | 'component_generation' 
  | 'api_generation' 
  | 'styling' 
  | 'testing' 
  | 'deployment_prep' 
  | 'completed'

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'error'

// User preferences types
export interface UserPreferences {
  id: string
  user_id: string
  preferred_tech_stack: TechStack
  default_deployment_platform: DeploymentPlatform
  adhd_settings: ADHDSettings
  notification_preferences: NotificationPreferences
  created_at: string
  updated_at: string
}

export interface TechStack {
  frontend: 'react' | 'vue' | 'angular' | 'svelte'
  backend: 'nextjs' | 'express' | 'nestjs' | 'fastify'
  database: 'supabase' | 'postgresql' | 'mysql' | 'mongodb'
  styling: 'tailwindcss' | 'styled-components' | 'css-modules' | 'sass'
}

export type DeploymentPlatform = 'vercel' | 'netlify' | 'railway' | 'render'

export interface ADHDSettings {
  focus_session_length: number
  break_length: number
  visual_progress: boolean
  auto_save: boolean
}

export interface NotificationPreferences {
  email: boolean
  in_app: boolean
  generation_complete: boolean
  deployment_ready: boolean
}

// User usage types
export interface UserUsage {
  id: string
  user_id: string
  month: string
  projects_created: number
  projects_deployed: number
  api_calls: number
  generation_time_seconds: number
  created_at: string
  updated_at: string
}

// Template types
export interface Template {
  id: string
  name: string
  category: ProjectCategory
  description: string
  template_config: TemplateConfig
  code_template: CodeTemplate
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface TemplateConfig {
  features: string[]
  database_tables: string[]
  required_apis?: string[]
  complexity_level?: 'simple' | 'medium' | 'complex'
}

export interface CodeTemplate {
  components: string[]
  api_routes: string[]
  database_schema?: string
  styling_approach?: string
}

// Form data types for project creation
export interface ProjectFormData {
  title: string
  description: string
  category: ProjectCategory
  features: string
  design_preferences: string
  tech_requirements: string
}

// API response types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

// Claude API types
export interface ClaudeRequest {
  prompt: string
  project_data: CreateProjectData
  template?: Template
  user_preferences?: UserPreferences
}

export interface ClaudeResponse {
  analysis: ProjectAnalysis
  generated_code: GeneratedCode
  deployment_instructions: DeploymentInstructions
  estimated_completion_time: number
}

export interface ProjectAnalysis {
  complexity_score: number
  recommended_features: string[]
  tech_stack_suggestions: TechStack
  estimated_development_time: number
  potential_challenges: string[]
}

export interface DeploymentInstructions {
  platform: DeploymentPlatform
  environment_variables: Record<string, string>
  build_commands: string[]
  deployment_steps: string[]
}