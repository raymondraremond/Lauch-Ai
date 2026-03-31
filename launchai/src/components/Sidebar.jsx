import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Wand2, MessageSquare, Compass, Rocket, Settings, ChevronRight, Target, LogOut } from 'lucide-react'
import { getGeminiKeys } from '../lib/ApiKeyManager.js'
import { useAuth } from '../contexts/AuthContext'

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
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()

  // API Key Check
  const hasGemini = getGeminiKeys().length > 0 || !!import.meta.env.VITE_GOOGLE_API_KEY
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

        {/* Profile Badge (Premium) */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                <img 
                  src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border border-accent/30 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
              <div className="absolute -right-0.5 -bottom-0.5 w-3 h-3 bg-[#10b981] border-2 border-base rounded-full shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-primary text-[14px] truncate leading-tight">
                {profile?.full_name || user?.user_metadata?.full_name || 'User Account'}
              </p>
              <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                Developer Plan
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => signOut().then(() => navigate('/'))}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-danger/10 border border-white/5 hover:border-danger/20 text-text-muted hover:text-danger transition-all duration-200 text-[12px] font-semibold"
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
