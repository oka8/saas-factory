-- =========================================
-- SaaS Factory Database Schema
-- =========================================
-- This migration creates the core tables for the SaaS Factory application
-- including users, projects, generation logs, templates, and deployments

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- ENUM TYPES
-- =========================================

-- Project status enum
CREATE TYPE project_status AS ENUM (
    'draft',
    'generating',
    'completed',
    'deployed',
    'error'
);

-- Generation step enum
CREATE TYPE generation_step AS ENUM (
    'analyze',
    'design',
    'generate_code',
    'create_database',
    'setup_auth',
    'optimize',
    'test',
    'finalize'
);

-- Generation status enum
CREATE TYPE generation_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'failed'
);

-- Deployment status enum
CREATE TYPE deployment_status AS ENUM (
    'pending',
    'building',
    'deploying',
    'live',
    'failed'
);

-- User role enum
CREATE TYPE user_role AS ENUM (
    'user',
    'premium',
    'admin'
);

-- =========================================
-- USERS TABLE (extends auth.users)
-- =========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    
    -- Subscription info
    stripe_customer_id TEXT,
    subscription_status TEXT,
    subscription_tier TEXT DEFAULT 'free',
    
    -- Usage limits
    projects_limit INTEGER DEFAULT 3,
    projects_created INTEGER DEFAULT 0,
    generations_limit INTEGER DEFAULT 10,
    generations_used INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- PROJECTS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Project info
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    features TEXT,
    design_preferences TEXT,
    tech_requirements TEXT,
    
    -- Status tracking
    status project_status DEFAULT 'draft',
    
    -- Generated content
    generated_code JSONB,
    file_structure JSONB,
    database_schema JSONB,
    
    -- External references
    github_repo_url TEXT,
    deployment_url TEXT,
    vercel_project_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    deployed_at TIMESTAMPTZ,
    
    -- Indexing
    CONSTRAINT unique_user_project_title UNIQUE(user_id, title)
);

-- =========================================
-- GENERATION LOGS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Step tracking
    step generation_step NOT NULL,
    status generation_status NOT NULL DEFAULT 'pending',
    
    -- Progress tracking
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Log details
    message TEXT,
    details JSONB,
    error_message TEXT,
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- PROJECT TEMPLATES TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.project_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template info
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    
    -- Template content
    base_structure JSONB NOT NULL,
    default_features JSONB,
    tech_stack JSONB NOT NULL,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- DEPLOYMENTS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Deployment info
    environment TEXT DEFAULT 'production',
    status deployment_status DEFAULT 'pending',
    
    -- Provider info
    provider TEXT DEFAULT 'vercel',
    deployment_id TEXT,
    deployment_url TEXT,
    
    -- Build info
    build_logs TEXT,
    error_logs TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deployed_at TIMESTAMPTZ,
    
    -- Ensure one active deployment per project
    CONSTRAINT unique_active_deployment UNIQUE(project_id, environment)
);

-- =========================================
-- API KEYS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Key info
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    last_four TEXT NOT NULL,
    
    -- Permissions
    permissions JSONB DEFAULT '{"read": true, "write": true}',
    
    -- Usage tracking
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_key_name UNIQUE(user_id, name)
);

-- =========================================
-- USAGE METRICS TABLE
-- =========================================
CREATE TABLE IF NOT EXISTS public.usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Metric info
    metric_type TEXT NOT NULL,
    metric_value INTEGER NOT NULL,
    
    -- Context
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    
    -- Metadata
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexing for time-series queries
    INDEX idx_usage_metrics_user_time (user_id, recorded_at DESC)
);

-- =========================================
-- INDEXES
-- =========================================

-- Projects indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);

-- Generation logs indexes
CREATE INDEX idx_generation_logs_project_id ON public.generation_logs(project_id);
CREATE INDEX idx_generation_logs_status ON public.generation_logs(status);
CREATE INDEX idx_generation_logs_created_at ON public.generation_logs(created_at DESC);

-- Deployments indexes
CREATE INDEX idx_deployments_project_id ON public.deployments(project_id);
CREATE INDEX idx_deployments_user_id ON public.deployments(user_id);
CREATE INDEX idx_deployments_status ON public.deployments(status);

-- API Keys indexes
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_is_active ON public.api_keys(is_active);

-- =========================================
-- TRIGGERS
-- =========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_templates_updated_at BEFORE UPDATE ON public.project_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- FUNCTIONS
-- =========================================

-- Function to create a new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment project count
CREATE OR REPLACE FUNCTION public.increment_project_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET projects_created = projects_created + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for project creation
CREATE TRIGGER on_project_created
    AFTER INSERT ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.increment_project_count();

-- Function to decrement project count
CREATE OR REPLACE FUNCTION public.decrement_project_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET projects_created = GREATEST(0, projects_created - 1)
    WHERE id = OLD.user_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger for project deletion
CREATE TRIGGER on_project_deleted
    AFTER DELETE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.decrement_project_count();

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Generation logs policies
CREATE POLICY "Users can view logs for own projects" ON public.generation_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generation_logs.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create logs for own projects" ON public.generation_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = generation_logs.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Project templates policies (read-only for users)
CREATE POLICY "Anyone can view active templates" ON public.project_templates
    FOR SELECT USING (is_active = true);

-- Deployments policies
CREATE POLICY "Users can view own deployments" ON public.deployments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create deployments for own projects" ON public.deployments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deployments" ON public.deployments
    FOR UPDATE USING (auth.uid() = user_id);

-- API Keys policies
CREATE POLICY "Users can view own API keys" ON public.api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON public.api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON public.api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Usage metrics policies
CREATE POLICY "Users can view own metrics" ON public.usage_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own metrics" ON public.usage_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================
-- INITIAL DATA
-- =========================================

-- Insert default project templates
INSERT INTO public.project_templates (name, description, category, base_structure, tech_stack) VALUES
('CRM Starter', 'Customer Relationship Management システムのテンプレート', 'crm', 
    '{"folders": ["components", "pages", "api", "lib", "styles"], "files": ["package.json", "tsconfig.json", "next.config.js"]}',
    '{"frontend": "Next.js", "backend": "Node.js", "database": "PostgreSQL", "auth": "Supabase Auth"}'),

('Todo App', 'タスク管理アプリケーションのテンプレート', 'todo',
    '{"folders": ["src", "components", "hooks", "utils", "types"], "files": ["package.json", "tsconfig.json", "vite.config.ts"]}',
    '{"frontend": "React + TypeScript", "styling": "Tailwind CSS", "state": "Zustand", "database": "Supabase"}'),

('CMS Platform', 'コンテンツ管理システムのテンプレート', 'cms',
    '{"folders": ["app", "components", "content", "public", "styles"], "files": ["package.json", "contentlayer.config.js"]}',
    '{"frontend": "Next.js 14", "content": "MDX", "database": "PostgreSQL", "auth": "NextAuth.js"}'),

('E-Commerce', 'ECサイトのテンプレート', 'ecommerce',
    '{"folders": ["app", "components", "lib", "hooks", "types"], "files": ["package.json", "prisma/schema.prisma"]}',
    '{"frontend": "Next.js", "payment": "Stripe", "database": "PostgreSQL", "orm": "Prisma"}');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;