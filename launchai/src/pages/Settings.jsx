import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { Key, Shield, Info, CheckCircle, XCircle, Trash2, ArrowRight } from 'lucide-react'

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [saved, setSaved] = useState(false)
  
  // Load existing keys from localStorage on mount
  useEffect(() => {
    const gKey = localStorage.getItem('VITE_GOOGLE_API_KEY') || ''
    const aKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY') || ''
    setGeminiKey(gKey)
    setAnthropicKey(aKey)
  }, [])

  function saveKeys() {
    localStorage.setItem('VITE_GOOGLE_API_KEY', geminiKey.trim())
    localStorage.setItem('VITE_ANTHROPIC_API_KEY', anthropicKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    
    // Refresh page to apply keys
    window.location.reload()
  }

  function clearKeys() {
    localStorage.removeItem('VITE_GOOGLE_API_KEY')
    localStorage.removeItem('VITE_ANTHROPIC_API_KEY')
    setGeminiKey('')
    setAnthropicKey('')
    window.location.reload()
  }

  const isGeminiActive = geminiKey.length > 5 || import.meta.env.VITE_GOOGLE_API_KEY
  const isAnthropicActive = anthropicKey.length > 5 || import.meta.env.VITE_ANTHROPIC_API_KEY

  return (
    <div className="min-h-screen bg-void font-body flex flex-col">
      <Navbar minimal />
      <Sidebar />

      <main className="ml-[220px] pt-[76px] px-8 py-8 flex flex-col min-h-screen">
        <div className="max-w-[700px] mx-auto w-full">
          <div className="mb-[32px]">
            <h1 className="font-display text-[28px] font-semibold text-primary mb-1 tracking-[-0.03em]">Settings</h1>
            <p className="font-body text-[14px] text-secondary">
              Configure your AI API keys to move from demo mode to live AI.
            </p>
          </div>

          <div className="space-y-6">
            {/* Guide Card */}
            <div className="companion-card p-4 border-accent/20 bg-accent/[0.04] flex items-start gap-4 animate-fade-up">
              <div className="w-[32px] h-[32px] rounded-[8px] bg-accent-dim border border-glow flex items-center justify-center flex-shrink-0">
                <Info size={16} className="text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-[15px] font-semibold text-primary mb-1">Need an API Key?</h3>
                <p className="font-body text-[13px] text-secondary leading-[1.6] mb-3">
                  Google Gemini has a generous free tier for developers. We've created a step-by-step guide to help you get started.
                </p>
                <a 
                  href="/AI_SETUP.md" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[13px] text-accent font-medium hover:text-accent-hover transition-colors"
                >
                  View Setup Guide <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* API Keys Card */}
            <div className="companion-card p-6 space-y-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-2">
                <Key size={18} className="text-accent" />
                <h2 className="font-display text-[18px] font-semibold text-primary">AI API Keys</h2>
              </div>

              {/* Gemini Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-body text-[13px] font-medium text-secondary">Google Gemini Key (Free Tier)</label>
                  <div className="flex items-center gap-1.5">
                    {isGeminiActive ? (
                      <span className="flex items-center gap-1 text-[11px] text-[#10b981] font-medium">
                        <CheckCircle size={10} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-text-muted font-medium">
                        <XCircle size={10} /> Demo Mode
                      </span>
                    )}
                  </div>
                </div>
                <input 
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="input w-full"
                />
              </div>

              {/* Anthropic Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-body text-[13px] font-medium text-secondary">Anthropic Claude Key (Premium)</label>
                  <div className="flex items-center gap-1.5">
                    {isAnthropicActive ? (
                      <span className="flex items-center gap-1 text-[11px] text-[#10b981] font-medium">
                        <CheckCircle size={10} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-text-muted font-medium">
                        <XCircle size={10} /> Demo Mode
                      </span>
                    )}
                  </div>
                </div>
                <input 
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-api03..."
                  className="input w-full"
                />
              </div>

              <div className="pt-4 border-t border-dim flex items-center justify-between">
                <button
                  onClick={clearKeys}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] text-secondary hover:text-danger transition-colors"
                >
                  <Trash2 size={14} /> Clear All
                </button>
                <button
                  onClick={saveKeys}
                  className={`btn-primary px-8 py-2.5 rounded-[7px] text-[13px] ${saved ? 'bg-[#10b981] hover:bg-[#059669]' : ''}`}
                >
                  {saved ? 'Saved!' : 'Save & Refresh'}
                </button>
              </div>
            </div>

            {/* Privacy Card */}
            <div className="companion-card p-4 flex items-start gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
              <div className="w-[32px] h-[32px] rounded-[8px] bg-muted border border-base flex items-center justify-center flex-shrink-0">
                <Shield size={16} className="text-secondary" />
              </div>
              <div className="flex-1 text-[12px] text-text-muted leading-[1.6]">
                <strong className="text-secondary block mb-0.5">Privacy First</strong>
                Your keys are stored only in your browser's local storage. They never touch our servers. Refresh the page after saving to apply changes.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
