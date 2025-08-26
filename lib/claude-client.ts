import Anthropic from '@anthropic-ai/sdk'

// Claude APIクライアントのシングルトンインスタンス
class ClaudeClient {
  private static instance: ClaudeClient | null = null
  private client: Anthropic | null = null

  private constructor() {
    this.initializeClient()
  }

  public static getInstance(): ClaudeClient {
    if (!ClaudeClient.instance) {
      ClaudeClient.instance = new ClaudeClient()
    }
    return ClaudeClient.instance
  }

  private initializeClient() {
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY is not set. Claude API will not be available.')
      return
    }

    this.client = new Anthropic({
      apiKey: apiKey
    })
  }

  public getClient(): Anthropic | null {
    return this.client
  }

  public isAvailable(): boolean {
    return this.client !== null
  }
}

export const claudeClient = ClaudeClient.getInstance()

// Claude APIを使用してコード生成を行う関数
export async function generateProjectCode(projectData: {
  title: string
  description: string
  category: string
  features?: string
  design_preferences?: string
  tech_requirements?: string
}): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  const client = claudeClient.getClient()

  if (!client) {
    return {
      success: false,
      error: 'Claude API is not available. Please check your ANTHROPIC_API_KEY environment variable.'
    }
  }

  try {
    const prompt = buildProjectGenerationPrompt(projectData)
    
    const response = await client.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 8000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // レスポンスの処理
    const content = response.content[0]
    if (content.type === 'text') {
      const generatedContent = parseGeneratedContent(content.text)
      return {
        success: true,
        data: generatedContent
      }
    } else {
      return {
        success: false,
        error: 'Unexpected response format from Claude API'
      }
    }

  } catch (error: any) {
    console.error('Claude API error:', error)
    return {
      success: false,
      error: error.message || 'Failed to generate project code'
    }
  }
}

// プロジェクト生成用のプロンプトを構築
function buildProjectGenerationPrompt(projectData: {
  title: string
  description: string
  category: string
  features?: string
  design_preferences?: string
  tech_requirements?: string
}): string {
  const { title, description, category, features, design_preferences, tech_requirements } = projectData

  const basePrompt = `
あなたは経験豊富なフルスタック開発者です。以下の要件に基づいてモダンなSaaSアプリケーションの完全なプロジェクト構造とコードを生成してください。

## プロジェクト情報
- タイトル: ${title}
- 説明: ${description}
- カテゴリ: ${category}
${features ? `- 主要機能: ${features}` : ''}
${design_preferences ? `- デザイン要件: ${design_preferences}` : ''}
${tech_requirements ? `- 技術要件: ${tech_requirements}` : ''}

## 技術スタック
- フロントエンド: Next.js 15 + React 19 + TypeScript
- スタイリング: Tailwind CSS 4
- バックエンド: Next.js API Routes
- データベース: PostgreSQL (Supabase)
- 認証: Supabase Auth
- デプロイ: Vercel

## 生成要求
以下の形式でJSON構造として出力してください：

\`\`\`json
{
  "project_structure": {
    "folders": ["app", "components", "lib", "types"],
    "files": [
      {
        "path": "package.json",
        "content": "..."
      },
      {
        "path": "app/page.tsx",
        "content": "..."
      }
      // ... 他のファイル
    ]
  },
  "database_schema": {
    "tables": [
      {
        "name": "users",
        "columns": [
          {"name": "id", "type": "UUID", "primary": true},
          {"name": "email", "type": "TEXT", "unique": true}
        ]
      }
      // ... 他のテーブル
    ]
  },
  "api_endpoints": [
    {
      "path": "/api/users",
      "methods": ["GET", "POST"],
      "description": "ユーザー管理API"
    }
    // ... 他のエンドポイント
  ],
  "features": [
    {
      "name": "ユーザー認証",
      "status": "implemented",
      "files": ["app/auth/login/page.tsx"]
    }
    // ... 他の機能
  ]
}
\`\`\`

重要：
1. 実際に動作するコードを生成してください
2. TypeScriptの型安全性を確保してください
3. モダンなReactパターン（hooks、関数コンポーネント）を使用してください
4. レスポンシブデザインを考慮してください
5. エラーハンドリングを含めてください
6. セキュリティベストプラクティスに従ってください
`

  return basePrompt.trim()
}

// Claude APIからの応答を解析してプロジェクトデータに変換
function parseGeneratedContent(content: string): any {
  try {
    // JSONブロックを抽出
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      const parsedContent = JSON.parse(jsonMatch[1])
      
      // 追加の処理や検証をここで行う
      return {
        project_structure: parsedContent.project_structure || {},
        database_schema: parsedContent.database_schema || {},
        api_endpoints: parsedContent.api_endpoints || [],
        features: parsedContent.features || [],
        generated_at: new Date().toISOString(),
        version: '1.0.0'
      }
    } else {
      // JSONブロックが見つからない場合のフォールバック
      return {
        raw_content: content,
        project_structure: {
          folders: ['app', 'components', 'lib', 'types'],
          files: []
        },
        database_schema: { tables: [] },
        api_endpoints: [],
        features: [],
        generated_at: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  } catch (error) {
    console.error('Failed to parse generated content:', error)
    return {
      raw_content: content,
      parse_error: error.message,
      generated_at: new Date().toISOString(),
      version: '1.0.0'
    }
  }
}

// ストリーミングレスポンス用の関数（リアルタイム進捗表示用）
export async function generateProjectCodeStream(
  projectData: {
    title: string
    description: string
    category: string
    features?: string
    design_preferences?: string
    tech_requirements?: string
  },
  onProgress: (step: string, progress: number) => void
): Promise<{
  success: boolean
  data?: any
  error?: string
}> {
  const client = claudeClient.getClient()

  if (!client) {
    return {
      success: false,
      error: 'Claude API is not available.'
    }
  }

  try {
    onProgress('プロンプト準備中', 10)
    const prompt = buildProjectGenerationPrompt(projectData)
    
    onProgress('AI生成開始', 20)
    const response = await client.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 8000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    onProgress('レスポンス処理中', 80)
    const content = response.content[0]
    if (content.type === 'text') {
      const generatedContent = parseGeneratedContent(content.text)
      onProgress('生成完了', 100)
      return {
        success: true,
        data: generatedContent
      }
    } else {
      return {
        success: false,
        error: 'Unexpected response format from Claude API'
      }
    }

  } catch (error: any) {
    console.error('Claude API stream error:', error)
    return {
      success: false,
      error: error.message || 'Failed to generate project code'
    }
  }
}