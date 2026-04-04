import { useState } from 'react'
import { Sparkles, MessageSquare, Code, Cpu, ArrowRight, Loader } from 'lucide-react'
import { API_BASE } from '../lib/config'

/**
 * AiDemo.jsx 
 * Sleek, interactive component demonstrating AI capabilities.
 */
export default function AiDemo() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleTest = async () => {
    if (!prompt.trim() || loading) return
    setLoading(true)
    setResult(null)

    try {
      // Direct fetch using the centralized API_BASE
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: 'gemini-2.5-flash' })
      })

      const data = await response.json()
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setResult(data.candidates[0].content.parts[0].text)
      } else {
        setResult('AI response received but no text found.')
      }
    } catch (err) {
      console.error('Demo error:', err)
      setResult('Failed to connect to AI backend. Ensure server is running on ' + API_BASE)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-premium p-8 max-w-2xl mx-auto border border-glow shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles size={120} className="text-accent" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent-dim flex items-center justify-center text-accent ring-1 ring-glow">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-primary tracking-tight">AI Engine Demo</h2>
            <p className="font-body text-sm text-secondary">Test the core generation engine in real-time.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to test the AI proxy..."
              className="w-full h-32 bg-void/50 border-base rounded-xl p-4 font-body text-primary focus:border-accent/40 transition-all outline-none resize-none placeholder:text-text-muted"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">v2.5 Flash</span>
            </div>
          </div>

          <button
            onClick={handleTest}
            disabled={loading || !prompt.trim()}
            className="w-full btn-primary h-12 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <>
                <MessageSquare size={18} />
                Generate Response
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {result && (
            <div className="animate-fade-up">
              <div className="flex items-center gap-2 mb-2">
                <Code size={14} className="text-accent" />
                <span className="font-mono text-[11px] text-accent uppercase tracking-wider font-bold">Generated Output</span>
              </div>
              <div className="p-5 bg-overlay/80 border border-base rounded-xl font-body text-sm text-primary leading-relaxed whitespace-pre-line shadow-inner max-h-64 overflow-y-auto">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
