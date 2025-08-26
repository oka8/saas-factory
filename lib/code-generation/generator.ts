import { Project } from '@/lib/types'

export interface GeneratedFile {
  path: string
  content: string
  type: 'file'
}

export interface GenerationResult {
  files: GeneratedFile[]
  packageJson: any
  databaseSchema?: string
  components: string[]
  pages: string[]
  apiRoutes: string[]
}

// プロジェクトタイプに応じた基本構造を生成
export function generateProjectStructure(project: Partial<Project>): GenerationResult {
  const { title, description, category, features, tech_requirements } = project
  
  const result: GenerationResult = {
    files: [],
    packageJson: generatePackageJson(title || 'my-app', tech_requirements),
    databaseSchema: '',
    components: [],
    pages: [],
    apiRoutes: []
  }

  // カテゴリに応じた生成
  switch (category) {
    case 'crm':
      return generateCRMProject(project, result)
    case 'cms':
      return generateCMSProject(project, result)
    case 'todo':
      return generateTodoProject(project, result)
    case 'ecommerce':
      return generateEcommerceProject(project, result)
    default:
      return generateGenericProject(project, result)
  }
}

function generatePackageJson(name: string, techRequirements?: string) {
  return {
    name: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint'
    },
    dependencies: {
      'next': '^14.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'typescript': '^5.0.0',
      '@types/react': '^18.2.0',
      '@types/node': '^20.0.0',
      'tailwindcss': '^3.3.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0'
    },
    devDependencies: {
      'eslint': '^8.0.0',
      'eslint-config-next': '^14.0.0'
    }
  }
}

function generateCRMProject(project: Partial<Project>, result: GenerationResult): GenerationResult {
  // CRM専用のコンポーネント
  result.components = ['CustomerList', 'CustomerForm', 'Dashboard', 'Analytics']
  result.pages = ['顧客管理', 'ダッシュボード', 'レポート', '設定']
  result.apiRoutes = ['/api/customers', '/api/reports', '/api/analytics']
  
  // データベーススキーマ
  result.databaseSchema = `
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  company VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  type VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`

  // 基本的なファイル構造
  result.files.push({
    path: 'app/page.tsx',
    type: 'file',
    content: `export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">CRM Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">総顧客数</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">今月の新規顧客</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">アクティブ案件</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  )
}`
  })

  result.files.push({
    path: 'components/CustomerList.tsx',
    type: 'file',
    content: `'use client'

import { useState } from 'react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: string
}

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([])
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">顧客一覧</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名前</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">メール</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">会社</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  顧客データがありません
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-6 py-4">{customer.name}</td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4">{customer.company}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}`
  })

  return result
}

function generateCMSProject(project: Partial<Project>, result: GenerationResult): GenerationResult {
  result.components = ['ArticleList', 'ArticleEditor', 'CategoryManager', 'MediaLibrary']
  result.pages = ['記事管理', 'カテゴリ', 'メディア', '設定']
  result.apiRoutes = ['/api/articles', '/api/categories', '/api/media']
  
  result.databaseSchema = `
CREATE TABLE articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);
`

  // CMS用のファイル生成
  result.files.push({
    path: 'app/articles/page.tsx',
    type: 'file',
    content: `export default function ArticlesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">記事管理</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>記事一覧がここに表示されます</p>
      </div>
    </div>
  )
}`
  })

  return result
}

function generateTodoProject(project: Partial<Project>, result: GenerationResult): GenerationResult {
  result.components = ['TodoList', 'TodoItem', 'TodoForm', 'FilterBar']
  result.pages = ['タスク一覧', 'カレンダー', '統計']
  result.apiRoutes = ['/api/todos', '/api/stats']
  
  result.databaseSchema = `
CREATE TABLE todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`

  result.files.push({
    path: 'components/TodoList.tsx',
    type: 'file',
    content: `'use client'

import { useState } from 'react'

interface Todo {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  
  const addTodo = () => {
    if (!newTodo.trim()) return
    
    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo,
      completed: false,
      priority: 'medium'
    }
    
    setTodos([...todos, todo])
    setNewTodo('')
  }
  
  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="新しいタスクを入力..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          追加
        </button>
      </div>
      
      <div className="space-y-2">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="w-5 h-5"
            />
            <span className={todo.completed ? 'line-through text-gray-500' : ''}>
              {todo.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}`
  })

  return result
}

function generateEcommerceProject(project: Partial<Project>, result: GenerationResult): GenerationResult {
  result.components = ['ProductList', 'ProductCard', 'Cart', 'Checkout']
  result.pages = ['商品一覧', 'カート', 'チェックアウト', '注文履歴']
  result.apiRoutes = ['/api/products', '/api/cart', '/api/orders']
  
  result.databaseSchema = `
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`

  return result
}

function generateGenericProject(project: Partial<Project>, result: GenerationResult): GenerationResult {
  // 汎用的なプロジェクト構造
  result.components = ['Header', 'Footer', 'Dashboard', 'DataTable']
  result.pages = ['ホーム', 'ダッシュボード', '設定']
  result.apiRoutes = ['/api/data', '/api/settings']
  
  result.files.push({
    path: 'app/layout.tsx',
    type: 'file',
    content: `import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}`
  })

  return result
}