import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

type AuthResult = { error: string | null }

type AuthContextValue = {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  signUp: (email: string, password: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  signInWithDemo: (email?: string) => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const DEMO_USER_KEY = 'naengjangi_demo_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [demoUser, setDemoUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(DEMO_USER_KEY)
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next) {
        setDemoUser(null)
        localStorage.removeItem(DEMO_USER_KEY)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const activeUser = session?.user ?? demoUser
    const notConfiguredMsg =
      'Supabase 키가 세팅되어 있지 않아 데모 모드로 동작합니다. 계정이 바로 생성되었습니다.'

    return {
      session,
      user: activeUser,
      loading,
      configured: isSupabaseConfigured,
      async signUp(email, password) {
        if (!supabase) {
          // Graceful demo signup when Supabase is not configured
          const mockUser = {
            id: `demo-${Date.now()}`,
            email,
            user_metadata: { name: email.split('@')[0] },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as unknown as User
          setDemoUser(mockUser)
          localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser))
          return { error: null }
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
        return { error: error?.message ?? null }
      },
      async signIn(email, password) {
        if (!supabase) {
          const mockUser = {
            id: `demo-${Date.now()}`,
            email,
            user_metadata: { name: email.split('@')[0] },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as unknown as User
          setDemoUser(mockUser)
          localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser))
          return { error: null }
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error?.message ?? null }
      },
      async signInWithGoogle() {
        if (!supabase) {
          const mockUser = {
            id: `demo-google-${Date.now()}`,
            email: 'google_user@example.com',
            user_metadata: { name: '구글 데모 사용자' },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as unknown as User
          setDemoUser(mockUser)
          localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser))
          return { error: null }
        }
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        })
        return { error: error?.message ?? null }
      },
      async signInWithDemo(email = 'chef@naengjangi.app') {
        const mockUser = {
          id: `demo-${Date.now()}`,
          email,
          user_metadata: { name: '냉장이 시범집사' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User
        setDemoUser(mockUser)
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser))
        return { error: isSupabaseConfigured ? null : notConfiguredMsg }
      },
      async resetPassword(email) {
        if (!supabase) {
          return { error: '비밀번호 재설정 이메일을 전송하는 데모 안내입니다.' }
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        })
        return { error: error?.message ?? null }
      },
      async signOut() {
        setDemoUser(null)
        localStorage.removeItem(DEMO_USER_KEY)
        if (supabase) {
          await supabase.auth.signOut()
        }
      },
    }
  }, [session, demoUser, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
