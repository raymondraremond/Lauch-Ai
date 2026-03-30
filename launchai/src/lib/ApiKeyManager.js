/**
 * ApiKeyManager.js
 * Centralized utility for managing multiple Gemini API keys and implementing
 * auto-rotation logic when rate limits are encountered.
 */

const GEMINI_KEY_STORAGE = 'VITE_GOOGLE_API_KEY'

/**
 * Get all available Gemini API keys.
 * Returns an array of strings.
 */
export function getGeminiKeys() {
  const stored = localStorage.getItem(GEMINI_KEY_STORAGE)
  if (!stored) {
    // Fallback to environment variable if no local storage
    const envKey = import.meta.env.VITE_GOOGLE_API_KEY
    return envKey ? [envKey] : []
  }

  try {
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return parsed.filter(k => typeof k === 'string' && k.trim().length > 0)
    }
    // If it's a single string (legacy format), return it as an array
    return [stored.trim()]
  } catch (e) {
    // If parsing fails, it's likely a single string
    return [stored.trim()]
  }
}

/**
 * Save Gemini keys to local storage.
 * @param {string[]} keys - Array of API key strings
 */
export function saveGeminiKeys(keys) {
  if (!Array.isArray(keys)) return
  const cleanKeys = keys.map(k => k.trim()).filter(k => k.length > 0)
  localStorage.setItem(GEMINI_KEY_STORAGE, JSON.stringify(cleanKeys))
}

/**
 * Add a new Gemini API key.
 * @param {string} key 
 */
export function addGeminiKey(key) {
  const keys = getGeminiKeys()
  if (key && !keys.includes(key.trim())) {
    keys.push(key.trim())
    saveGeminiKeys(keys)
  }
}

/**
 * Remove a Gemini API key.
 * @param {string} key 
 */
export function removeGeminiKey(key) {
  const keys = getGeminiKeys()
  const updated = keys.filter(k => k !== key)
  saveGeminiKeys(updated)
}

/**
 * Main wrapper for Gemini API calls with automatic rotation.
 * @param {Function} apiCallFn - A function that takes an apiKey and returns a promise
 * @returns {Promise<any>}
 */
export async function callGeminiWithRotation(apiCallFn) {
  const keys = getGeminiKeys()
  
  if (keys.length === 0) {
    throw new Error('No Gemini API keys configured. Please add one in Settings.')
  }

  let finalError = null

  // Try each key in order
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    try {
      return await apiCallFn(key)
    } catch (err) {
      console.warn(`Gemini call failed with key ${i + 1}/${keys.length}:`, err.message)
      
      // If it's a rate limit (429) or other temporary issue, try the next key
      const isRateLimit = err.message.includes('429') || err.message.includes('rate limit') || err.message.includes('quota')
      const isAuthError = err.message.includes('401') || err.message.includes('403') || err.message.includes('invalid')

      if (isRateLimit && i < keys.length - 1) {
        console.info('Switching to next Gemini API key...')
        continue
      }
      
      // If it's an auth error, we might want to skip it too, but let's be careful
      if (isAuthError && i < keys.length - 1) {
        console.error('Invalid Gemini key detected, trying next...')
        continue
      }

      // If it's the last key or not a retryable error, throw it
      finalError = err
      break
    }
  }

  throw finalError || new Error('Gemini API call failed using all available keys.')
}
