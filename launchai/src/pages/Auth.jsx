import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Zap, Mail, Lock, Github, ArrowRight, Loader2, 
  CheckCircle, AlertCircle, ChevronLeft, Sparkles,
  Chrome
} from 'lucide-react'
import Navbar from '../components/Navbar'

export default function Auth() {
  const { signIn, signUp, signInWithGoogle, signInWithGitHub, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  // View state: 'login' | 'signup' | 'forgot' | 'sent'
  const [view, setView] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (view === 'login') {
        const { error } = await signIn({ email, password })
        if (error) throw error
        navigate(from, { replace: true })
      } else if (view === 'signup') {
        const { error } = await signUp({ email, password })
        if (error) throw error
        setMessage('Check your email to confirm your account!')
        setView('sent')
      } else if (view === 'forgot') {
        const { error } = await resetPassword(email)
        if (error) throw error
        setMessage('Password reset link sent to your email.')
        setView('sent')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSocial(provider) {
    setError(null)
    try {
      if (provider === 'google') await signInWithGoogle()
      if (provider === 'github') await signInWithGitHub()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-void font-body flex flex-col relative overflow-hidden">
      <div className="grain-overlay opacity-40"></div>
      <div className="mesh-glow opacity-30"></div>
      
      <Navbar minimal />

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[420px] animate-fade-up">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono uppercase tracking-widest mb-4">
              <Sparkles size={12} /> {view === 'signup' ? 'Join the future' : 'Welcome back'}
            </div>
            <h1 className="text-[32px] font-bold text-primary tracking-tight mb-2">
              {view === 'login' && 'Sign in to LaunchAI'}
              {view === 'signup' && 'Create your account'}
              {view === 'forgot' && 'Reset Password'}
              {view === 'sent' && 'Check your inbox'}
            </h1>
            <p className="text-secondary text-[14px]">
              {view === 'login' && 'The AI-native platform for rapid product building.'}
              {view === 'signup' && 'Start building professional AI apps in minutes.'}
              {view === 'forgot' && "Enter your email and we'll send you a recovery link."}
              {view === 'sent' && `We sent a secure link to ${email}`}
            </p>
          </div>

          <div className="card-premium p-8 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />
                <p className="text-[13px] text-danger leading-relaxed">{error}</p>
              </div>
            )}

            {view === 'sent' ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6 text-success animate-bounce-subtle">
                  <Mail size={32} />
                </div>
                <p className="text-secondary text-[14px] leading-relaxed mb-8">
                  {message}
                </p>
                <button 
                  onClick={() => setView('login')}
                  className="btn-ghost w-full"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-text-muted px-1">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                      type="email" 
                      required
                      className="input pl-11"
                      placeholder="name@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {view !== 'forgot' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[11px] font-mono uppercase tracking-widest text-text-muted">Password</label>
                      {view === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => setView('forgot')}
                          className="text-[11px] text-accent hover:text-accent-hover transition-colors font-medium"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input 
                        type="password" 
                        required
                        className="input pl-11"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full h-[46px] relative group overflow-hidden"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>
                      {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="relative py-4 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">or continue with</span>
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => handleSocial('google')}
                    className="btn-ghost px-0 flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                  >
                    <Chrome size={16} className="text-primary" />
                    <span>Google</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSocial('github')}
                    className="btn-ghost px-0 flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                  >
                    <Github size={16} className="text-primary" />
                    <span>GitHub</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {view !== 'sent' && (
            <p className="mt-8 text-center text-secondary text-[13px]">
              {view === 'login' ? (
                <>Don't have an account? <button onClick={() => setView('signup')} className="text-accent hover:text-accent-hover font-semibold transition-colors">Sign up for free</button></>
              ) : (
                <>Already have an account? <button onClick={() => setView('login')} className="text-accent hover:text-accent-hover font-semibold transition-colors">Sign in</button></>
              )}
            </p>
          )}
          
          {view === 'forgot' && (
             <button 
              onClick={() => setView('login')}
              className="mt-6 flex items-center gap-2 text-[12px] text-text-muted hover:text-primary transition-colors mx-auto"
            >
              <ChevronLeft size={14} /> Back to Sign In
            </button>
          )}

          <div className="mt-12 text-center text-[11px] text-text-muted/40 uppercase tracking-[0.2em]">
            Secure Authentication by Supabase
          </div>
        </div>
      </main>
    </div>
  )
}
