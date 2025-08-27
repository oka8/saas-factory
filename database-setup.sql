-- SaaS Factory データベーススキーマ
-- Supabase用のテーブル作成スクリプト

-- プロジェクトテーブル
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'other',
    features TEXT,
    design_preferences TEXT,
    tech_requirements TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'deployed', 'error')),
    generated_code JSONB,
    deployment_url TEXT,
    repository_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    deployed_at TIMESTAMP WITH TIME ZONE
);

-- 生成ログテーブル
CREATE TABLE IF NOT EXISTS generation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    step TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    message TEXT,
    details JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- プロジェクトお気に入りテーブル
CREATE TABLE IF NOT EXISTS project_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- プロジェクトテンプレートテーブル
CREATE TABLE IF NOT EXISTS project_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT[],
    project_id UUID REFERENCES projects(id),
    features TEXT,
    design_preferences TEXT,
    tech_requirements TEXT,
    difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    estimated_time TEXT,
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_by UUID NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プロジェクトカテゴリテーブル
CREATE TABLE IF NOT EXISTS project_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6B7280',
    is_system BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザー設定テーブル
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    preferred_tech_stack JSONB,
    default_deployment_platform TEXT DEFAULT 'vercel',
    adhd_settings JSONB,
    notification_preferences JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザー使用統計テーブル
CREATE TABLE IF NOT EXISTS user_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    projects_created INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    projects_deployed INTEGER DEFAULT 0,
    api_calls_made INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プロジェクトアクティビティテーブル（分析用）
CREATE TABLE IF NOT EXISTS project_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_generation_logs_project_id ON generation_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_favorites_user_id ON project_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_project_templates_category ON project_templates(category);
CREATE INDEX IF NOT EXISTS idx_project_templates_is_public ON project_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_project_activity_user_id ON project_activity(user_id);

-- RLSポリシーの設定（行レベルセキュリティ）
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity ENABLE ROW LEVEL SECURITY;

-- プロジェクトのRLSポリシー
CREATE POLICY "Users can view their own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);

-- 生成ログのRLSポリシー
CREATE POLICY "Users can view logs of their own projects"
ON generation_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = generation_logs.project_id 
        AND projects.user_id = auth.uid()
    )
);

CREATE POLICY "System can create generation logs"
ON generation_logs FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = generation_logs.project_id 
        AND projects.user_id = auth.uid()
    )
);

-- お気に入りのRLSポリシー
CREATE POLICY "Users can manage their own favorites"
ON project_favorites FOR ALL
USING (auth.uid() = user_id);

-- ユーザー設定のRLSポリシー
CREATE POLICY "Users can manage their own preferences"
ON user_preferences FOR ALL
USING (auth.uid() = user_id);

-- ユーザー使用統計のRLSポリシー
CREATE POLICY "Users can view their own usage stats"
ON user_usage FOR ALL
USING (auth.uid() = user_id);

-- プロジェクトアクティビティのRLSポリシー
CREATE POLICY "Users can view their own activity"
ON project_activity FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create activity logs"
ON project_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- デフォルトカテゴリの挿入
INSERT INTO project_categories (id, name, description, color, is_system) VALUES
('crm', 'CRM・顧客管理', '顧客情報、営業管理', '#3B82F6', true),
('cms', 'CMS・コンテンツ管理', 'ブログ、記事管理', '#10B981', true),
('todo', 'タスク管理', 'TODO、プロジェクト管理', '#F59E0B', true),
('inventory', '在庫管理', '商品、在庫追跡', '#8B5CF6', true),
('form', 'フォーム・アンケート', 'データ収集、調査', '#EF4444', true),
('e-commerce', 'Eコマース', 'オンラインストア、決済', '#06B6D4', true),
('dashboard', 'ダッシュボード', 'データ可視化、分析', '#84CC16', true),
('landing-page', 'ランディングページ', 'マーケティング、LP', '#F97316', true),
('blog', 'ブログ', '記事投稿、コンテンツ', '#6366F1', true),
('portfolio', 'ポートフォリオ', '作品展示、個人サイト', '#EC4899', true),
('other', 'その他', 'カスタムアプリケーション', '#6B7280', true)
ON CONFLICT (id) DO NOTHING;