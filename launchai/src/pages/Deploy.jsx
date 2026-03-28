import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { Rocket, CheckCircle, Globe, Share2, Copy, ArrowRight, ExternalLink, Loader } from 'lucide-react'

export default function Deploy() {
  const navigate = useNavigate()
  const [isDeploying, setIsDeploying] = useState(true)
  const [copied, setCopied] = useState(false)

  // Simulation of deployment process
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDeploying(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText('https://launchai.app/p/invoice-analyzer-9x2')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
                      Successfully deployed to the global edge network. Anyone with the link can now use your AI app.
                    </p>
                    
                    <div className="flex items-stretch gap-2 mb-4">
                      <div className="flex-1 bg-void border border-base rounded-[8px] px-4 py-3 flex items-center gap-3">
                        <Globe size={14} className="text-text-muted" />
                        <span className="font-mono text-[13px] text-secondary truncate">launchai.app/p/invoice-analyzer-9x2</span>
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
                        href="#" 
                        className="btn-primary px-6 py-2.5 rounded-[7px] text-[13px]"
                        onClick={(e) => e.preventDefault()}
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
                    You can now embed this widget on your own website, or use our API to integrate it directly into your existing workflow. 
                    <button className="text-accent hover:underline ml-1">View documentation →</button>
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
