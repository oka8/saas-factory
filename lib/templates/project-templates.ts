export interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: string
  complexity: 'simple' | 'medium' | 'complex'
  techStack: string[]
  features: string[]
  estimatedTime: string
  preview: string
  tags: string[]
  fileStructure: Record<string, any>
  sampleCode: Record<string, string>
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'todo-app',
    name: 'タスク管理アプリ',
    description: 'ユーザーがタスクを作成、編集、完了できるシンプルなタスク管理アプリケーション',
    category: 'Webアプリケーション',
    complexity: 'simple',
    techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase'],
    features: [
      'タスクの追加・編集・削除',
      'タスクの完了/未完了切り替え',
      '優先度設定',
      '期限設定',
      'カテゴリ分類',
      '検索・フィルター機能'
    ],
    estimatedTime: '2-3時間',
    preview: '📝 シンプルで直感的なタスク管理',
    tags: ['生産性', 'タスク管理', 'シンプル', 'レスポンシブ'],
    fileStructure: {
      'components/': {
        'TaskList.tsx': 'タスク一覧表示コンポーネント',
        'TaskItem.tsx': '個別タスクコンポーネント',
        'TaskForm.tsx': 'タスク作成・編集フォーム',
        'FilterBar.tsx': 'フィルター・検索バー'
      },
      'pages/': {
        'index.tsx': 'メインページ',
        'api/tasks.ts': 'タスクAPI'
      },
      'types/': {
        'task.ts': 'タスク型定義'
      },
      'utils/': {
        'taskHelpers.ts': 'タスク関連ユーティリティ'
      }
    },
    sampleCode: {
      'components/TaskItem.tsx': `interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
}

export const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <input 
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <span className={task.completed ? 'line-through' : ''}>
        {task.title}
      </span>
    </div>
  )
}`
    }
  },
  {
    id: 'ecommerce-store',
    name: 'Eコマースストア',
    description: '商品管理、ショッピングカート、決済機能を含む本格的なEコマースプラットフォーム',
    category: 'eコマース',
    complexity: 'complex',
    techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
    features: [
      '商品カタログ表示',
      'ショッピングカート機能',
      'ユーザー認証・登録',
      'Stripe決済統合',
      '注文履歴',
      '商品検索・フィルター',
      '管理者ダッシュボード',
      '在庫管理',
      'レビュー・評価システム'
    ],
    estimatedTime: '1-2週間',
    preview: '🛒 フル機能のオンラインストア',
    tags: ['eコマース', '決済', 'フルスタック', '商品管理'],
    fileStructure: {
      'components/': {
        'ProductCard.tsx': '商品カードコンポーネント',
        'ShoppingCart.tsx': 'ショッピングカート',
        'CheckoutForm.tsx': '決済フォーム',
        'admin/': {
          'ProductManager.tsx': '商品管理画面',
          'OrderManager.tsx': '注文管理画面'
        }
      },
      'pages/': {
        'products/[id].tsx': '商品詳細ページ',
        'cart.tsx': 'カートページ',
        'checkout.tsx': '決済ページ',
        'admin/': {
          'dashboard.tsx': '管理画面'
        }
      },
      'lib/': {
        'stripe.ts': 'Stripe設定',
        'database.ts': 'データベース操作'
      }
    },
    sampleCode: {
      'components/ProductCard.tsx': `interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <img src={product.image} alt={product.name} />
      <div className="p-4">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-gray-600">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold">¥{product.price.toLocaleString()}</span>
          <button onClick={() => onAddToCart(product)}>
            カートに追加
          </button>
        </div>
      </div>
    </div>
  )
}`
    }
  },
  {
    id: 'blog-cms',
    name: 'ブログCMS',
    description: 'マークダウンエディター、カテゴリ管理、SEO対応を含むブログ管理システム',
    category: 'コンテンツ管理',
    complexity: 'medium',
    techStack: ['Next.js', 'TypeScript', 'MDX', 'Prisma', 'PostgreSQL'],
    features: [
      'マークダウンエディター',
      '記事の作成・編集・公開',
      'カテゴリ・タグ管理',
      'SEOメタデータ設定',
      'コメントシステム',
      '記事検索機能',
      '画像アップロード',
      'RSS/Sitemap生成',
      '下書き機能'
    ],
    estimatedTime: '5-7日',
    preview: '📖 プロフェッショナルなブログ',
    tags: ['CMS', 'ブログ', 'マークダウン', 'SEO'],
    fileStructure: {
      'components/': {
        'MarkdownEditor.tsx': 'マークダウンエディター',
        'ArticleCard.tsx': '記事カードコンポーネント',
        'CategoryFilter.tsx': 'カテゴリフィルター'
      },
      'pages/': {
        'blog/[slug].tsx': '記事詳細ページ',
        'admin/articles.tsx': '記事管理ページ'
      },
      'lib/': {
        'markdown.ts': 'マークダウン処理',
        'seo.ts': 'SEO関連ユーティリティ'
      }
    },
    sampleCode: {
      'components/MarkdownEditor.tsx': `import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

export const MarkdownEditor = ({ value, onChange }: EditorProps) => {
  const [previewMode, setPreviewMode] = useState(false)
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-96 p-4 border rounded"
          placeholder="マークダウンで記事を書く..."
        />
      </div>
      <div className="border rounded p-4">
        <ReactMarkdown>{value}</ReactMarkdown>
      </div>
    </div>
  )
}`
    }
  },
  {
    id: 'dashboard-analytics',
    name: 'アナリティクスダッシュボード',
    description: 'データ可視化とレポート機能を持つビジネスアナリティクスダッシュボード',
    category: 'データ分析',
    complexity: 'complex',
    techStack: ['React', 'Next.js', 'Chart.js', 'TypeScript', 'PostgreSQL'],
    features: [
      'リアルタイムデータ表示',
      'インタラクティブなチャート',
      'カスタムレポート生成',
      'データフィルター・期間選択',
      'CSV/PDFエクスポート',
      'ダッシュボードのカスタマイズ',
      'アラート・通知機能',
      'ユーザー権限管理'
    ],
    estimatedTime: '1-2週間',
    preview: '📊 データ駆動の意思決定支援',
    tags: ['アナリティクス', 'データ可視化', 'レポート', 'BI'],
    fileStructure: {
      'components/': {
        'charts/': {
          'LineChart.tsx': '線グラフコンポーネント',
          'BarChart.tsx': '棒グラフコンポーネント',
          'PieChart.tsx': '円グラフコンポーネント'
        },
        'Dashboard.tsx': 'メインダッシュボード',
        'ReportBuilder.tsx': 'レポート作成機能'
      },
      'lib/': {
        'analytics.ts': 'アナリティクス処理',
        'chartUtils.ts': 'チャート関連ユーティリティ'
      }
    },
    sampleCode: {
      'components/charts/LineChart.tsx': `import { Line } from 'react-chartjs-2'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

export const LineChart = ({ data, title }: LineChartProps) => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: title }
    }
  }
  
  return <Line data={data} options={options} />
}`
    }
  },
  {
    id: 'chat-app',
    name: 'リアルタイムチャットアプリ',
    description: 'WebSocketを使用したリアルタイムメッセージング機能を持つチャットアプリケーション',
    category: 'コミュニケーション',
    complexity: 'medium',
    techStack: ['React', 'Node.js', 'Socket.io', 'Express', 'MongoDB'],
    features: [
      'リアルタイムメッセージング',
      'ルーム・チャンネル機能',
      'ファイル共有',
      'オンライン状態表示',
      'メッセージ履歴',
      'プライベートメッセージ',
      '絵文字サポート',
      'プッシュ通知'
    ],
    estimatedTime: '4-6日',
    preview: '💬 リアルタイムコミュニケーション',
    tags: ['チャット', 'リアルタイム', 'WebSocket', 'メッセージング'],
    fileStructure: {
      'components/': {
        'ChatWindow.tsx': 'チャット画面',
        'MessageInput.tsx': 'メッセージ入力',
        'UserList.tsx': 'ユーザー一覧',
        'RoomList.tsx': 'ルーム一覧'
      },
      'server/': {
        'socket.js': 'Socket.io設定',
        'routes/': {
          'messages.js': 'メッセージAPI'
        }
      }
    },
    sampleCode: {
      'components/ChatWindow.tsx': `import { useSocket } from '../hooks/useSocket'

export const ChatWindow = ({ roomId }: ChatWindowProps) => {
  const { messages, sendMessage, isConnected } = useSocket(roomId)
  const [newMessage, setNewMessage] = useState('')
  
  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage)
      setNewMessage('')
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <div key={message.id} className="mb-2">
            <strong>{message.user}: </strong>
            {message.text}
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="メッセージを入力..."
        />
        <button onClick={handleSend}>送信</button>
      </div>
    </div>
  )
}`
    }
  }
]

export const getTemplateById = (id: string): ProjectTemplate | undefined => {
  return PROJECT_TEMPLATES.find(template => template.id === id)
}

export const getTemplatesByCategory = (category: string): ProjectTemplate[] => {
  return PROJECT_TEMPLATES.filter(template => template.category === category)
}

export const getTemplatesByComplexity = (complexity: 'simple' | 'medium' | 'complex'): ProjectTemplate[] => {
  return PROJECT_TEMPLATES.filter(template => template.complexity === complexity)
}

export const getTemplatesByTechStack = (techStack: string[]): ProjectTemplate[] => {
  return PROJECT_TEMPLATES.filter(template => 
    techStack.some(tech => template.techStack.includes(tech))
  )
}

export const getAllCategories = (): string[] => {
  return [...new Set(PROJECT_TEMPLATES.map(template => template.category))]
}

export const getAllTechStacks = (): string[] => {
  const allTechStacks = PROJECT_TEMPLATES.flatMap(template => template.techStack)
  return [...new Set(allTechStacks)]
}