#!/bin/bash

# Google認証設定スクリプト
echo "🔧 SaaS Factory - Google認証設定"
echo "================================="

echo ""
echo "📋 設定手順:"
echo ""
echo "1️⃣  Google Cloud Console での設定"
echo "   → https://console.cloud.google.com/"
echo "   - プロジェクトを作成または選択"
echo "   - APIs & Services > OAuth consent screen で設定"
echo "   - APIs & Services > Credentials でOAuth 2.0 クライアントIDを作成"
echo ""

echo "2️⃣  必要な情報（Google Cloud Console から取得）:"
echo "   - Client ID: xxxxxx.apps.googleusercontent.com"
echo "   - Client Secret: GOCSPX-xxxxxxxxxx"
echo ""

echo "3️⃣  Supabase での設定"
echo "   → https://supabase.com/dashboard"
echo "   - Authentication > Settings > Auth Providers"
echo "   - Google を有効化して Client ID と Client Secret を入力"
echo ""

echo "4️⃣  Authorized redirect URIs に以下を追加:"
echo "   開発用: http://localhost:3000/auth/callback"
echo "   本番用: https://yourdomain.com/auth/callback"
echo ""

echo "5️⃣  .env.local ファイルを更新:"
echo "   NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-url"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key"
echo ""

echo "⚠️  現在のデモモード設定では Google 認証は動作しません"
echo "   実際のSupabaseプロジェクトと設定が必要です"
echo ""

read -p "続行するには Enter キーを押してください..."

echo ""
echo "🚀 設定が完了したら、以下でテストできます:"
echo "   1. アプリを再起動: npm run dev"  
echo "   2. http://localhost:3000/auth/login にアクセス"
echo "   3. 'Googleでログイン' ボタンをクリック"
echo ""

echo "✅ 設定完了後の確認事項:"
echo "   □ Google Cloud Console でOAuth同意画面が設定済み"
echo "   □ Authorized domains に localhost が追加済み"  
echo "   □ Supabase でGoogle認証が有効化済み"
echo "   □ 環境変数が正しく設定済み"
echo ""

echo "❓ 問題が発生した場合:"
echo "   - docs/google-auth-setup.md を参照"
echo "   - ブラウザの開発者ツールでエラーを確認"
echo "   - Supabase ダッシュボードの Authentication logs を確認"