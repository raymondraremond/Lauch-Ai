import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isPlaceholder = supabaseUrl?.includes('placeholder-url')

export const isSupabaseSetup = () => !!supabaseUrl && !!supabaseAnonKey && !isPlaceholder

if (!isSupabaseSetup()) {
  if (isPlaceholder) {
    console.warn('⚠️ Supabase URL is still set to a placeholder! Please update your .env file with your real Supabase URL and RESTART your dev server.')
  } else {
    console.warn('⚠️ Supabase credentials missing! Authentication and database features will be disabled. Check your .env file.')
  }
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

