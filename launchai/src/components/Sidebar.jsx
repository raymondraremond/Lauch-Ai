import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Wand2, MessageSquare, Rocket, Settings, Zap, ChevronRight } from 'lucide-react'

const nav = [
  { label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard' },
  { label: 'AI Builder', icon: Wand2,           path: '/builder'   },
  { label: 'Copilot',    icon: MessageSquare,   path: '/copilot'   },
  { label: 'Deploy',     icon: Rocket,          path: '/deploy'    },
  { label: 'Settings',   icon: Settings,        path: '/settings'  },
]

export default function Sidebar() {
  const loc = useLocation()
  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-surface-800 border-r border-white/5
                      flex flex-col z-40 pt-20 pb-6">
      <div className="flex-1 px-3 space-y-1">
        {nav.map(({ label, icon: Icon, path }) => {
          const active = loc.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                         transition-all duration-150 group ${
                           active
                             ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                             : 'text-gray-400 hover:text-white hover:bg-white/5'
                         }`}
            >
              <Icon size={16} className={active ? 'text-brand-500' : ''} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto text-brand-500/60" />}
            </Link>
          )
        })}
      </div>

      <div className="mx-3 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-brand-500" fill="currentColor" />
          <span className="text-xs font-semibold text-brand-400">Free Plan</span>
        </div>
        <p className="text-xs text-gray-500 mb-2">2 projects · 500 AI calls/mo</p>
        <Link to="/settings" className="text-xs text-brand-500 hover:text-brand-400 font-medium">
          Upgrade →
        </Link>
      </div>
    </aside>
  )
}
