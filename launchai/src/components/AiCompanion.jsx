import { useState } from 'react'
import { Sparkles, MessageSquare, Code, Cpu, ArrowRight, Loader, Zap, Search, Wand2, Lightbulb } from 'lucide-react'
import { API_BASE } from '../lib/config'

/**
 * AiCompanion.jsx
 * Interactive component representing the Build Companion feature.
 */
export default function AiCompanion() {
  const [activeTab, setActiveTab] = useState('diagnose')
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  const MODES = [
    { id: 'diagnose', label: 'Diagnose', icon: Search, color: 'text-accent' },
    { id: 'improve', label: 'Improve', icon: Wand2, color: 'text-purple-400' },
    { id: 'explain', label: 'Explain', icon: Lightbulb, color: 'text-amber-400' }
  ]

  const handleAnalyze = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Analyze the following code from the perspective of ${activeTab}:\n\n${input}`, 
          model: 'gemini-2.5-flash' 
        })
      })

      const data = await response.json()
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setResult(data.candidates[0].content.parts[0].text)
      } else {
        setResult('AI Companion result received but no text found.')
      }
    } catch (err) {
      console.error('Companion error:', err)
      setResult('Failed to analyze. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-premium p-6 border border-glow shadow-xl animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-accent" />
        <h3 className="font-display text-lg font-bold text-primary">Build Companion</h3>
      </div>

      <div className="flex gap-2 mb-4 p-1 bg-void/50 rounded-lg border border-base">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveTab(mode.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all font-body text-xs
                        ${activeTab === mode.id ? 'bg-accent text-white shadow-lg' : 'text-secondary hover:text-primary hover:bg-overlay'}`}
          >
            <mode.icon size={14} className={activeTab === mode.id ? 'text-white' : mode.color} />
            {mode.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your AI output here to analyze..."
          className="w-full h-32 bg-void/30 border-base rounded-xl p-4 font-mono text-xs text-primary focus:border-accent/40 transition-all outline-none resize-none placeholder:text-text-muted"
        />

        <button
          onClick={handleAnalyze}
          disabled={loading || !input.trim()}
          className="w-full btn-primary h-10 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <>
              <Zap size={14} />
              Run {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </>
          )}
        </button>

        {result && (
          <div className="p-4 bg-overlay/50 border border-base rounded-xl font-body text-xs text-primary leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto shadow-inner animate-in fade-in slide-in-from-top-2">
            {result}
          </div>
        )}
      </div>
    </div>
  )
}
