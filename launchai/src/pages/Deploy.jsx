import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { Rocket, CheckCircle, Globe, Share2, Copy, ArrowRight, ExternalLink, Loader, Sparkles, MessageSquare } from 'lucide-react'
import { getProjectById, saveProject } from '../lib/ProjectStore.js'

export default function Deploy() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const [showCritiqueGate, setShowCritiqueGate] = useState(true) // show gate first
  const [isDeploying, setIsDeploying] = useState(false)
  const [copied, setCopied] = useState(false)
  const [project, setProject] = useState(null)

  // Pre-load project name for the gate UI
  useEffect(() => {
    if (id) getProjectById(id).then(p => { if (p) setProject(p) })
  }, [id])

  function startDeployment() {
    setShowCritiqueGate(false)
    setIsDeploying(true)
    if (id) {
      async function deployFlow() {
        try {
          const p = await getProjectById(id)
          if (p) {
            setProject(p)
            setTimeout(async () => {
              try {
                await saveProject({ ...p, status: 'live' })
                setIsDeploying(false)
              } catch (err) {
                console.error('Failed to update project status:', err)
                setIsDeploying(false)
              }
            }, 2500)
          } else {
            setIsDeploying(false)
          }
        } catch (err) {
          console.error('Failed to fetch project:', err)
          setIsDeploying(false)
        }
      }
      deployFlow()
    } else {
      setIsDeploying(false)
    }
  }

  const liveUrl = `${window.location.origin}/p/${id}`

  function handleCopy() {
    navigator.clipboard.writeText(liveUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Critique Gate ──────────────────────────────────────────────────────────
  if (showCritiqueGate) {
    return (
      <div className="min-h-screen bg-void font-body flex flex-col">
        <Navbar minimal />
        <Sidebar />
        <main className="ml-[220px] pt-[76px] px-8 flex items-center justify-center min-h-screen">
          <div className="max-w-[520px] w-full animate-fade-up">
            <div className="card-premium p-10 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
              <div className="w-[64px] h-[64px] rounded-[16px] bg-gradient-to-br from-accent to-[#7c3aed] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/25">
                <Sparkles size={28} className="text-white" />
              </div>
              <h1 className="font-display text-[26px] font-semibold text-primary mb-3 tracking-[-0.03em]">
                Ready to ship{project?.name ? ` "${project.name}"` : ''}?
              </h1>
              <p className="font-body text-[14px] text-secondary leading-[1.7] mb-8 max-w-[380px] mx-auto">
                Before you go live, an <strong className="text-primary font-medium">AI Critique</strong> can
                catch market fit issues, UX gaps, and missed opportunities — before your users do.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/critique?prefill=${encodeURIComponent(project?.name || '')}`)}
                  className="w-full btn-primary py-3 text-[14px] flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Get an AI Critique first
                  <span className="ml-1 font-mono text-[10px] bg-white/15 px-2 py-0.5 rounded-full uppercase tracking-wider">recommended</span>
                </button>
                <button
                  onClick={startDeployment}
                  className="w-full py-3 rounded-[8px] border border-base bg-raised text-[13px] text-secondary hover:text-primary hover:border-lit transition-all font-body"
                >
                  Deploy anyway →
                </button>
              </div>

              <p className="mt-6 font-body text-[11px] text-text-muted">
                Critiques take ~30 seconds and use 1–3 credits.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-void font-body flex flex-col">
      <Navbar minimal />
      <Sidebar />

      <main className="ml-[220px] pt-[76px] px-8 py-8 flex flex-col min-h-screen">
        <div className="max-w-[800px] mx-auto w-full">
          <div className="mb-[32px] animate-fade-up">
            <h1 className="font-display text-[28px] font-semibold text-primary mb-1 tracking-[-0.03em]">Deployment</h1>
            <p className="font-body text-[14px] text-secondary">Manage your live project and share it with the world.</p>
          </div>

          {isDeploying ? (
            <div className="card-premium p-12 flex flex-col items-center justify-center text-center animate-fade-up">
              <div className="w-[64px] h-[64px] rounded-[16px] bg-accent-dim border border-glow flex items-center justify-center mb-6">
                <Loader size={24} className="text-accent animate-spin" />
              </div>
              <h2 className="font-display text-[20px] font-semibold text-primary mb-2">Publishing your project...</h2>
              <p className="font-body text-[14px] text-secondary max-w-[320px]">
                We're optimizing your assets and pushing your logic to the edge. This usually takes a few seconds.
              </p>
              
              <div className="mt-8 w-full max-w-[400px]">
                <div className="h-[4px] w-full bg-base rounded-full overflow-hidden">
                  <div className="h-full bg-accent animate-progress"></div>
                </div>
                <div className="flex justify-between mt-2 font-mono text-[10px] text-text-muted uppercase tracking-[0.05em]">
                  <span>Optimizing</span>
                  <span>75%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Card */}
              <div className="card-premium p-8 animate-fade-up">
                <div className="flex items-start gap-6">
                  <div className="w-[56px] h-[56px] rounded-[14px] bg-[#10b9811a] border border-[#10b98133] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#10b9810d]">
                    <CheckCircle size={24} className="text-[#10b981]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-[20px] font-semibold text-primary mb-1">Your project is live!</h2>
                    <p className="font-body text-[14px] text-secondary mb-6">
                      Successfully deployed. Anyone with the link can now use your AI app — powered by Gemini.
                    </p>
                    
                    <div className="flex items-stretch gap-2 mb-4">
                      <div className="flex-1 bg-void border border-base rounded-[8px] px-4 py-3 flex items-center gap-3">
                        <Globe size={14} className="text-text-muted" />
                        <span className="font-mono text-[13px] text-secondary truncate">{liveUrl.replace('http://', '').replace('https://', '')}</span>
                      </div>
                      <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-base border border-base rounded-[8px] hover:border-lit hover:bg-white/5 transition-all text-secondary hover:text-primary text-[13px] font-medium"
                      >
                        {copied ? <CheckCircle size={14} className="text-[#10b981]" /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <a 
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary px-6 py-2.5 rounded-[7px] text-[13px]"
                      >
                        Visit Live App <ExternalLink size={14} />
                      </a>
                      <button className="flex items-center gap-2 text-[13px] text-secondary hover:text-primary transition-colors font-medium">
                        <Share2 size={14} /> Share Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
                <div className="card p-5">
                  <p className="font-mono text-[10px] text-text-muted uppercase tracking-[0.05em] mb-3">Deployment Status</p>
                  <div className="flex items-center gap-3">
                    <div className="w-[8px] h-[8px] rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    <span className="font-body text-[15px] font-medium text-primary">Healthy</span>
                  </div>
                </div>
                <div className="card p-5">
                  <p className="font-mono text-[10px] text-text-muted uppercase tracking-[0.05em] mb-3">Response Time</p>
                  <div className="flex items-center gap-3 text-primary">
                    <span className="font-body text-[15px] font-medium">124ms</span>
                    <span className="text-[12px] text-success">Optimal</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="card-premium p-5 flex items-start gap-4 animate-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="w-[32px] h-[32px] rounded-[8px] bg-accent-dim border border-glow flex items-center justify-center flex-shrink-0">
                  <Rocket size={15} className="text-accent" />
                </div>
                <div className="flex-1">
                  <h4 className="font-body text-[13px] font-semibold text-primary mb-1 tracking-[-0.01em]">Next Steps</h4>
                  <p className="font-body text-[12px] text-secondary leading-[1.6]">
                    Share the link above with your users. Want deeper feedback on the product? 
                    <button onClick={() => navigate('/critique')} className="text-accent hover:underline ml-1">Run a critique →</button>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-[13px] text-text-muted hover:text-secondary transition-colors mt-8"
              >
                <ArrowRight size={14} className="rotate-180" /> Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
