# SaaS Factory 🚀

アイディアを自然な日本語で記述するだけで、完動するSaaSアプリケーションを自動生成するプラットフォーム。ADHD配慮の開発ワークフローで効率的なサービス構築を支援します。

## 🌟 特徴

- **自然言語入力**: 複雑な設計書不要、日本語でアイディアを記述
- **AI自動生成**: Claude AIとClaude Codeによる完全自動化
- **ADHD配慮設計**: 25分フォーカスセッション、視覚的進捗表示
- **モダンスタック**: Next.js + TypeScript + Tailwind CSS + Supabase

## 📋 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント（無料プランで開始可能）

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd saas-factory
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local.example`を`.env.local`にコピーして、必要な値を設定：

```bash
cp .env.local.example .env.local
```

`.env.local`を編集：

```env
# Supabase設定（必須）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Claude API設定（プロジェクト生成に必要）
ANTHROPIC_API_KEY=your_anthropic_api_key

# Stripe設定（課金機能に必要、オプション）
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 4. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com)にアカウント作成
2. 新しいプロジェクトを作成
3. Settings > API > Project URLとProject API keysから値を取得
4. `.env.local`に設定

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてアプリケーションにアクセス

## 📁 プロジェクト構造

```
saas-factory/
├── app/                    # Next.js App Router
│   ├── auth/              # 認証関連ページ
│   ├── dashboard/         # ダッシュボード
│   ├── project/           # プロジェクト管理
│   └── globals.css        # グローバルスタイル
├── components/            # 共通コンポーネント
├── lib/                   # ユーティリティとヘルパー
│   ├── auth-context.tsx   # 認証コンテキスト
│   └── supabase/          # Supabase関連設定
├── public/                # 静的ファイル
└── README.md              # このファイル
```

## 🔧 技術スタック

### フロントエンド
- **Next.js 15** - Reactフレームワーク（Turbopack使用）
- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS 4** - スタイリング

### バックエンド・インフラ
- **Supabase** - データベース・認証・ストレージ
- **Next.js API Routes** - サーバーサイド処理
- **Vercel** - デプロイメント（推奨）

### AI・生成機能
- **Claude API** - 自然言語処理・コード生成
- **Claude Code** - 開発ワークフロー最適化

## 🎯 使い方

### 1. アカウント登録
1. トップページから「無料で始める」をクリック
2. メールアドレスとパスワードを入力してアカウント作成
3. または、Googleアカウントでサインアップ

### 2. プロジェクト作成
1. ダッシュボードから「プロジェクトを作成」をクリック
2. 3ステップのウィザードに従って情報を入力：
   - **基本情報**: プロジェクト名とアイディア説明
   - **カテゴリ**: CRM、CMS、TODO管理など
   - **詳細設定**: デザインの好みと技術要件

### 3. SaaS生成
1. 「SaaS生成開始」ボタンをクリック
2. AI分析とコード生成の進捗を確認
3. 完成したアプリケーションをプレビュー・デプロイ

## 🔐 認証機能

### 実装済み
- メール・パスワード認証
- Googleソーシャルログイン
- パスワードリセット機能
- セッション管理とミドルウェア保護

### Supabase認証の設定
1. Supabase ダッシュボードの Authentication > Settings
2. 必要に応じてプロバイダー（Google等）を有効化
3. Site URLに `http://localhost:3000` を設定
4. Redirect URLsに `http://localhost:3000/auth/callback` を追加

## 🎨 ADHD配慮設計

### 視覚的サポート
- **進捗バー**: 現在の作業ステップを明確に表示
- **色分け**: 状態ごとの色分けで直感的な理解
- **大きなボタン**: クリックしやすいUI要素

### 認知負荷軽減
- **3ステップフロー**: 複雑な作業を段階的に分割
- **自動保存**: 入力内容の自動保存で集中力維持
- **明確なフィードバック**: 操作結果の即座な表示

## 📝 今後の実装予定

### Phase 1（実装済み）
- ✅ 基本認証システム
- ✅ ダッシュボードUI
- ✅ プロジェクト作成フォーム

### Phase 2（開発中）
- 🔄 Claude API統合
- 🔄 コード生成エンジン
- 🔄 プロジェクト管理機能

### Phase 3（予定）
- ⏳ デプロイ自動化
- ⏳ 課金システム
- ⏳ テンプレート拡張

## 🐛 トラブルシューティング

### 開発サーバーが起動しない
```bash
# キャッシュをクリア
rm -rf .next
npm run dev
```

### 認証エラーが発生する
1. Supabaseプロジェクトの設定を確認
2. 環境変数が正しく設定されているか確認
3. Site URLとRedirect URLsが正しいか確認

### スタイルが適用されない
```bash
# Tailwindの再ビルド
npx tailwindcss build -i ./app/globals.css -o ./dist/output.css --watch
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は`LICENSE`ファイルを参照してください。

## 📞 サポート

- GitHub Issues: バグ報告・機能リクエスト
- Email: support@saas-factory.com（開発中）
- Discord: コミュニティサポート（開発中）

---

**SaaS Factory** - アイディアから完動するSaaSへ、最短30秒で実現 🚀
