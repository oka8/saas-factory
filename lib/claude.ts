import type { 
  CreateProjectData, 
  Template, 
  UserPreferences, 
  ProjectAnalysis, 
  GeneratedCode, 
  DeploymentInstructions,
  ClaudeRequest,
  ClaudeResponse
} from './types'

const CLAUDE_API_BASE = 'https://api.anthropic.com/v1'

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AnthropicRequest {
  model: string
  max_tokens: number
  messages: AnthropicMessage[]
  system?: string
}

interface AnthropicResponse {
  content: Array<{
    type: string
    text: string
  }>
  id: string
  model: string
  role: string
  stop_reason: string
  stop_sequence: null
  type: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export class ClaudeAPIClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || ''
    if (!this.apiKey) {
      console.warn('Claude API key not found. Set ANTHROPIC_API_KEY environment variable.')
    }
  }

  private async callClaude(messages: AnthropicMessage[], systemPrompt?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured')
    }

    const request: AnthropicRequest = {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 8000,
      messages,
      ...(systemPrompt && { system: systemPrompt })
    }

    try {
      const response = await fetch(`${CLAUDE_API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Claude API error: ${error.error?.message || response.statusText}`)
      }

      const data: AnthropicResponse = await response.json()
      return data.content[0]?.text || ''
    } catch (error: any) {
      console.error('Claude API call failed:', error)
      throw error
    }
  }

  async analyzeProject(projectData: CreateProjectData, template?: Template): Promise<ProjectAnalysis> {
    const systemPrompt = `
あなたはSaaSアプリケーション開発の専門家です。
日本語で記述されたプロジェクトアイディアを分析し、技術的な実装アプローチを提案してください。

以下の観点で分析してください：
1. 複雑度スコア (1-10)
2. 推奨機能の詳細
3. 最適な技術スタック
4. 推定開発時間（時間）
5. 実装上の課題とその対策

レスポンスはJSON形式で返してください。
`

    const userPrompt = `
プロジェクト情報:
- タイトル: ${projectData.title}
- 説明: ${projectData.description}
- カテゴリ: ${projectData.category}
- 機能要件: ${projectData.features || 'なし'}
- デザイン要望: ${projectData.design_preferences || 'なし'}
- 技術要件: ${projectData.tech_requirements || 'なし'}

${template ? `
参考テンプレート:
- 名前: ${template.name}
- 説明: ${template.description}
- 設定: ${JSON.stringify(template.template_config)}
` : ''}

上記の情報を基に、プロジェクトの分析結果をJSON形式で返してください。
`

    try {
      const response = await this.callClaude([
        { role: 'user', content: userPrompt }
      ], systemPrompt)

      // JSONレスポンスをパース
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // フォールバック: デフォルト分析結果
      return {
        complexity_score: 5,
        recommended_features: ['基本CRUD操作', 'ユーザー認証', 'レスポンシブデザイン'],
        tech_stack_suggestions: {
          frontend: 'react',
          backend: 'nextjs',
          database: 'supabase',
          styling: 'tailwindcss'
        },
        estimated_development_time: 40,
        potential_challenges: ['データベース設計', 'ユーザビリティの最適化']
      }
    } catch (error: any) {
      console.error('Project analysis failed:', error)
      throw new Error(`プロジェクト分析に失敗しました: ${error.message}`)
    }
  }

  async generateCode(projectData: CreateProjectData, analysis: ProjectAnalysis, template?: Template): Promise<GeneratedCode> {
    const systemPrompt = `
あなたは経験豊富なフルスタック開発者です。
プロジェクト要件を基に、Next.js + TypeScript + Tailwind CSS + Supabaseを使用した
完全に動作するSaaSアプリケーションのコードを生成してください。

生成する内容：
1. Reactコンポーネント（TSX）
2. API Routes（Next.js）
3. データベーススキーマ（SQL）
4. package.json設定
5. デプロイ設定

ADHD配慮の観点：
- シンプルで直感的なUI
- 視覚的フィードバック
- 大きなクリック領域
- 明確な状態表示

すべてのコードは本番環境で動作するように作成してください。
レスポンスはJSON形式で返してください。
`

    const userPrompt = `
プロジェクト分析結果:
${JSON.stringify(analysis, null, 2)}

プロジェクト詳細:
- タイトル: ${projectData.title}  
- 説明: ${projectData.description}
- カテゴリ: ${projectData.category}
- 機能: ${projectData.features || '基本機能'}
- デザイン: ${projectData.design_preferences || 'シンプルで使いやすいデザイン'}

${template ? `
ベーステンプレート:
${JSON.stringify(template.code_template, null, 2)}
` : ''}

上記の情報を基に、完全なSaaSアプリケーションのコードを生成してください。
レスポンスはJSONで、以下の構造で返してください：

{
  "components": ["component names"],
  "pages": ["page names"], 
  "api_routes": ["api route paths"],
  "database_schema": "SQL schema",
  "package_json": {},
  "deployment_config": {},
  "file_structure": [
    {
      "path": "relative/file/path",
      "content": "file content",
      "type": "file"
    }
  ]
}
`

    try {
      const response = await this.callClaude([
        { role: 'user', content: userPrompt }
      ], systemPrompt)

      // JSONレスポンスをパース
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // フォールバック: 基本的なファイル構造
      return {
        components: ['Dashboard', 'DataTable', 'Form'],
        pages: ['Dashboard', 'Settings'],
        api_routes: ['/api/data', '/api/auth'],
        database_schema: `
          CREATE TABLE items (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
        package_json: {
          name: projectData.title.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          dependencies: {
            'next': '^14.0.0',
            'react': '^18.0.0',
            'react-dom': '^18.0.0',
            '@supabase/supabase-js': '^2.0.0'
          }
        },
        deployment_config: {
          platform: 'vercel',
          build_command: 'npm run build',
          output_directory: '.next'
        },
        file_structure: [
          {
            path: 'pages/index.tsx',
            content: `export default function Home() { return <div>Hello World</div> }`,
            type: 'file'
          }
        ]
      }
    } catch (error: any) {
      console.error('Code generation failed:', error)
      throw new Error(`コード生成に失敗しました: ${error.message}`)
    }
  }

  async generateDeploymentInstructions(generatedCode: GeneratedCode, projectData: CreateProjectData): Promise<DeploymentInstructions> {
    const systemPrompt = `
あなたはDevOpsの専門家です。
生成されたSaaSアプリケーションのデプロイメント手順を作成してください。

以下を含めてください：
1. 推奨プラットフォーム
2. 必要な環境変数
3. ビルドコマンド  
4. デプロイ手順

Vercelを優先してください。レスポンスはJSON形式で返してください。
`

    const userPrompt = `
生成されたコード情報:
${JSON.stringify({
  components: generatedCode.components,
  pages: generatedCode.pages,
  api_routes: generatedCode.api_routes,
  package_json: generatedCode.package_json
}, null, 2)}

プロジェクト: ${projectData.title}

デプロイメント手順をJSON形式で生成してください。
`

    try {
      const response = await this.callClaude([
        { role: 'user', content: userPrompt }
      ], systemPrompt)

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // フォールバック
      return {
        platform: 'vercel',
        environment_variables: {
          'NEXT_PUBLIC_SUPABASE_URL': 'your_supabase_url',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'your_supabase_anon_key'
        },
        build_commands: ['npm run build'],
        deployment_steps: [
          'GitHubリポジトリを作成',
          'Vercelにインポート',
          '環境変数を設定',
          'デプロイを実行'
        ]
      }
    } catch (error: any) {
      console.error('Deployment instructions generation failed:', error)
      throw new Error(`デプロイ手順の生成に失敗しました: ${error.message}`)
    }
  }

  async generateProject(request: ClaudeRequest): Promise<ClaudeResponse> {
    try {
      // ステップ1: プロジェクト分析
      const analysis = await this.analyzeProject(request.project_data, request.template)
      
      // ステップ2: コード生成
      const generated_code = await this.generateCode(request.project_data, analysis, request.template)
      
      // ステップ3: デプロイ手順生成
      const deployment_instructions = await this.generateDeploymentInstructions(generated_code, request.project_data)

      return {
        analysis,
        generated_code,
        deployment_instructions,
        estimated_completion_time: analysis.estimated_development_time
      }
    } catch (error: any) {
      console.error('Full project generation failed:', error)
      throw new Error(`プロジェクト生成に失敗しました: ${error.message}`)
    }
  }
}

// シングルトンインスタンス
export const claudeAPI = new ClaudeAPIClient()