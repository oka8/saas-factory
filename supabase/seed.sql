-- =========================================
-- Seed Data for SaaS Factory Development
-- =========================================

-- Create a test user (password: testpassword123)
-- Note: In production, users are created through auth.users automatically
-- This is only for local development

-- Insert additional templates for testing
INSERT INTO public.project_templates (name, description, category, base_structure, tech_stack) 
VALUES 
(
    'Inventory Manager',
    '在庫管理システムのテンプレート',
    'inventory',
    '{"folders": ["app", "components", "lib", "prisma", "public"], "files": ["package.json", "docker-compose.yml"]}',
    '{"frontend": "Next.js", "backend": "tRPC", "database": "PostgreSQL", "cache": "Redis"}'
),
(
    'Survey Builder',
    'アンケート・フォーム作成システムのテンプレート', 
    'form',
    '{"folders": ["src", "components", "api", "utils", "types"], "files": ["package.json", "vercel.json"]}',
    '{"frontend": "React", "backend": "Express", "database": "MongoDB", "hosting": "Vercel"}'
),
(
    'Analytics Dashboard',
    '分析ダッシュボードのテンプレート',
    'analytics',
    '{"folders": ["app", "components", "charts", "data", "utils"], "files": ["package.json", "tailwind.config.js"]}',
    '{"frontend": "Next.js", "charts": "Recharts", "database": "PostgreSQL", "analytics": "Mixpanel"}'
),
(
    'Blog Platform',
    'ブログプラットフォームのテンプレート',
    'blog',
    '{"folders": ["app", "components", "content", "public", "styles"], "files": ["package.json", "next.config.js"]}',
    '{"frontend": "Next.js", "content": "Contentlayer", "database": "PostgreSQL", "cdn": "Cloudflare"}'
),
(
    'Chat Application',
    'リアルタイムチャットアプリのテンプレート',
    'chat',
    '{"folders": ["src", "components", "hooks", "services", "types"], "files": ["package.json", "socket.config.js"]}',
    '{"frontend": "React", "realtime": "Socket.io", "database": "PostgreSQL", "cache": "Redis"}'
),
(
    'Learning Management',
    '学習管理システムのテンプレート',
    'lms',
    '{"folders": ["app", "components", "courses", "lib", "public"], "files": ["package.json", "prisma/schema.prisma"]}',
    '{"frontend": "Next.js", "video": "Mux", "database": "PostgreSQL", "payments": "Stripe"}'
);

-- Update template usage counts for demo purposes
UPDATE public.project_templates 
SET usage_count = FLOOR(RANDOM() * 100 + 1)
WHERE name IN ('CRM Starter', 'Todo App', 'CMS Platform', 'E-Commerce');

-- Create sample generation patterns for testing
CREATE TABLE IF NOT EXISTS public.generation_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_name TEXT NOT NULL,
    pattern_type TEXT NOT NULL,
    pattern_content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.generation_patterns (pattern_name, pattern_type, pattern_content)
VALUES
(
    'React Component',
    'component',
    '{
        "imports": ["import React from \"react\";"],
        "props": ["interface Props {}", "children?: React.ReactNode"],
        "hooks": ["useState", "useEffect"],
        "structure": "functional"
    }'::jsonb
),
(
    'API Endpoint',
    'api',
    '{
        "method": ["GET", "POST", "PUT", "DELETE"],
        "auth": "required",
        "validation": true,
        "errorHandling": true
    }'::jsonb
),
(
    'Database Model',
    'model',
    '{
        "orm": "prisma",
        "fields": ["id", "createdAt", "updatedAt"],
        "relations": true,
        "indexes": true
    }'::jsonb
);

-- Add sample prompt templates for AI generation
CREATE TABLE IF NOT EXISTS public.prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL,
    prompt_content TEXT NOT NULL,
    variables JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.prompt_templates (template_name, template_type, prompt_content, variables)
VALUES
(
    'Project Generator',
    'main',
    'Create a complete {category} application with the following requirements: {description}. Include features: {features}. Use tech stack: {tech_stack}.',
    '["category", "description", "features", "tech_stack"]'::jsonb
),
(
    'Component Generator',
    'component',
    'Generate a React component named {name} that {functionality}. Use TypeScript and include proper types.',
    '["name", "functionality"]'::jsonb
),
(
    'API Generator',
    'api',
    'Create a REST API endpoint for {resource} that supports {operations}. Include authentication and validation.',
    '["resource", "operations"]'::jsonb
);

-- Create development configuration
CREATE TABLE IF NOT EXISTS public.system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key TEXT UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.system_config (config_key, config_value)
VALUES
(
    'generation_limits',
    '{
        "free": {"projects": 3, "generations_per_day": 5},
        "premium": {"projects": 20, "generations_per_day": 50},
        "enterprise": {"projects": -1, "generations_per_day": -1}
    }'::jsonb
),
(
    'ai_models',
    '{
        "default": "claude-3-opus",
        "available": ["claude-3-opus", "claude-3-sonnet", "gpt-4"],
        "fallback": "claude-3-sonnet"
    }'::jsonb
),
(
    'deployment_providers',
    '{
        "default": "vercel",
        "available": ["vercel", "netlify", "aws", "gcp"],
        "regions": ["us-east-1", "us-west-2", "eu-west-1", "ap-northeast-1"]
    }'::jsonb
);

-- Add feature flags for development
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name TEXT UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.feature_flags (flag_name, is_enabled, rollout_percentage, description)
VALUES
('ai_generation_v2', true, 100, 'New AI generation engine with improved accuracy'),
('github_integration', true, 50, 'Direct GitHub repository creation and management'),
('collaborative_editing', false, 0, 'Real-time collaborative project editing'),
('custom_templates', true, 75, 'Allow users to create custom project templates'),
('advanced_analytics', false, 0, 'Advanced usage analytics and insights'),
('stripe_payments', false, 0, 'Stripe payment integration for subscriptions');

-- Output seed completion message
DO $$
BEGIN
    RAISE NOTICE 'Seed data successfully inserted!';
    RAISE NOTICE 'Templates: % records', (SELECT COUNT(*) FROM public.project_templates);
    RAISE NOTICE 'Generation Patterns: % records', (SELECT COUNT(*) FROM public.generation_patterns);
    RAISE NOTICE 'Prompt Templates: % records', (SELECT COUNT(*) FROM public.prompt_templates);
    RAISE NOTICE 'System Config: % records', (SELECT COUNT(*) FROM public.system_config);
    RAISE NOTICE 'Feature Flags: % records', (SELECT COUNT(*) FROM public.feature_flags);
END $$;