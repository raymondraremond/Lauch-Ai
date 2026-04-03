import { createClient } from '@supabase/supabase-js'

// Safely capture environment variables
const metaUrl = import.meta.env?.VITE_SUPABASE_URL || ""
const metaKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || ""

// Manual process.env fallback (captured during build via vite.config.js)
const procUrl = typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : ""
const procKey = typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : ""

const supabaseUrl = metaUrl || procUrl
const supabaseAnonKey = metaKey || procKey

// Diagnostic Logging (Early)
if (typeof window !== 'undefined') {
  console.log('🛡️ [SUPABASE INIT] Checking configuration...')
  console.log('   URL:', supabaseUrl ? `${supabaseUrl.substring(0, 12)}...` : 'MISSING')
  console.log('   Key:', supabaseAnonKey ? `EXISTS (${supabaseAnonKey.length} chars)` : 'MISSING')
}

// Enhanced validation: Ensure both exist and URL is valid-ish
export const supabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  typeof supabaseUrl === 'string' && 
  supabaseUrl.startsWith('http')
)

if (!supabaseConfigured && typeof window !== 'undefined') {
  console.warn('⚠️ [SUPABASE CONFIG] Missing or invalid environment variables. Check Vercel settings.')
}

let supabaseInstance = null

if (supabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      }
    })
    if (typeof window !== 'undefined') console.log('✅ [SUPABASE] Client initialized successfully.')
  } catch (err) {
    if (typeof window !== 'undefined') {
      console.error('❌ [SUPABASE INITIALIZATION ERROR]:', err.message)
    }
  }
}

export const supabase = supabaseInstance
