import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            cookieStore.set(name, value, options)
          },
          remove: (name: string, options: any) => {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=認証エラーが発生しました`)
      }
    } catch (err) {
      console.error('Auth callback exception:', err)
      return NextResponse.redirect(`${origin}/auth/login?error=認証処理中にエラーが発生しました`)
    }
  }

  // コードがない場合はログインページにリダイレクト
  return NextResponse.redirect(`${origin}/auth/login?error=認証情報が不正です`)
}