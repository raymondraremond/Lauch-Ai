/**
 * AIClient.js
 * Secure abstraction for AI calls via our backend proxy.
 * This ensures API keys stay hidden and credits are tracked.
 */
import { supabase } from './supabase'

const BACKEND_URL = '/api'

export async function callAI(options) {
  const { prompt, parts, model = 'gemini-2.5-flash' } = options

  // Get current session for token
  if (!supabase) throw new Error('Supabase not configured')
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  if (!token) {
    throw new Error('Authentication required for AI features.')
  }

  const response = await fetch(`${BACKEND_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ prompt, parts, model })
  })

  const data = await response.json()

  if (!response.ok) {
    if (response.status === 402) {
      throw new Error('Insufficient credits. Please top up in Settings.')
    }
    throw new Error(data.error || 'AI Generation failed.')
  }

  return data
}

export async function getUserCredits() {
  if (!supabase) return 0
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  if (!token) return 0

  const response = await fetch(`${BACKEND_URL}/api/user/credits`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  return data.credits ?? 0
}
