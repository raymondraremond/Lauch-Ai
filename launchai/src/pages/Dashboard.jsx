import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { Plus, Zap, TrendingUp, Clock, ArrowRight, ExternalLink, Trash2, MoreHorizontal } from 'lucide-react'

const DEMO_PROJECTS = [
  {
    id: 1,
    name: 'Invoice Analyzer',
    desc: 'Extract & categorize invoice data using AI',
    status: 'live',
    calls: 342,
    updated: '2h ago',
    tag: 'Finance',
  },
  {
    id: 2,
    name: 'Customer FAQ Bot',
    desc: 'AI support chatbot trained on your docs',
    status: 'draft',
    calls: 0,
    updated: '1d ago',
    tag: 'Support',
  },
]

const statusStyle = {
  live:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  draft: 'bg-white/5 text-gray-400 border-white/10',
  paused:'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export default function Dashboard() {
  const navigate  = useNavigate()
  const [projects, setProjects] = useState(DEMO_PROJECTS)

  const totalCalls = projects.reduce((s, p) => s + p.calls, 0)

  function deleteProject(id) {
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-surface-900 font-body">
      <Navbar minimal />
      <Sidebar />

      <main className="ml-56 pt-20 px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">My Projects</h1>
            <p className="text-sm text-gray-500">Build and manage your AI-powered apps</p>
          </div>
          <button onClick={() => navigate('/builder')} className="btn-primary">
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: projects.length,  icon: Zap,         suffix: '' },
            { label: 'AI Calls This Month', value: totalCalls, icon: TrendingUp,    suffix: '' },
            { label: 'Calls Remaining',  value: 500 - totalCalls, icon: Clock,      suffix: ' / 500' },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center">
                <s.icon size={18} className="text-brand-400" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">{s.value}{s.suffix}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        {projects.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 flex items-center justify-center mx-auto mb-4">
              <Zap size={22} className="text-brand-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-sm text-gray-400 mb-5">Create your first AI-powered app in minutes.</p>
            <button onClick={() => navigate('/builder')} className="btn-primary">
              <Plus size={15} /> Create first project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div key={p.id} className="card group hover:border-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center">
                      <Zap size={16} className="text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{p.name}</h3>
                      <span className="text-xs text-gray-500">{p.tag}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge border ${statusStyle[p.status]} capitalize`}>
                      {p.status}
                    </span>
                    <div className="relative group/menu">
                      <button className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center
                                         text-gray-500 hover:text-gray-300 transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-4 leading-relaxed">{p.desc}</p>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span><strong className="text-gray-300">{p.calls}</strong> AI calls</span>
                    <span>Updated {p.updated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteProject(p.id)}
                      className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center
                                 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={() => navigate('/builder')}
                      className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
                    >
                      Open <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* New project card */}
            <button
              onClick={() => navigate('/builder')}
              className="card border-dashed border-white/10 hover:border-brand-500/30 hover:bg-surface-700/50
                         flex flex-col items-center justify-center gap-3 py-10 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl border border-dashed border-white/15 group-hover:border-brand-500/40
                              flex items-center justify-center transition-colors">
                <Plus size={18} className="text-gray-500 group-hover:text-brand-400 transition-colors" />
              </div>
              <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">New project</span>
            </button>
          </div>
        )}

        {/* Quick tip */}
        <div className="mt-8 p-4 rounded-xl bg-brand-500/5 border border-brand-500/15 flex items-start gap-3">
          <Zap size={16} className="text-brand-400 mt-0.5 flex-shrink-0" fill="currentColor" />
          <div className="text-sm">
            <span className="text-brand-300 font-medium">Pro tip: </span>
            <span className="text-gray-400">
              The AI Copilot remembers all your project context. Start a conversation there before
              building — it'll save you hours of debugging later.
            </span>
            <button onClick={() => navigate('/copilot')} className="ml-2 text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Open Copilot <ExternalLink size={11} className="inline" />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
