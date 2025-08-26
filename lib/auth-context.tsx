'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { isDemoMode, DEMO_USER } from '@/lib/demo-data'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // デモモードの場合、デモユーザーを設定
    if (isDemoMode()) {
      setUser({
        ...DEMO_USER,
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: DEMO_USER.created_at,
        updated_at: DEMO_USER.created_at,
        role: 'authenticated'
      } as User)
      setLoading(false)
      return
    }

    // 通常の認証フロー
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = async () => {
    // デモモードの場合、ホームページにリダイレクト
    if (isDemoMode()) {
      window.location.href = '/'
      return
    }

    // 通常のサインアウト処理
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign out error:', error)
    }
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}