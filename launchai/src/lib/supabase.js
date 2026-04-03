import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'MISSING')
console.log('Supabase Key:', supabaseAnonKey ? 'Found' : 'MISSING')

export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      }
    })
  : null
