import { getGeminiKeys, saveGeminiKeys } from '../lib/ApiKeyManager.js'
import { getUserCredits } from '../lib/AIClient.js'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, CreditCard, ChevronRight, Zap } from 'lucide-react'

export default function SettingsPage() {
  const [geminiKeys, setGeminiKeys] = useState([])
  const [newGeminiKey, setNewGeminiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [credits, setCredits] = useState(null)
  const { profile } = useAuth()
  
  // Load existing keys and credits
  useEffect(() => {
    const gKeys = getGeminiKeys()
    const aKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY') || ''
    setGeminiKeys(gKeys)
    setAnthropicKey(aKey)
    getUserCredits().then(setCredits)
  }, [])

  function addGeminiKey() {
    if (!newGeminiKey.trim()) return
    const updated = [...geminiKeys, newGeminiKey.trim()]
    setGeminiKeys(updated)
    setNewGeminiKey('')
  }

  function removeGeminiKey(index) {
    const updated = geminiKeys.filter((_, i) => i !== index)
    setGeminiKeys(updated)
  }

  function saveKeys() {
    saveGeminiKeys(geminiKeys)
    localStorage.setItem('VITE_ANTHROPIC_API_KEY', anthropicKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    
    // Refresh page to apply keys
    window.location.reload()
  }

  function clearKeys() {
    localStorage.removeItem('VITE_GOOGLE_API_KEY')
    localStorage.removeItem('VITE_ANTHROPIC_API_KEY')
    setGeminiKeys([])
    setAnthropicKey('')
    window.location.reload()
  }

  const isGeminiActive = geminiKeys.length > 0 || !!import.meta.env.VITE_GOOGLE_API_KEY
  const isAnthropicActive = anthropicKey.length > 5 || !!import.meta.env.VITE_ANTHROPIC_API_KEY

  return (
    <div className="min-h-screen bg-void font-body flex flex-col">
      <Navbar minimal />
      <Sidebar />

      <main className="ml-[220px] pt-[76px] px-8 py-8 flex flex-col min-h-screen">
        <div className="max-w-[700px] mx-auto w-full">
          <div className="mb-[32px]">
            <h1 className="font-display text-[28px] font-semibold text-primary mb-1 tracking-[-0.03em]">Settings</h1>
            <p className="font-body text-[14px] text-secondary">
              Manage your AI infrastructure, credits, and security.
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Credits & Billing Card */}
            <div className="companion-card overflow-hidden animate-fade-up">
              <div className="p-6 bg-gradient-to-br from-accent/5 to-transparent">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-[36px] h-[36px] rounded-[10px] bg-accent/10 border border-accent/20 flex justify-center items-center">
                      <CreditCard size={18} className="text-accent" />
                    </div>
                    <div>
                      <h2 className="font-display text-[17px] font-semibold text-primary">Credits & Billing</h2>
                      <p className="text-[12px] text-secondary opacity-70 uppercase tracking-widest font-mono mt-0.5">Paystack Gateway • NGN</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Available Credits</span>
                    <div className="flex items-center gap-2 px-4 py-2 bg-void/50 border border-glow rounded-xl">
                      <Zap size={14} className="text-accent" fill="currentColor" />
                      <span className="font-display text-xl font-bold text-primary">{credits !== null ? credits : '--'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-accent/40 transition-all text-left">
                    <div>
                      <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-1">Standard Pack</p>
                      <p className="font-display font-bold text-primary">50 Credits</p>
                      <p className="text-[13px] text-accent font-medium">₦2,500.00</p>
                    </div>
                    <ChevronRight size={18} className="text-secondary opacity-30" />
                  </button>
                  <button className="flex items-center justify-between p-4 rounded-xl bg-accent text-white hover:scale-[1.02] active:scale-[0.98] transition-all text-left shadow-lg shadow-accent/20">
                    <div>
                      <p className="text-xs font-mono text-white/60 uppercase tracking-wider mb-1">Power Pack</p>
                      <p className="font-display font-bold text-white">200 Credits</p>
                      <p className="text-[13px] font-medium text-white/90">₦7,500.00</p>
                    </div>
                    <Zap size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 bg-void/30 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] text-secondary">
                  <Sparkles size={12} className="text-accent" />
                  <span>Credits are used for AI Audit & Copilot actions.</span>
                </div>
                <button className="text-[11px] font-mono text-accent uppercase tracking-widest font-bold hover:underline">View History</button>
              </div>
            </div>
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

              {/* Gemini Keys Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-body text-[13px] font-medium text-secondary">Google Gemini Keys (Auto-Rotation Enabled)</label>
                  <div className="flex items-center gap-1.5">
                    {isGeminiActive ? (
                      <span className="flex items-center gap-1 text-[11px] text-[#10b981] font-medium">
                        <CheckCircle size={10} /> {geminiKeys.length} Key{geminiKeys.length !== 1 ? 's' : ''} Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-text-muted font-medium">
                        <XCircle size={10} /> Demo Mode
                      </span>
                    )}
                  </div>
                </div>

                {/* Key List */}
                <div className="space-y-2">
                  {geminiKeys.map((key, idx) => (
                    <div key={idx} className="flex items-center gap-2 group">
                      <div className="flex-1 px-4 py-2.5 bg-void/50 border border-base rounded-[8px] font-mono text-[12px] text-secondary flex items-center justify-between">
                        <span className="opacity-50">••••••••{key.slice(-4)}</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-[#10b981] opacity-50" />
                          <button 
                            onClick={() => removeGeminiKey(idx)}
                            className="p-1 hover:text-danger transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Key Input */}
                  <div className="flex gap-2">
                    <input 
                      type="password"
                      value={newGeminiKey}
                      onChange={(e) => setNewGeminiKey(e.target.value)}
                      placeholder="Add another Gemini API key (AIzaSy...)"
                      className="input flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && addGeminiKey()}
                    />
                    <button 
                      onClick={addGeminiKey}
                      disabled={!newGeminiKey.trim()}
                      className="px-4 bg-accent-dim border border-glow rounded-[8px] text-accent hover:bg-accent/20 transition-all disabled:opacity-50"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <p className="text-[11px] text-text-muted italic">
                    LaunchAI will automatically rotate to the next key if one hits a rate limit.
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-dim w-full" />

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
                <strong className="text-secondary block mb-0.5">Secure AI Infrastructure</strong>
                To protect your wallet and prevent API leaks, all AI generations are now proxied through our secure backend. Refresh the page after saving to apply changes.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
