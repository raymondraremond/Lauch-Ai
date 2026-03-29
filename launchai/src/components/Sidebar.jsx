import { NavLink, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Wand2, MessageSquare, Compass, Rocket, Settings, ChevronRight, Target } from 'lucide-react'

const nav = [
  { label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard'  },
  { label: 'AI Builder', icon: Wand2,           path: '/builder'    },
  { label: 'Copilot',    icon: MessageSquare,   path: '/copilot'    },
  { label: 'Companion',  icon: Compass,         path: '/companion', isNew: true },
  { label: 'Critique',   icon: Target,          path: '/critique',  isNew: true },
  { label: 'Deploy',     icon: Rocket,          path: '/deploy'     },
  { label: 'Settings',   icon: Settings,        path: '/settings'   },
]

export default function Sidebar() {
  const loc = useLocation()

  // API Key Check
  const hasGemini = !!(import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('VITE_GOOGLE_API_KEY'))
  const hasClaude = !!(import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('VITE_ANTHROPIC_API_KEY'))
  const isLive   = hasGemini || hasClaude
  
  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] bg-base border-r border-dim flex flex-col z-40 pt-20 pb-6 font-body">
      <div className="flex-1 px-3 space-y-1">
        {nav.map(({ label, icon: Icon, path, isNew }) => {
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `relative flex items-center gap-3 px-[12px] py-[8px] rounded-[6px] text-[13px] transition-colors duration-150 group ${
                isActive
                  ? 'bg-[#6366f11a] text-accent'
                  : 'text-secondary hover:text-primary hover:bg-white/5'
              }`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent rounded-l-[6px]"></div>
                  )}
                  <Icon size={15} className={`flex-shrink-0 ${isActive ? 'text-accent' : 'text-text-muted transition-colors group-hover:text-secondary'}`} />
                  <span className="font-medium tracking-[-0.01em]">{label}</span>
                  {isNew && !isActive && (
                    <span className="ml-auto font-mono text-[8px] tracking-[0.1em] uppercase px-[5px] py-[1px] rounded-[3px] 
                                      bg-accent/15 text-accent border border-accent/20 leading-[1.4]">New</span>
                  )}
                  {isActive && <ChevronRight size={12} className="ml-auto opacity-50" />}
                </>
              )}
            </NavLink>
          )
        })}
      </div>

      <div className="mx-3 space-y-2">
        {/* AI Status Badge */}
        <div className={`p-3 rounded-[8px] border flex items-center gap-3 transition-all
          ${isLive ? 'border-[#10b98126] bg-[#10b9810a]' : 'border-base bg-raised'}`}>
          <div className={`w-[8px] h-[8px] rounded-full animate-pulse
            ${isLive ? 'bg-[#10b981]' : 'bg-amber-500'}`}></div>
          <div className="flex-1 min-w-0">
            <p className={`font-mono text-[10px] tracking-[0.05em] uppercase font-bold
              ${isLive ? 'text-[#10b981]' : 'text-amber-500'}`}>
              {isLive ? 'Live AI Active' : 'Demo Mode'}
            </p>
            <p className="font-body text-[11px] text-text-muted truncate">
              {isLive ? 'Using Gemini/Claude' : 'Limited canned responses'}
            </p>
          </div>
        </div>

        {/* Plan Upgrade (Original) */}
        <div className="p-3 rounded-[8px] border border-base bg-raised">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-[6px] h-[6px] bg-accent rounded-[1px]"></div>
            <span className="font-mono text-[11px] tracking-[0.05em] uppercase text-primary">Free Plan</span>
          </div>
          <p className="font-body text-[12px] text-text-muted mb-2">2 projects · 500 API calls</p>
          <Link to="/settings" className="font-body text-[12px] text-accent hover:text-accent-hover font-medium transition-colors">
            Manage Keys →
          </Link>
        </div>
      </div>
    </aside>
  )
}
