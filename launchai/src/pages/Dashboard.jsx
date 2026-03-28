import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { Plus, Zap, TrendingUp, Clock, ArrowRight, ExternalLink, Trash2, MoreHorizontal, Compass, Sparkles } from 'lucide-react'
import { getProjects, deleteProject as deleteProjectFromStore } from '../lib/ProjectStore.js'

export default function Dashboard() {
  const navigate  = useNavigate()
  const [projects, setProjects] = useState(getProjects())

  const totalCalls = projects.reduce((s, p) => s + p.calls, 0)

  function deleteProject(id) {
    const updated = deleteProjectFromStore(id)
    setProjects(updated)
  }

  return (
    <div className="min-h-screen bg-void font-body">
      <Navbar minimal />
      <Sidebar />

      <main className="ml-[220px] pt-[76px] px-8 py-8">
        <div className="max-w-[1000px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-[28px] font-semibold text-primary mb-1 tracking-[-0.03em]">My Projects</h1>
              <p className="font-body text-[14px] text-secondary">Build and manage your AI-powered apps</p>
            </div>
            <button onClick={() => navigate('/builder')} className="btn-primary">
              <Plus size={16} /> New Project
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-[16px] mb-[32px]">
            {[
              { label: 'Total Projects', value: projects.length,  icon: Zap,         suffix: '' },
              { label: 'AI Calls This Month', value: totalCalls, icon: TrendingUp,    suffix: '' },
              { label: 'Calls Remaining',  value: 500 - totalCalls, icon: Clock,      suffix: ' / 500' },
            ].map(s => (
              <div key={s.label} className="card flex items-center gap-[16px]">
                <div className="w-[40px] h-[40px] rounded-[8px] bg-accent-dim border border-glow flex items-center justify-center">
                  <s.icon size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-[24px] font-mono font-medium text-primary tracking-[-0.02em]">{s.value}<span className="text-secondary text-[16px]">{s.suffix}</span></p>
                  <p className="font-body text-[12px] text-text-muted mt-0.5 tracking-[-0.01em]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          {projects.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-[48px] h-[48px] rounded-[12px] bg-accent-dim border border-glow flex items-center justify-center mx-auto mb-[16px]">
                <Zap size={20} className="text-accent" />
              </div>
              <h3 className="font-body font-medium text-[15px] text-primary mb-2 tracking-[-0.01em]">No projects yet</h3>
              <p className="font-body text-[13px] text-secondary mb-6">Create your first AI-powered app in minutes.</p>
              <button onClick={() => navigate('/builder')} className="btn-primary">
                <Plus size={15} /> Create first project
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-[16px]">
              {projects.map(p => (
                <div key={p.id} className="card card-hover flex flex-col group transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-[36px] h-[36px] rounded-[8px] bg-accent-dim border border-accent/20 flex items-center justify-center">
                        <Zap size={16} className="text-accent" />
                      </div>
                      <div>
                        <h3 className="font-body font-medium text-[15px] text-primary tracking-[-0.01em]">{p.name}</h3>
                        <span className="font-mono text-[11px] text-text-muted uppercase tracking-[0.05em]">{p.tag}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <span className={p.status === 'live' ? 'badge-active' : 'badge-draft'}>
                        <div className={`w-[5px] h-[5px] rounded-full mr-[6px] ${p.status === 'live' ? 'bg-[#34d399]' : 'bg-text-muted'}`}></div>
                        <span className="capitalize tracking-[0.05em]">{p.status}</span>
                      </span>
                      <div className="relative group/menu">
                        <button 
                          onClick={() => navigate('/settings')}
                          className="w-[28px] h-[28px] rounded-[6px] hover:bg-white/5 flex items-center justify-center
                                            text-secondary hover:text-primary transition-colors"
                          title="Project Settings"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="font-body text-[13px] text-secondary mb-[24px] leading-[1.65] flex-1">{p.desc}</p>

                  <div className="flex items-center justify-between pt-[16px] border-t border-base">
                    <div className="flex items-center gap-[12px] font-mono text-[11px] text-text-muted uppercase tracking-[0.05em]">
                      <span><strong className="text-secondary font-medium tracking-normal text-[12px] lowercase">{p.calls}</strong> calls</span>
                      <span>·</span>
                      <span>Updated {p.updated}</span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <button
                        onClick={() => deleteProject(p.id)}
                        className="w-[28px] h-[28px] rounded-[6px] hover:bg-danger/10 flex items-center justify-center
                                   text-text-muted hover:text-danger transition-colors duration-150"
                      >
                        <Trash2 size={13} />
                      </button>
                      <button
                        onClick={() => navigate(`/builder?id=${p.id}`)}
                        className="flex items-center gap-[4px] font-body text-[13px] text-accent hover:text-accent-hover font-medium transition-colors duration-150"
                      >
                        Open <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* New project card */}
              <button
                onClick={() => navigate('/builder')}
                className="bg-base border border-dashed border-base hover:border-accent hover:bg-accent-dim rounded-[12px]
                           flex flex-col items-center justify-center gap-3 py-10 transition-all duration-200 group"
              >
                <div className="w-[40px] h-[40px] rounded-[8px] border border-dashed border-dim group-hover:border-accent
                                flex items-center justify-center transition-colors">
                  <Plus size={18} className="text-secondary group-hover:text-accent transition-colors" />
                </div>
                <span className="font-body text-[13px] text-secondary group-hover:text-primary transition-colors">New project</span>
              </button>
            </div>
          )}

          {/* Quick tip */}
          <div className="mt-[32px] p-[16px] rounded-[8px] bg-raised border border-base flex items-start gap-[12px]">
            <Zap size={16} className="text-accent mt-0.5 flex-shrink-0" fill="currentColor" />
            <div className="font-body text-[13px] leading-[1.6] text-secondary">
              <strong className="text-primary font-medium tracking-[-0.01em]">Pro tip: </strong>
              The AI Copilot remembers all your project context. Start a conversation there before
              building — it'll save you hours of debugging later.
              <button onClick={() => navigate('/copilot')} className="ml-[8px] text-accent hover:text-accent-hover font-medium transition-colors">
                Open Copilot <ExternalLink size={12} className="inline ml-[2px]" />
              </button>
            </div>
          </div>

          {/* AI Build Companion CTA */}
          <button
            onClick={() => navigate('/companion')}
            className="mt-[16px] w-full group relative overflow-hidden rounded-[12px] border border-accent/25 
                       bg-gradient-to-r from-accent/[0.06] to-[#7c3aed]/[0.06] p-[20px] text-left
                       hover:border-accent/40 hover:from-accent/[0.1] hover:to-[#7c3aed]/[0.1]
                       transition-all duration-300"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
            <div className="flex items-center gap-[16px]">
              <div className="w-[44px] h-[44px] rounded-[10px] bg-gradient-to-br from-accent to-[#7c3aed] 
                              flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20
                              group-hover:shadow-accent/30 transition-shadow">
                <Compass size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[8px] mb-[4px]">
                  <h3 className="font-body text-[15px] font-semibold text-primary tracking-[-0.01em]">
                    AI Build Companion
                  </h3>
                  <span className="font-mono text-[9px] tracking-[0.12em] uppercase px-[6px] py-[2px] rounded-[4px] 
                                   bg-accent/15 text-accent border border-accent/20">New</span>
                </div>
                <p className="font-body text-[13px] text-secondary leading-[1.5]">
                  Stuck on an AI output? Paste it in and get instant diagnosis, fixes, and step-by-step guidance.
                </p>
              </div>
              <ArrowRight size={16} className="text-accent opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}
