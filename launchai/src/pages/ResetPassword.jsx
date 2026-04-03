import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Lock, ArrowRight, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Double check if we have a recovery session
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Option: Redirect to auth if no session, but usually the link provides it
        // navigate('/auth')
      }
    })
  }, [navigate])

  async function handleReset(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!supabase) throw new Error('Supabase not configured')
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => navigate('/auth'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void font-body flex flex-col relative overflow-hidden">
      <div className="grain-overlay opacity-40"></div>
      <div className="mesh-glow opacity-30"></div>
      
      <Navbar minimal />

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[400px] animate-fade-up">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] font-mono uppercase tracking-widest mb-4">
              <Sparkles size={12} /> Secure Account
            </div>
            <h1 className="text-[32px] font-bold text-primary tracking-tight mb-2">
              Set New Password
            </h1>
            <p className="text-secondary text-[14px]">
              Choose a strong, unique password to secure your account.
            </p>
          </div>

          <div className="card-premium p-8 shadow-2xl">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />
                <p className="text-[13px] text-danger leading-relaxed">{error}</p>
              </div>
            )}

            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6 text-success animate-bounce-subtle">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-primary font-semibold mb-2">Password Updated!</h3>
                <p className="text-secondary text-[14px] leading-relaxed mb-6">
                  Your password has been changed successfully. Redirecting you to login...
                </p>
                <div className="h-[2px] w-full bg-base rounded-full overflow-hidden">
                  <div className="h-full bg-success animate-[progress_3s_linear_forwards]"></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-text-muted px-1">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input 
                      type="password" 
                      required
                      className="input pl-11"
                      placeholder="••••••••"
                      value={password}
                      minLength={6}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full h-[46px] relative group overflow-hidden"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>
                      Update Password
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
