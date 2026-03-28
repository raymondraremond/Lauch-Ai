import { Link, useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'

export default function Navbar({ minimal = false }) {
  const navigate = useNavigate()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4
                    bg-surface-900/80 backdrop-blur-md border-b border-white/5">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center
                        shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-all">
          <Zap size={16} className="text-surface-900" fill="currentColor" />
        </div>
        <span className="font-display font-bold text-lg tracking-tight text-white">LaunchAI</span>
      </Link>

      {!minimal && (
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-5 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-white transition-colors">Pricing</a>
            <a href="#how"      className="hover:text-white transition-colors">How it works</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm py-2 px-4">
              Sign in
            </button>
            <button onClick={() => navigate('/onboarding')} className="btn-primary text-sm py-2 px-4">
              Start free
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
