import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'MISSING')
console.log('Supabase Key:', supabaseAnonKey ? 'Found' : 'MISSING')

let supabaseClient = null;
let isConfigured = false;

if (supabaseUrl && supabaseAnonKey) {
  try {
    // Basic validation to ensure it's a valid URL, otherwise createClient throws an uncatchable top-level error.
    new URL(supabaseUrl);
    
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      }
    });
    isConfigured = true;
  } catch (err) {
    console.error('🚨 [Supabase] Initialization Failed (Invalid URL?):', err.message);
  }
}

export const supabaseConfigured = isConfigured;
export const supabase = supabaseClient;
