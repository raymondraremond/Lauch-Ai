import { callAI, getUserCredits } from '../lib/AIClient.js'
import { AI_MODELS } from '../lib/AIConfig.js'

export default function LiveApp() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // App state
  const [values, setValues] = useState({})
  const [outputs, setOutputs] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [credits, setCredits] = useState(null)

  useEffect(() => {
    getUserCredits().then(setCredits)
  }, [])

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true)
        const p = await getProjectById(id)
        if (p) {
          setProject(p)
          // Initialize values
          const initial = {}
          p.components?.forEach(c => {
            const key = String(c.id)
            if (c.type === 'toggle') initial[key] = false
            else if (c.type === 'dropdown') initial[key] = 'Option 1'
            else initial[key] = ''
          })
          setValues(initial)
        } else {
          setError('Project not found')
        }
      } catch (err) {
        setError('Failed to load project')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadProject()
  }, [id])

  async function handleRun() {
    if (!project || isProcessing) return
    setIsProcessing(true)

    // Note: callGeminiWithRotation handles key retrieval and checking

    try {
      const newOutputs = { ...outputs }
      
      // 1. Create variable map from current inputs
      const varMap = {}
      project.components.forEach(c => {
        if (c.variableId) {
          varMap[c.variableId] = values[c.id] || (c.type === 'toggle' ? 'No' : '')
        }
      })

      // 2. Identify AI blocks that need processing
      const aiBlocks = project.components.filter(c => c.systemPrompt)

      for (const block of aiBlocks) {
        // Parse prompt: Replace {{var}} with values
        let parsedPrompt = block.systemPrompt
        let imagePart = null

        Object.keys(varMap).forEach(key => {
          const comp = project.components.find(c => c.variableId === key)
          if (comp && comp.type === 'file-upload' && values[comp.id]?.data) {
            // If the variable is a file-upload, we'll attach it as inline_data
            // and replace the text placeholder with "[Attached File]"
            imagePart = {
              inline_data: {
                mime_type: values[comp.id].type,
                data: values[comp.id].data.split(',')[1]
              }
            }
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
            parsedPrompt = parsedPrompt.replace(regex, `[Uploaded Image: ${values[comp.id].name}]`)
          } else {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
            parsedPrompt = parsedPrompt.replace(regex, varMap[key])
          }
        })

        // Call Backend AI
        const data = await callAI({
          parts,
          model: AI_MODELS.DEFAULT_GENERATION
        })

        if (data.error) throw new Error(data.error)
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (result) {
          newOutputs[block.id] = result
          if (data.remainingCredits !== undefined) setCredits(data.remainingCredits)
        }
      }

      setOutputs(newOutputs)
    } catch (err) {
      console.error('Logic Engine Error:', err)
      alert(`Generation Failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <Loader2 className="text-accent animate-spin" size={32} />
    </div>
  )

  if (error || !project) return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center mb-6">
        <Zap className="text-danger rotate-180" size={32} />
      </div>
      <h1 className="font-display text-2xl font-bold text-primary mb-2">Oops! Link Expired</h1>
      <p className="text-secondary max-w-sm mb-8">This AI project could not be found or has been moved. Check the URL and try again.</p>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary">Back to Safety</button>
    </div>
  )

  return (
    <div className="min-h-screen bg-void font-body text-secondary selection:bg-accent/30 selection:text-white">
      {/* Mini Header / Branding */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-void/80 backdrop-blur-md z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-[#7c3aed] flex items-center justify-center shadow-lg shadow-accent/20">
            <Zap size={16} className="text-white" fill="currentColor" />
          </div>
          <span className="font-display font-bold tracking-tight text-primary">LaunchAI <span className="text-accent">Live</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-[13px] hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft size={14} /> My Dashboard
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
             <Zap size={12} className="text-accent" fill="currentColor" />
             <span className="font-mono text-[11px] font-bold text-accent uppercase tracking-wider">{credits !== null ? `${credits} CR` : '--'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-24 px-6 max-w-[640px] mx-auto">
        <div className="animate-fade-up">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono uppercase tracking-widest mb-4">
              <Sparkles size={12} /> Powered by LaunchAI
            </div>
            <h1 className="font-display text-4xl font-bold text-primary mb-3 tracking-tight">{project.name}</h1>
            <p className="text-[15px] leading-relaxed text-secondary opacity-80">{project.desc}</p>
          </div>

          <div className="card-premium p-8 relative overflow-hidden">
            {/* Mesh Glow Background */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#7c3aed]/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {project.components?.map(c => (
                <div key={c.id} className="space-y-2">
                  <label className="block text-[13px] font-medium text-primary/80 uppercase tracking-wider">{c.label}</label>
                  
                  {c.type === 'text-input' && (
                    <input 
                      type="text" 
                      className="input w-full bg-void/50 border-white/10 focus:border-accent/40 placeholder:text-white/20 transition-all py-3 px-4"
                      placeholder="Type something..."
                      value={values[c.id] || ''}
                      onChange={(e) => setValues({...values, [c.id]: e.target.value})}
                    />
                  )}

                  {c.type === 'textarea' && (
                    <textarea 
                      className="input w-full bg-void/50 border-white/10 focus:border-accent/40 placeholder:text-white/20 transition-all py-3 px-4 min-h-[100px] resize-none"
                      placeholder="Describe your request..."
                      value={values[c.id] || ''}
                      onChange={(e) => setValues({...values, [c.id]: e.target.value})}
                    />
                  )}

                  {c.type === 'toggle' && (
                    <button 
                      onClick={() => setValues({...values, [c.id]: !values[c.id]})}
                      className="flex items-center gap-3 group"
                    >
                      <div className={`w-11 h-6 rounded-full transition-all flex items-center px-1 ${values[c.id] ? 'bg-accent shadow-[0_0_12px_rgba(59,130,246,0.3)]' : 'bg-white/10'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${values[c.id] ? 'translate-x-5' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        {values[c.id] ? 'Enabled' : 'Disabled'}
                      </span>
                    </button>
                  )}

                  {c.type === 'dropdown' && (
                    <div className="relative group">
                      <select 
                        className="w-full bg-void/50 border border-white/10 rounded-xl py-3 px-4 text-[14px] text-primary appearance-none focus:border-accent/40 outline-none transition-all cursor-pointer"
                        value={values[c.id] || ''}
                        onChange={(e) => setValues({...values, [c.id]: e.target.value})}
                      >
                        <option className="bg-void">Option 1</option>
                        <option className="bg-void">Option 2</option>
                        <option className="bg-void">Option 3</option>
                        <option className="bg-void">Other...</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-[18px] text-text-muted pointer-events-none group-hover:text-primary transition-colors" />
                    </div>
                  )}

                  {c.type === 'weather-card' && (() => {
                    const cityInput = project.components.find(comp => comp.variableId === 'city' || comp.variableId === 'location')
                    const cityName = (cityInput && values[cityInput.id]) || 'San Francisco, CA'
                    
                    return (
                      <div className="p-5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-3xl font-display font-medium text-primary">24°C</span>
                          <span className="text-[12px] text-secondary uppercase tracking-widest mt-1 opacity-70">{cityName}</span>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-accent-dim flex items-center justify-center border border-glow">
                          <Cloud size={28} className="text-accent" />
                        </div>
                      </div>
                    )
                  })()}

                  {c.type === 'api-status' && (
                    <div className="p-4 border border-success/20 bg-success/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="font-mono text-xs text-success uppercase tracking-widest font-bold">Systems Operational</span>
                      </div>
                      <span className="text-[11px] font-mono text-success/60">LATENCY: 42MS</span>
                    </div>
                  )}

                  {c.type === 'chart' && (
                    <div className="p-5 border border-white/5 bg-black/20 rounded-2xl">
                      <div className="flex items-end gap-3 h-[100px] px-2 mb-2">
                        <div className="flex-1 bg-white/5 h-[40%] rounded-t-sm group-hover:bg-accent/40 transition-colors" />
                        <div className="flex-1 bg-white/5 h-[70%] rounded-t-sm group-hover:bg-accent/40 transition-colors" />
                        <div className="flex-1 bg-accent/40 h-[100%] rounded-t-sm" />
                        <div className="flex-1 bg-white/5 h-[60%] rounded-t-sm group-hover:bg-accent/40 transition-colors" />
                        <div className="flex-1 bg-white/5 h-[30%] rounded-t-sm group-hover:bg-accent/40 transition-colors" />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-text-muted uppercase tracking-tighter">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                      </div>
                    </div>
                  )}
                  {c.type === 'file-upload' && (() => {
                    const fileInputRef = React.useRef(null)
                    
                    const handleFileChange = (e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setValues({
                          ...values, 
                          [c.id]: {
                            name: file.name,
                            type: file.type,
                            data: reader.result
                          }
                        })
                      }
                      reader.readAsDataURL(file)
                    }

                    return (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="group border-2 border-dashed border-white/10 bg-void/30 p-8 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:bg-white/5 hover:border-accent/40 cursor-pointer"
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        <div className="w-12 h-12 rounded-full bg-accent-dim flex items-center justify-center ring-4 ring-void group-hover:ring-accent/10 transition-all">
                          <UploadCloud size={24} className="text-accent" />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-primary mb-1">Click or Drag to Upload</div>
                          <div className="text-[11px] text-text-muted">Maximum file size: 10MB</div>
                        </div>
                        {values[c.id] && (
                          <div className="mt-2 py-1 px-3 bg-accent/20 border border-accent/30 rounded-full flex items-center gap-2">
                            <Check size={12} className="text-accent" />
                            <span className="text-[11px] font-mono text-accent uppercase tracking-widest">{values[c.id].name}</span>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {c.type === 'structured-result' && (
                    <div className="p-5 border border-white/5 bg-black/20 rounded-2xl space-y-4">
                       {outputs[c.id] ? (
                         <div className="animate-fade-in text-[14px] leading-relaxed text-primary/90 whitespace-pre-wrap">
                           {outputs[c.id]}
                         </div>
                       ) : (
                         <div className="space-y-3 opacity-20">
                            <div className="h-2 w-full bg-white/20 rounded-full" />
                            <div className="h-2 w-[80%] bg-white/20 rounded-full" />
                            <div className="h-2 w-[40%] bg-white/20 rounded-full" />
                         </div>
                       )}
                    </div>
                  )}

                  {c.type === 'ai-chat' && (
                    <div className="p-4 border border-accent/20 bg-accent/5 rounded-2xl flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-accent font-mono text-[10px] uppercase tracking-widest font-bold">
                        <MessageSquare size={12} /> AI Dialogue Window
                      </div>
                      <div className="h-[200px] rounded-xl bg-void/40 border border-white/5 p-4 overflow-y-auto">
                        {outputs[c.id] ? (
                          <div className="flex flex-col gap-3">
                            <div className="self-end bg-accent/10 border border-accent/20 rounded-lg rounded-tr-none p-2 text-xs text-secondary">
                              Prompt: {c.label}
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg rounded-tl-none p-2 text-[13px] text-primary/90 animate-fade-in whitespace-pre-wrap">
                              {outputs[c.id]}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-text-muted text-center mt-8">Waiting for input to process...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-6">
                <button 
                  onClick={handleRun}
                  disabled={isProcessing}
                  className="w-full btn-primary h-14 relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-accent via-white/20 to-[#7c3aed] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 opacity-20" />
                  <span className="relative z-10 flex items-center justify-center gap-3 text-sm font-bold tracking-wide uppercase">
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <>Generate Analysis <Zap size={18} fill="currentColor" /></>}
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          <footer className="mt-16 text-center space-y-4">
             <p className="text-[11px] text-text-muted tracking-widest uppercase font-mono">Build yours at <a href="/" className="text-secondary hover:text-accent transition-colors">LaunchAI.app</a></p>
             <div className="flex items-center justify-center gap-4 text-xs font-medium text-secondary/40">
                <span>Privacy</span>
                <span>•</span>
                <span>Terms</span>
                <span>•</span>
                <span>Report Abuse</span>
             </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
