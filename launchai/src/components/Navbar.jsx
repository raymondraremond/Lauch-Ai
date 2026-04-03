import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User } from 'lucide-react'

export default function Navbar({ minimal = false }) {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[56px] flex items-center justify-between px-6
                    bg-[#05050a]/75 backdrop-blur-[20px] border-b border-dim">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-[6px] h-[6px] bg-accent group-hover:bg-accent-hover transition-colors rounded-[1px]"></div>
        <span className="font-display font-semibold text-[18px] tracking-[-0.03em] text-white">LaunchAI</span>
      </Link>

      {!minimal && (
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-5 text-[13px] font-body text-secondary">
            <a href="#features" className="hover:text-primary transition-colors duration-150">Features</a>
            <a href="#pricing"  className="hover:text-primary transition-colors duration-150">Pricing</a>
            <a href="#how"      className="hover:text-primary transition-colors duration-150">How it works</a>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-3 py-1.5 font-body text-[13px] text-secondary hover:text-primary transition-colors flex items-center gap-2"
                >
                  <User size={14} className="text-accent" />
                  <span className="max-w-[120px] truncate">{user?.email || 'User'}</span>
                </button>
                <div className="h-4 w-[1px] bg-white/10" />
                <button 
                  onClick={() => signOut().then(() => navigate('/'))}
                  className="text-text-muted hover:text-danger transition-colors p-1"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/auth')} 
                  className="px-4 py-2 font-body text-[13px] font-medium text-secondary hover:text-primary transition-all duration-150 tracking-[-0.01em] hover:bg-white/5 rounded-[6px]"
                >
                  Sign in
                </button>
                <button 
                  onClick={() => navigate('/auth')} 
                  className="bg-[#6366f1] text-white px-[16px] py-[8px] font-body text-[13px] font-medium rounded-[6px] tracking-[-0.01em] transition-all duration-150 shadow-none hover:bg-[#818cf8]"
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)' }}
                >
                  Start free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
