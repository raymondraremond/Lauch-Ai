import { createClient } from '@supabase/supabase-js'

// Standard Vite way
const metaUrl = import.meta.env.VITE_SUPABASE_URL
const metaKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vercel / process.env fallback (defined in vite.config.js)
const procUrl = typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : null
const procKey = typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : null

const supabaseUrl = metaUrl || procUrl
const supabaseAnonKey = metaKey || procKey

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
