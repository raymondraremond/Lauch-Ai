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

// Create client with valid credentials, or a safe no-op stub when missing.
// This prevents the app from crashing when Supabase isn't configured.
export const supabase = isSupabaseSetup()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createNoopClient()

/**
 * Returns a minimal Supabase-like stub so that calling code (AuthContext,
 * ProjectStore, etc.) never throws on missing credentials.  Every method
 * resolves to an empty / null result, exactly like Supabase would for an
 * unauthenticated user with no data.
 */
function createNoopClient() {
  const noopQuery = () => ({
    select: noopQuery,
    insert: noopQuery,
    update: noopQuery,
    delete: noopQuery,
    upsert: noopQuery,
    eq: noopQuery,
    neq: noopQuery,
    gt: noopQuery,
    lt: noopQuery,
    gte: noopQuery,
    lte: noopQuery,
    like: noopQuery,
    ilike: noopQuery,
    is: noopQuery,
    in: noopQuery,
    order: noopQuery,
    limit: noopQuery,
    range: noopQuery,
    single: noopQuery,
    maybeSingle: noopQuery,
    then: (resolve) => resolve({ data: null, error: null }),
  })

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      onAuthStateChange: (callback) => {
        // Fire INITIAL_SESSION immediately with no session
        setTimeout(() => callback('INITIAL_SESSION', null), 0)
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
    from: () => noopQuery(),
    rpc: () => Promise.resolve({ data: null, error: null }),
  }
}
