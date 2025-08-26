-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  features TEXT,
  design_preferences TEXT,
  tech_requirements TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'error', 'deployed')),
  generated_code JSONB,
  deployment_url TEXT,
  repository_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  deployed_at TIMESTAMP WITH TIME ZONE
);

-- Project generation logs
CREATE TABLE IF NOT EXISTS generation_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  step VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  message TEXT,
  details JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferred_tech_stack JSONB DEFAULT '{"frontend": "react", "backend": "nextjs", "database": "supabase", "styling": "tailwindcss"}',
  default_deployment_platform VARCHAR(50) DEFAULT 'vercel',
  adhd_settings JSONB DEFAULT '{"focus_session_length": 25, "break_length": 5, "visual_progress": true, "auto_save": true}',
  notification_preferences JSONB DEFAULT '{"email": true, "in_app": true, "generation_complete": true, "deployment_ready": true}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User usage stats
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL, -- First day of the month
  projects_created INTEGER DEFAULT 0,
  projects_deployed INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  generation_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Templates table for future expansion
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  template_config JSONB NOT NULL,
  code_template JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO templates (name, category, description, template_config, code_template) VALUES
('CRM Base', 'crm', '顧客管理システムの基本テンプレート', 
 '{"features": ["customer_list", "contact_history", "task_management"], "database_tables": ["customers", "contacts", "tasks"]}',
 '{"components": ["CustomerList", "CustomerForm", "ContactHistory"], "api_routes": ["/api/customers", "/api/contacts"]}'),

('CMS Blog', 'cms', 'ブログ・記事管理システム', 
 '{"features": ["post_management", "category_system", "user_roles"], "database_tables": ["posts", "categories", "comments"]}',
 '{"components": ["PostList", "PostEditor", "CategoryManager"], "api_routes": ["/api/posts", "/api/categories"]}'),

('Task Manager', 'todo', 'タスク・プロジェクト管理システム', 
 '{"features": ["task_lists", "due_dates", "priority_levels", "team_collaboration"], "database_tables": ["tasks", "projects", "teams"]}',
 '{"components": ["TaskBoard", "TaskForm", "ProjectView"], "api_routes": ["/api/tasks", "/api/projects"]}'),

('Inventory System', 'inventory', '在庫・商品管理システム', 
 '{"features": ["product_catalog", "stock_tracking", "order_management"], "database_tables": ["products", "inventory", "orders"]}',
 '{"components": ["ProductList", "InventoryTracker", "OrderManager"], "api_routes": ["/api/products", "/api/inventory"]}'),

('Form Builder', 'form', 'フォーム・アンケートシステム', 
 '{"features": ["form_builder", "response_collection", "data_analysis"], "database_tables": ["forms", "fields", "responses"]}',
 '{"components": ["FormBuilder", "FormRenderer", "ResponseAnalytics"], "api_routes": ["/api/forms", "/api/responses"]}');

-- Row Level Security Policies

-- Projects policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Generation logs policies
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for their projects" ON generation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = generation_logs.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert generation logs" ON generation_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update generation logs" ON generation_logs
  FOR UPDATE USING (true);

-- User preferences policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- User usage policies
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user usage" ON user_usage
  FOR ALL USING (true);

-- Templates policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates" ON templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Template creators can manage their templates" ON templates
  FOR ALL USING (auth.uid() = created_by);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at 
  BEFORE UPDATE ON user_usage 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON templates 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_project_id ON generation_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id_month ON user_usage(user_id, month);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);