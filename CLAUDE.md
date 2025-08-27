# SaaS Factory Development Guide

## Project Overview

SaaS Factory は、アイデアを完動する SaaS アプリケーションに自動変換する AI 支援開発プラットフォームです。ADHD 配慮の開発ワークフローで効率的な構築を支援し、デモモード機能により実際のデータベースなしでも動作確認が可能です。

### Architecture Stack
- **Frontend**: Next.js 15.5.0 with React 19.1.0 + Tailwind CSS 4
- **Backend**: Next.js API Routes + Supabase Integration
- **Database**: Supabase PostgreSQL (with demo mode fallback)
- **Authentication**: Supabase Auth + OAuth (Google, GitHub)
- **AI Integration**: Anthropic Claude API for code generation
- **Deployment**: Docker + standalone mode

## Development Commands

```bash
# 開発サーバー起動 (Turbopack使用)
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Linting
npm run lint

# Supabase ローカル環境
npm run supabase:start
npm run supabase:stop
npm run supabase:reset

# 型定義生成
npm run supabase:types

# Docker 開発環境
npm run docker:dev

# Docker 本番デプロイ
npm run docker:prod

# Docker イメージビルド
npm run docker:build

# Docker コンテナ停止
npm run docker:stop
```

## Key Files & Directories

### Core Configuration
- `next.config.ts` - Next.js設定（Turbopack、standalone出力）
- `tailwind.config.ts` - Tailwind CSS設定
- `middleware.ts` - Supabase認証ミドルウェア
- `package.json` - 依存関係とスクリプト定義

### Environment Files
- `.env.example` - 環境変数テンプレート
- `.env.local` - ローカル開発設定
- `.env.production` - 本番環境設定

### Authentication & Database
- `lib/auth-context.tsx` - 認証コンテキスト（デモモード対応）
- `lib/supabase/client.ts` - Supabase クライアント
- `lib/supabase/middleware.ts` - 認証ミドルウェア
- `lib/demo-data.ts` - デモモードデータ

### Core Components
- `app/layout.tsx` - ルートレイアウト
- `app/dashboard/page.tsx` - メインダッシュボード
- `app/auth/login/page.tsx` - ログインページ（Suspense対応）
- `app/auth/signup/page.tsx` - サインアップページ

### Utilities
- `lib/logger.ts` - プロダクション安全ログシステム
- `lib/types.ts` - TypeScript型定義
- `lib/templates/` - プロジェクトテンプレート

### Documentation
- `DEPLOYMENT_GUIDE.md` - 本番デプロイ手順書
- `TESTING_GUIDE.md` - テスト環境セットアップ

## Important Technical Patterns

### 1. Demo Mode System
```typescript
// lib/demo-data.ts
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

// Usage in components
if (isDemoMode()) {
  setUser(DEMO_USER)
  setProjects(getDemoProjects())
}
```

### 2. Authentication Flow
```typescript
// lib/auth-context.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // デモモード対応の認証プロバイダー
  // Supabaseセッション管理
  // 自動リダイレクト処理
}
```

### 3. Production-Safe Logging
```typescript
// lib/logger.ts
export const devLog = {
  log: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] ${message}`, ...args)
    }
  }
}
```

### 4. Dynamic Rendering for Client Components
```typescript
// auth pages
export const dynamic = 'force-dynamic'
```

### 5. Suspense Boundaries for useSearchParams
```typescript
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginForm />
    </Suspense>
  )
}
```

## Environment Variables Setup

### Required for Development
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_claude_api_key
NEXT_PUBLIC_DEMO_MODE=true  # デモモード有効化
NODE_ENV=development
```

### Required for Production
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude API
ANTHROPIC_API_KEY=your_production_api_key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=SaaS Factory
NODE_ENV=production
```

## Build & Deployment Notes

### Current Build Configuration
Next.js設定で一時的にエラーを無視（本番デプロイ用）:
```typescript
// next.config.ts
eslint: {
  ignoreDuringBuilds: true,
},
typescript: {
  ignoreBuildErrors: true,
}
```

### Docker Deployment
- `Dockerfile` - マルチステージビルド対応
- `scripts/docker-prod.sh` - 本番デプロイスクリプト
- `output: 'standalone'` - Docker最適化済み

## Known Issues & Fixes Applied

### 1. Next.js 15 Compatibility
- ✅ Fixed: Dynamic rendering exports for auth pages
- ✅ Fixed: Suspense boundaries for useSearchParams
- ⚠️ Partial: API route params type changes (some routes may need async params)

### 2. Production Safety
- ✅ Fixed: Replaced console.log with devLog system
- ✅ Fixed: Removed duplicate function definitions
- ✅ Fixed: Type safety improvements (`any` → `Record<string, unknown>`)

### 3. Demo Mode Integration
- ✅ Implemented: Complete demo data system
- ✅ Implemented: Demo authentication flow
- ✅ Implemented: Fallback for database operations

## ADHD-Friendly Development Features

1. **明確なエラーメッセージ**: APIエラー、ネットワークエラーの詳細表示
2. **プログレス表示**: ローディングスピナー、タスク進捗
3. **段階的な開示**: 情報の階層的組織化
4. **一貫性のあるUI**: 予測可能なインタラクションパターン
5. **デモモード**: データベース設定なしでの動作確認

## Testing Strategy

テスト環境の詳細は `TESTING_GUIDE.md` を参照してください:
- Jest + Testing Library (単体テスト)
- Playwright (E2Eテスト)
- Supabase ローカルテスト環境

## Troubleshooting Common Issues

### Build Failures
1. `getDemoProjects is defined multiple times` → lib/demo-data.ts の重複関数削除済み
2. TypeScript エラー → 型定義の見直し、any type の削除
3. ESLint エラー → eslint.config.js の設定確認

### Authentication Issues
1. デモモードの確認: `NEXT_PUBLIC_DEMO_MODE=true`
2. Supabase設定の確認: URL、Anon Key
3. ミドルウェア設定の確認: middleware.ts

### Runtime Errors
1. useSearchParams エラー → Suspense境界の追加
2. プリレンダリング エラー → dynamic = 'force-dynamic'

## Architecture Decisions

### Why Next.js 15 + React 19
- 最新のReact Server Components
- Turbopackによる高速ビルド
- App Routerによる直感的なルーティング

### Why Supabase
- リアルタイムデータベース
- 組み込み認証システム
- Row Level Security (RLS)
- PostgreSQL互換

### Why Demo Mode
- 即座の動作確認
- データベースセットアップ不要
- デモンストレーション用途
- 開発効率の向上

## Performance Considerations

1. **コード分割**: 動的インポートの活用
2. **画像最適化**: Next.js Image コンポーネント
3. **キャッシュ戦略**: ISR、静的生成の適切な使い分け
4. **バンドルサイズ**: 不要な依存関係の除去

---

**重要**: このプロジェクトはADHD配慮の開発を前提としています。集中しやすい開発環境、明確なフィードバック、段階的なタスク進行を重視してください。