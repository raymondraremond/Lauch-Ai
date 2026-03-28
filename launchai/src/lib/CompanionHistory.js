/**
 * CompanionHistory.js
 * LocalStorage-backed session history for the AI Build Companion.
 * Stores past submissions, results, and metadata.
 */

const STORAGE_KEY = 'launchai_companion_history'
const MAX_ENTRIES = 20

/**
 * Get all history entries, newest first.
 * @returns {Array<{ id: string, timestamp: number, input: string, contentType: string, mode: string, result: string, provider: string }>}
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const entries = JSON.parse(raw)
    return entries.sort((a, b) => b.timestamp - a.timestamp)
  } catch {
    return []
  }
}

/**
 * Save a new history entry.
 */
export function saveToHistory({ input, contentType, mode, result, provider }) {
  try {
    const entries = getHistory()
    const entry = {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      input: input.substring(0, 500), // Truncate for storage
      contentType,
      mode,
      result: result.substring(0, 3000), // Truncate for storage
      provider,
    }
    entries.unshift(entry)
    // Keep only the latest N entries
    const trimmed = entries.slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    return entry
  } catch {
    return null
  }
}

/**
 * Delete a history entry by ID.
 */
export function deleteFromHistory(id) {
  try {
    const entries = getHistory().filter(e => e.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // noop
  }
}

/**
 * Clear all history.
 */
export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Format a timestamp into a human-readable relative time.
 */
export function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Get the mode label for display.
 */
export function getModeLabel(mode) {
  const labels = {
    diagnose: '🔍 Diagnose',
    improve: '✨ Improve',
    explain: '💡 Explain',
    nextsteps: '📋 Next Steps',
    finish: '🏁 Finish It',
  }
  return labels[mode] || mode
}
