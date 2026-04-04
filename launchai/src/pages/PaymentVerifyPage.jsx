import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader, ArrowLeft, ShieldCheck, Zap } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import { API_BASE } from '../lib/config'

/**
 * PaymentVerifyPage.jsx
 * Verification page for AI credit top-ups (Paystack/Stripe etc).
 */
export default function PaymentVerifyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('Verifying your payment with Paystack...')

  const reference = searchParams.get('reference') || searchParams.get('trxref')

  useEffect(() => {
    if (!reference) {
      setStatus('error')
      setMessage('No payment reference found. Please contact support if you were charged.')
      return
    }

    const verifyPaystack = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/paystack/verify?reference=${reference}`)
        const data = await response.json()

        if (data.status === 'success') {
          setStatus('success')
          setMessage(`Successfully added ${data.credits || 0} credits to your account!`)
        } else {
          setStatus('error')
          setMessage(data.message || 'Payment verification failed.')
        }
      } catch (err) {
        console.error('Verify error:', err)
        setStatus('error')
        setMessage('Network error verifying payment. Please try again.')
      }
    }

    verifyPaystack()
  }, [reference])

  return (
    <div className="min-h-screen bg-void font-body flex flex-col">
      <Navbar minimal />

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="mesh-glow opacity-30 fixed inset-0 pointer-events-none" />
        <div className="grain-overlay opacity-20 fixed inset-0 pointer-events-none" />

        <div className="card-premium p-12 max-w-md w-full flex flex-col items-center text-center shadow-2xl relative z-10 animate-fade-up">
          {status === 'verifying' && (
            <div className="flex flex-col items-center gap-6 animate-pulse">
              <div className="w-20 h-20 rounded-full bg-accent-dim border border-glow flex items-center justify-center text-accent">
                <Loader size={36} className="animate-spin" />
              </div>
              <h2 className="font-display text-2xl font-bold text-primary tracking-tight">Verifying Payment</h2>
              <p className="font-body text-sm text-secondary leading-relaxed">
                We're checking your transaction status with the payment provider. This won't take long.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="font-display text-2xl font-bold text-primary tracking-tight">Top-up Successful!</h2>
              <p className="font-body text-sm text-secondary leading-relaxed">
                {message}
              </p>
              <div className="flex flex-col gap-3 w-full mt-4">
                <Link to="/dashboard" className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2">
                  <Zap size={16} />
                  Go to Dashboard
                </Link>
                <div className="flex items-center justify-center gap-2 text-text-muted text-[11px] font-mono uppercase tracking-widest">
                  <ShieldCheck size={12} />
                  Secure Transaction Verified
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <XCircle size={40} />
              </div>
              <h2 className="font-display text-2xl font-bold text-primary tracking-tight">Payment Issue</h2>
              <p className="font-body text-sm text-red-400/80 leading-relaxed">
                {message}
              </p>
              <div className="flex flex-col gap-3 w-full mt-4">
                <button onClick={() => navigate('/settings')} className="btn-primary w-full py-3 rounded-xl flex items-center justify-center gap-2">
                  <ArrowLeft size={16} />
                  Back to Billing
                </button>
                <Link to="/support" className="text-secondary hover:text-primary transition-colors text-xs font-body font-medium flex items-center justify-center gap-1">
                  Contact Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
