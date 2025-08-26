export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
          status: 'draft' | 'generating' | 'completed' | 'deployed' | 'error'
          features: string | null
          design_preferences: string | null
          tech_requirements: string | null
          generated_code: Json | null
          created_at: string
          updated_at: string
          completed_at: string | null
          deployed_at: string | null
          deploy_url: string | null
          repository_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: string
          status?: 'draft' | 'generating' | 'completed' | 'deployed' | 'error'
          features?: string | null
          design_preferences?: string | null
          tech_requirements?: string | null
          generated_code?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          deployed_at?: string | null
          deploy_url?: string | null
          repository_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          status?: 'draft' | 'generating' | 'completed' | 'deployed' | 'error'
          features?: string | null
          design_preferences?: string | null
          tech_requirements?: string | null
          generated_code?: Json | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
          deployed_at?: string | null
          deploy_url?: string | null
          repository_url?: string | null
        }
      }
      generation_logs: {
        Row: {
          id: string
          project_id: string
          step: 'analyze' | 'generate_code' | 'optimize' | 'finalize'
          status: 'pending' | 'in_progress' | 'completed' | 'failed'
          message: string | null
          details: Json | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          step: 'analyze' | 'generate_code' | 'optimize' | 'finalize'
          status: 'pending' | 'in_progress' | 'completed' | 'failed'
          message?: string | null
          details?: Json | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          step?: 'analyze' | 'generate_code' | 'optimize' | 'finalize'
          status?: 'pending' | 'in_progress' | 'completed' | 'failed'
          message?: string | null
          details?: Json | null
          started_at?: string
          completed_at?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string
          language: string
          notifications_enabled: boolean
          email_updates: boolean
          default_framework: string | null
          preferred_styling: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          language?: string
          notifications_enabled?: boolean
          email_updates?: boolean
          default_framework?: string | null
          preferred_styling?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          language?: string
          notifications_enabled?: boolean
          email_updates?: boolean
          default_framework?: string | null
          preferred_styling?: string | null
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
          storage_used: number
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
          storage_used?: number
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
          storage_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          github_username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          github_username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          github_username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          config: Json
          preview_image: string | null
          is_active: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          config: Json
          preview_image?: string | null
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          config?: Json
          preview_image?: string | null
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      project_templates: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          tech_stack: string[]
          features: string[]
          complexity: 'beginner' | 'intermediate' | 'advanced'
          config: Json
          preview_image: string | null
          is_active: boolean
          usage_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          tech_stack: string[]
          features: string[]
          complexity: 'beginner' | 'intermediate' | 'advanced'
          config: Json
          preview_image?: string | null
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          tech_stack?: string[]
          features?: string[]
          complexity?: 'beginner' | 'intermediate' | 'advanced'
          config?: Json
          preview_image?: string | null
          is_active?: boolean
          usage_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      system_config: {
        Row: {
          id: string
          config_key: string
          config_value: Json
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          config_key: string
          config_value: Json
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          config_key?: string
          config_value?: Json
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: 'draft' | 'generating' | 'completed' | 'deployed' | 'error'
      generation_step: 'analyze' | 'generate_code' | 'optimize' | 'finalize'
      generation_status: 'pending' | 'in_progress' | 'completed' | 'failed'
      complexity_level: 'beginner' | 'intermediate' | 'advanced'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}