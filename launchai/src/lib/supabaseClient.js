import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseSetup = () => !!supabaseUrl && !!supabaseAnonKey

if (!isSupabaseSetup()) {
  console.warn('⚠️ Supabase credentials missing! Authentication and database features will be disabled. Check your .env file.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

