import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Wand2, MessageSquare, Rocket, Settings, ChevronRight } from 'lucide-react'

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
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-base border-r border-dim flex flex-col z-40 pt-20 pb-6">
      <div className="flex-1 px-3 space-y-1">
        {nav.map(({ label, icon: Icon, path }) => {
          const active = loc.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`relative flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] font-body text-[13px] transition-colors duration-150 group ${
                active
                  ? 'bg-[#6366f11a] text-accent'
                  : 'text-secondary hover:text-primary hover:bg-white/5'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent rounded-l-[6px]"></div>
              )}
              <Icon size={15} className={`flex-shrink-0 ${active ? 'text-accent' : 'text-text-muted transition-colors group-hover:text-secondary'}`} />
              <span className="font-medium tracking-[-0.01em]">{label}</span>
              {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
            </Link>
          )
        })}
      </div>

      <div className="mx-3 p-3 rounded-[8px] border border-base bg-raised">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-[6px] h-[6px] bg-accent rounded-[1px]"></div>
          <span className="font-mono text-[11px] tracking-[0.05em] uppercase text-primary">Free Plan</span>
        </div>
        <p className="font-body text-[12px] text-text-muted mb-2">2 projects · 500 API calls</p>
        <Link to="/settings" className="font-body text-[12px] text-accent hover:text-accent-hover font-medium transition-colors">
          Upgrade →
        </Link>
      </div>
    </aside>
  )
}
