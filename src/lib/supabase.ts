import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** .env에 Supabase URL/anon key가 채워져 있는지 여부 */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * 설정 전에는 null. 앱이 크래시하지 않도록 사용하는 쪽에서 가드한다.
 * (09_hybrid_build_plan.md ② — Supabase Auth + Google OAuth)
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null
