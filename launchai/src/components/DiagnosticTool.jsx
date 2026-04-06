import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { API_BASE } from '../lib/config'
import { Activity, CheckCircle, XCircle, RefreshCw, Server, ShieldCheck, Globe, AlertTriangle } from 'lucide-react'

export default function DiagnosticTool() {
  const [results, setResults] = useState({
    supabase: { status: 'idle', message: 'Waiting to test...' },
    server: { status: 'idle', message: 'Waiting to test...' },
    auth: { status: 'idle', message: 'Waiting to test...' }
  })
  const [loading, setLoading] = useState(false)

  async function runTests() {
    setLoading(true)
    setResults({
      supabase: { status: 'loading', message: 'Connecting to Supabase...' },
      server: { status: 'loading', message: 'Pinging Render backend...' },
      auth: { status: 'loading', message: 'Verifying session token...' }
    })

    // 1. Test Supabase Direct
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1)
      if (error) throw error
      setResults(prev => ({ ...prev, supabase: { status: 'success', message: 'Connected to Supabase Project.' } }))
    } catch (err) {
      setResults(prev => ({ ...prev, supabase: { status: 'error', message: `Supabase Error: ${err.message}` } }))
    }

    // 2. Test Render Server Root
    try {
      const res = await fetch(`${API_BASE}/`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setResults(prev => ({ ...prev, server: { status: 'success', message: `Render Server Online: ${data.status || 'OK'}` } }))
    } catch (err) {
      setResults(prev => ({ ...prev, server: { status: 'error', message: `Backend Error: ${err.message}. Check Render deployment.` } }))
    }

    // 3. Test Auth Token Freshness
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session found. Please login.')
      
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      if (userErr || !user) throw new Error('Token rejected by Supabase. Re-login required.')
      
      setResults(prev => ({ ...prev, auth: { status: 'success', message: 'Token valid & fresh.' } }))
    } catch (err) {
      setResults(prev => ({ ...prev, auth: { status: 'error', message: `Auth Error: ${err.message}` } }))
    }

    setLoading(false)
  }

  const StatusIcon = ({ status }) => {
    if (status === 'loading') return <RefreshCw className="animate-spin text-accent" size={16} />
    if (status === 'success') return <CheckCircle className="text-[#10b981]" size={16} />
    if (status === 'error') return <XCircle className="text-danger" size={16} />
    return <Activity className="text-text-muted" size={16} />
  }

  return (
    <div className="companion-card p-6 space-y-6 animate-fade-up border-accent/20 bg-accent/[0.02]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={18} className="text-accent" />
          <h2 className="font-display text-[18px] font-semibold text-primary">Connectivity Diagnostic</h2>
        </div>
        <button 
          onClick={runTests} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-1.5 bg-accent text-white rounded-lg text-[12px] font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Run Connection Test'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Supabase Step */}
        <div className="flex items-start gap-4">
          <div className={`mt-1 p-2 rounded-lg border ${results.supabase.status === 'success' ? 'bg-[#10b9810a] border-[#10b98126]' : 'bg-base border-base'}`}>
            <Globe className={results.supabase.status === 'success' ? 'text-[#10b981]' : 'text-text-muted'} size={14} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-primary">Supabase Connection</span>
              <StatusIcon status={results.supabase.status} />
            </div>
            <p className="text-[11px] text-secondary opacity-70 mt-0.5">{results.supabase.message}</p>
          </div>
        </div>

        {/* Server Step */}
        <div className="flex items-start gap-4">
          <div className={`mt-1 p-2 rounded-lg border ${results.server.status === 'success' ? 'bg-[#10b9810a] border-[#10b98126]' : 'bg-base border-base'}`}>
            <Server className={results.server.status === 'success' ? 'text-[#10b981]' : 'text-text-muted'} size={14} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-primary">Render Backend Status</span>
              <StatusIcon status={results.server.status} />
            </div>
            <p className="text-[11px] text-secondary opacity-70 mt-0.5">{results.server.message}</p>
          </div>
        </div>

        {/* Auth Step */}
        <div className="flex items-start gap-4">
          <div className={`mt-1 p-2 rounded-lg border ${results.auth.status === 'success' ? 'bg-[#10b9810a] border-[#10b98126]' : 'bg-base border-base'}`}>
            <ShieldCheck className={results.auth.status === 'success' ? 'text-[#10b981]' : 'text-text-muted'} size={14} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-primary">Auth Token Validation</span>
              <StatusIcon status={results.auth.status} />
            </div>
            <p className="text-[11px] text-secondary opacity-70 mt-0.5">{results.auth.message}</p>
          </div>
        </div>
      </div>

      {results.supabase.status === 'success' && results.server.status === 'success' && results.auth.status === 'success' && (
        <div className="p-3 bg-[#10b9810a] border border-[#10b98126] rounded-lg flex items-start gap-3 animate-fade-in">
          <CheckCircle size={16} className="text-[#10b981] mt-0.5" />
          <div className="text-[11px] text-[#10b981] leading-relaxed">
            <strong>All systems connected.</strong> If AI features still return 401, you likely have a <strong>Supabase JWT Secret mismatch</strong> in your Render dashboard environment variables.
          </div>
        </div>
      )}

      {(results.supabase.status === 'error' || results.server.status === 'error' || results.auth.status === 'error') && (
        <div className="p-3 bg-danger/5 border border-danger/20 rounded-lg flex items-start gap-3 animate-shake">
          <AlertTriangle size={16} className="text-danger mt-0.5" />
          <div className="text-[11px] text-danger leading-relaxed">
            <strong>Connection Issue Detected.</strong> Please verify your Supabase URL/Keys and Render environment variables. If you recently changed Supabase projects, you must <strong>sign out and sign back in</strong> to clear your browser session.
          </div>
        </div>
      )}
    </div>
  )
}
