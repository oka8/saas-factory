# Google認証設定ガイド

## 1. Google Cloud Console での設定

### 1.1 プロジェクト作成・選択
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択

### 1.2 OAuth同意画面の設定
1. 左メニューから「APIs & Services」→「OAuth consent screen」を選択
2. User Type を選択（個人使用なら External）
3. 以下の情報を入力：
   - **App name**: SaaS Factory
   - **User support email**: あなたのメールアドレス
   - **App logo**: （オプション）
   - **App domain**: 
     - Application home page: `http://localhost:3000`（開発時）
     - Privacy policy link: `http://localhost:3000/privacy`（オプション）
     - Terms of service link: `http://localhost:3000/terms`（オプション）
   - **Authorized domains**: 
     - `localhost`（開発時）
     - あなたの本番ドメイン（例：`saas-factory.com`）
   - **Developer contact information**: あなたのメールアドレス

### 1.3 OAuth 2.0 クライアント ID の作成
1. 左メニューから「APIs & Services」→「Credentials」を選択
2. 「+ CREATE CREDENTIALS」→「OAuth client ID」をクリック
3. Application type: **Web application**
4. Name: `SaaS Factory Web Client`
5. Authorized JavaScript origins:
   - `http://localhost:3000`（開発用）
   - `https://yourdomain.com`（本番用）
6. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`（開発用）
   - `https://yourdomain.com/auth/callback`（本番用）

### 1.4 クライアントIDとシークレットを取得
作成後に表示される以下の値をコピー：
- **Client ID**: `xxxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxx`

## 2. Supabase での設定

### 2.1 Supabase Dashboard での設定
1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクトを選択
3. 左メニューから「Authentication」→「Settings」を選択
4. 「Auth Providers」セクションで「Google」を有効化
5. Google Cloud Console で取得した情報を入力：
   - **Client ID**: `xxxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxx`
6. 「Save」をクリック

### 2.2 Site URL の設定
1. 「General settings」タブで以下を設定：
   - **Site URL**: `http://localhost:3000`（開発時）
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/**`（wildcard for all auth paths）

## 3. 環境変数の設定

`.env.local` ファイルに以下を追加（既に設定済みの場合は確認）：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google OAuth (オプション - クライアントサイドで直接使用する場合)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 4. 本番環境での設定

### 4.1 Vercel でのデプロイ時
1. Vercel Dashboard で Environment Variables に追加
2. Google Cloud Console で本番URLを Authorized domains に追加
3. Supabase で本番URLを Site URL に設定

### 4.2 その他のホスティングサービス
各サービスの環境変数設定に従って同様に設定

## トラブルシューティング

### よくあるエラー
1. **redirect_uri_mismatch**: Authorized redirect URIs が正しく設定されていない
2. **invalid_client**: Client ID または Client Secret が間違っている  
3. **access_denied**: OAuth同意画面の設定が不完全

### 確認事項
- [ ] Google Cloud Console でOAuth同意画面が公開済み
- [ ] Authorized domains に正しいドメインが設定済み
- [ ] Supabase の Auth Provider でGoogleが有効
- [ ] リダイレクトURLが両方のサービスで一致
- [ ] 環境変数が正しく設定済み