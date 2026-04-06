/**
 * AIClient.js
 * Secure abstraction for AI calls via our backend proxy.
 * This ensures API keys stay hidden and credits are tracked.
 */
import { supabase } from './supabase'
import { AI_MODELS } from './AIConfig'

import { API_BASE } from './config'

/**
 * Get a fresh Supabase JWT token, refreshing if necessary.
 * This is more robust than just getSession() for production backends.
 */
async function getFreshToken() {
  if (!supabase) return null
  
  // 1. Get current session
  const { data: { session } } = await supabase.auth.getSession()
  
  // 2. If no session, wait briefly and retry (handles rapid navigation case)
  if (!session) {
    console.warn('⚠️ [AI CLIENT] No session found, waiting...')
    await new Promise(r => setTimeout(r, 100))
    const { data: { session: retry } } = await supabase.auth.getSession()
    if (!retry) return null
    return retry.access_token
  }

  // 3. Check for expiry (5 minute buffer)
  const expiresAt = session.expires_at || 0
  const bufferSeconds = 300
  const isNearExpiry = (expiresAt - (Date.now() / 1000)) < bufferSeconds

  if (isNearExpiry) {
    console.info('🔄 [AI CLIENT] Token near expiry, refreshing session...')
    const { data: refreshed, error } = await supabase.auth.refreshSession()
    if (error) {
      console.error('❌ [AI CLIENT] Token refresh failed:', error.message)
      return session.access_token // Fallback to current
    }
    return refreshed.session?.access_token
  }

  return session.access_token
}

export async function callAI(options) {
  const { prompt, parts, model = AI_MODELS.DEFAULT_GENERATION } = options

  if (!supabase) throw new Error('Supabase not configured')
  
  const token = await getFreshToken()

  if (!token) {
    throw new Error('Authentication required. Please sign in again.')
  }

  console.log(`📡 [AI CLIENT] Fetching ${model} from ${API_BASE}...`)
  

  try {
    const response = await fetch(`${API_BASE}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt, parts, model })
    })

    const text = await response.text()
    if (!text) {
      throw new Error('The AI server returned an empty response. Please try again.')
    }

    let data;
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('❌ [AI CLIENT] JSON Parse Error:', text)
      throw new Error('The AI server returned an invalid format. Please try again.')
    }

    if (!response.ok) {
      console.error(`❌ [AI CLIENT] Proxy error (${response.status}):`, data.error)
      
      if (response.status === 402) {
        throw new Error('Insufficient credits. Please top up in Settings.')
      }
      if (response.status === 401) {
        throw new Error('Unauthorized — session may have expired. Please refresh the page.')
      }
      throw new Error(data.error || 'AI Generation failed.')
    }

    return data
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Could not connect to the AI server. Check your connection or Render status.')
    }
    throw err
  }
}

export async function getUserCredits() {
  if (!supabase) return 0
  const token = await getFreshToken()

  if (!token) return 0

  try {
    const response = await fetch(`${API_BASE}/api/user/credits`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) return 0
    
    const data = await response.json()
    return data.credits ?? 0
  } catch (err) {
    console.warn('⚠️ [AI CLIENT] Could not fetch credits:', err.message)
    return 0
  }
}
