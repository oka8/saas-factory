import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // デモモードまたは無効なAPIキーの場合はダミーURLを使用
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key'
  
  // デモモードの場合はダミーのクライアントを返す
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || url === 'https://demo.supabase.co') {
    // ダミーURLとキーでクライアントを作成（実際には使用されない）
    return createBrowserClient(
      'https://demo.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTc2OTIwMCwiZXhwIjoxOTU3MzQ1MjAwfQ.demo_key_for_local_development_only'
    )
  }
  
  return createBrowserClient(url, anonKey)
}