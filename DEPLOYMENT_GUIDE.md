# SaaS Factory - 実運用環境構築ガイド 🚀

このドキュメントでは、SaaS Factoryを本番環境で運用するために必要な設定と手順を説明します。

## 📋 必要なサービス・APIキー一覧

### 1. 必須サービス

#### 🔑 Supabase（データベース・認証）
- **用途**: ユーザー認証、データ保存、ファイルストレージ
- **取得方法**:
  1. [Supabase](https://supabase.com)でアカウント作成
  2. 新規プロジェクト作成
  3. Settings → API から以下を取得:
     - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key
     - `SUPABASE_SERVICE_ROLE_KEY`: service_role key（機密情報）

#### 🤖 Anthropic Claude API
- **用途**: AI によるコード生成とテキスト処理
- **取得方法**:
  1. [Anthropic Console](https://console.anthropic.com)でアカウント作成
  2. API Keys セクションから新規APIキー作成
  3. `ANTHROPIC_API_KEY`として設定
- **料金**: 従量課金（Claude 3.5 Sonnet推奨）

### 2. オプションサービス

#### 💳 Stripe（課金システム）
- **用途**: サブスクリプション管理、決済処理
- **取得方法**:
  1. [Stripe Dashboard](https://dashboard.stripe.com)でアカウント作成
  2. Developers → API keys から取得:
     - `STRIPE_PUBLISHABLE_KEY`: 公開可能キー
     - `STRIPE_SECRET_KEY`: シークレットキー
     - `STRIPE_WEBHOOK_SECRET`: Webhookエンドポイントシークレット

#### 🔐 OAuth プロバイダー
**Google OAuth**:
1. [Google Cloud Console](https://console.cloud.google.com)でプロジェクト作成
2. APIs & Services → Credentials → Create Credentials → OAuth 2.0
3. 設定:
   - Authorized redirect URIs: `https://your-domain.com/auth/callback`
   - `GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`を取得

**GitHub OAuth**（追加実装時）:
1. Settings → Developer settings → OAuth Apps
2. New OAuth App作成
3. Authorization callback URL: `https://your-domain.com/auth/callback`

## 🚀 デプロイメント設定

### オプション1: Vercel（推奨）

```bash
# Vercel CLIインストール
npm i -g vercel

# プロジェクトをVercelにリンク
vercel

# 環境変数設定（Vercelダッシュボードまたはcli）
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY

# プロダクションデプロイ
vercel --prod
```

**Vercel環境変数の設定**:
1. Vercelダッシュボード → Settings → Environment Variables
2. 各環境変数を追加（Production/Preview/Development）

### オプション2: Docker + Cloud Run/ECS

```dockerfile
# 既存のDockerfileを使用
docker build -t saas-factory:latest .

# 環境変数をdocker-compose.ymlで管理
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  app:
    image: saas-factory:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    env_file:
      - .env.production
```

### オプション3: 従来型VPS/EC2

```bash
# サーバー上でPM2を使用
npm install -g pm2

# アプリケーションビルド
npm run build

# PM2で起動
pm2 start npm --name "saas-factory" -- start

# 自動起動設定
pm2 startup
pm2 save
```

## 📝 環境変数テンプレート

`.env.production`の完全なテンプレート:

```env
# ===== 必須設定 =====
NODE_ENV=production

# Supabase設定（必須）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Claude API設定（必須）
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx...

# アプリケーション設定
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=SaaS Factory

# セキュリティ設定（必須）
NEXTAUTH_SECRET=ランダムな32文字以上の文字列を生成
NEXTAUTH_URL=https://your-domain.com

# ===== オプション設定 =====

# Google OAuth（ソーシャルログイン用）
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# GitHub OAuth（ソーシャルログイン用）
GITHUB_CLIENT_ID=xxxxx
GITHUB_CLIENT_SECRET=xxxxx

# Stripe決済（課金機能用）
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Vercel統合（自動デプロイ用）
VERCEL_ACCESS_TOKEN=xxxxx

# メール送信（通知用）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-specific-password

# モニタリング（エラー追跡）
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
LOGTAIL_SOURCE_TOKEN=xxxxx

# CDN/Storage
CLOUDINARY_URL=cloudinary://xxxxx
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
```

## 🔒 セキュリティ設定

### 1. Supabase Row Level Security (RLS)
```sql
-- projects テーブルのRLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. API レート制限
```typescript
// middleware.ts
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // API エンドポイントのレート制限
  if (request.url.includes('/api/')) {
    const { success } = await rateLimit.check(ip, 10, '1m'); // 1分間に10リクエスト
    
    if (!success) {
      return new Response('Too Many Requests', { status: 429 });
    }
  }
}
```

### 3. 環境変数の暗号化
```bash
# Vercelの場合
vercel secrets add anthropic-api-key "sk-ant-api03-xxxxx"

# Dockerの場合はDocker Secretsを使用
docker secret create anthropic_api_key api_key.txt
```

## 📊 モニタリング設定

### 1. ヘルスチェックエンドポイント
- URL: `/api/health`
- 監視間隔: 30秒
- タイムアウト: 3秒

### 2. ログ収集
```typescript
// lib/logger.ts の本番設定
const logger = {
  error: (message: string, error: any) => {
    // Sentryへ送信
    Sentry.captureException(error);
    
    // Logtailへ送信
    logtail.error(message, { error });
  },
  info: (message: string, data?: any) => {
    logtail.info(message, data);
  }
};
```

### 3. パフォーマンス監視
- Vercel Analytics（自動）
- または New Relic / Datadog 統合

## ✅ デプロイ前チェックリスト

### 環境変数
- [ ] Supabase URL、キーが本番用に設定されている
- [ ] ANTHROPIC_API_KEY が有効
- [ ] NEXTAUTH_SECRET がランダムに生成されている
- [ ] NEXT_PUBLIC_APP_URL が本番ドメインを指している

### セキュリティ
- [ ] Supabase RLS が有効化されている
- [ ] APIレート制限が実装されている
- [ ] HTTPSが有効（SSL証明書設定済み）
- [ ] CORSが適切に設定されている

### データベース
- [ ] Supabaseのマイグレーションが完了
- [ ] インデックスが適切に設定されている
- [ ] バックアップ戦略が確立されている

### モニタリング
- [ ] エラー追跡ツールが設定されている
- [ ] ログ収集が動作している
- [ ] アラート通知が設定されている

### パフォーマンス
- [ ] ビルド最適化が有効
- [ ] 画像最適化が設定されている
- [ ] CDNが設定されている（必要に応じて）

## 🆘 トラブルシューティング

### Supabase接続エラー
```bash
# URLとキーが正しいか確認
curl https://xxxxx.supabase.co/rest/v1/ \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### Claude API エラー
```bash
# APIキーの有効性確認
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-sonnet-20240229","max_tokens":10,"messages":[{"role":"user","content":"Hello"}]}'
```

### ビルドエラー
```bash
# キャッシュクリアして再ビルド
rm -rf .next node_modules
npm install
npm run build
```

## 📞 サポート

実運用で問題が発生した場合:
1. デプロイメントログを確認
2. `/api/health`エンドポイントの応答を確認
3. 環境変数が正しく設定されているか確認
4. GitHubのIssuesで報告

---

最終更新: 2024年12月
バージョン: 1.0.0