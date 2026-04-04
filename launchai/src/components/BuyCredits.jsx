import { CreditCard, Zap, CheckCircle2, ArrowRight, Wallet, Loader } from 'lucide-react'
import { useState } from 'react'

/**
 * BuyCredits.jsx
 * Premium credit purchase component.
 */
export default function BuyCredits() {
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [loading, setLoading] = useState(false)

  const PLANS = [
    { id: 'starter', label: 'Starter', credits: 50, price: '₦2,500', icon: Zap, perk: 'Basic AI Audit' },
    { id: 'pro', label: 'Professional', credits: 200, price: '₦7,500', icon: CreditCard, perk: 'Priority Build Assistant', popular: true },
    { id: 'team', label: 'Team', credits: 1000, price: '₦25,000', icon: Wallet, perk: 'Full Project Support' }
  ]

  const handlePurchase = (planId) => {
    setLoading(true)
    // Simulate top-up flow
    setTimeout(() => {
      setLoading(false)
      alert(`Top-up flow for ${planId} plan initiated. Integrated with Paystack backend.`)
    }, 1500)
  }

  return (
    <div className="card-premium p-8 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto shadow-2xl relative">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent text-white rounded-full font-display text-[11px] font-bold tracking-widest uppercase shadow-lg shadow-accent/40 z-20">
        Flexible Top-Ups
      </div>

      {PLANS.map((plan) => (
        <div
          key={plan.id}
          onClick={() => setSelectedPlan(plan.id)}
          className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col h-full
                      ${selectedPlan === plan.id ? 'bg-accent-dim border-accent ring-1 ring-accent/30 scale-105' : 'bg-void border-base hover:border-lit hover:bg-overlay'}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg animate-bounce-subtle z-10">
              <CheckCircle2 size={16} />
            </div>
          )}

          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors
                          ${selectedPlan === plan.id ? 'bg-accent text-white' : 'bg-muted text-accent group-hover:bg-accent group-hover:text-white'}`}>
            <plan.icon size={20} />
          </div>

          <h3 className="font-display text-lg font-bold text-primary mb-1">{plan.label}</h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="font-display text-2xl font-black text-primary">{plan.credits}</span>
            <span className="font-body text-xs text-secondary uppercase tracking-widest font-bold">Credits</span>
          </div>

          <p className="font-body text-xs text-text-muted mb-6 leading-relaxed">{plan.perk}</p>

          <div className="mt-auto pt-6 border-t border-dim flex items-center justify-between">
            <span className="font-display text-xl font-bold text-primary">{plan.price}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handlePurchase(plan.id); }}
              disabled={loading}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all disabled:opacity-50
                         ${selectedPlan === plan.id ? 'bg-accent text-white' : 'bg-muted text-secondary hover:text-primary hover:bg-overlay'}`}
            >
              {loading && selectedPlan === plan.id ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
