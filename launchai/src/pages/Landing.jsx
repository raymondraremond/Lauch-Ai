import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import {
  Zap, ArrowRight, Sparkles, LayoutDashboard, Wand2,
  MessageSquare, Rocket, CheckCircle, Star, Compass
} from 'lucide-react'

// Custom hook for intersection observer staggered animations
function useScrollReveal() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return [ref, isVisible]
}

const features = [
  {
    icon: Sparkles,
    title: 'AI Idea Validator',
    desc: 'Turn vague ideas into validated product briefs. Our copilot asks the right questions and checks market demand before you write a single line of logic.',
  },
  {
    icon: LayoutDashboard,
    title: 'Visual UI Builder',
    desc: 'Drag and drop forms, dashboards, and chatbot widgets. Describe what you want in plain English and the AI scaffolds the interface for you.',
  },
  {
    icon: Wand2,
    title: 'Workflow Designer',
    desc: 'Connect UI elements to AI agents, databases, and third-party tools with zero code. If this → AI analyzes → send to Airtable. Done.',
  },
  {
    icon: MessageSquare,
    title: 'AI Copilot',
    desc: 'A persistent AI teammate that remembers your app\'s context, explains errors in plain language, and suggests improvements at every step.',
  },
  {
    icon: Rocket,
    title: 'One-Click Deploy',
    desc: 'Publish to a shareable URL, embed on your site, or expose as an API. No server management. No DevOps headaches.',
  },
  {
    icon: Zap,
    title: 'Monetization Wizard',
    desc: 'Auto-generates Stripe payment plans, usage dashboards, and growth tips. Building is 20% of the work — we handle the other 80%.',
  },
  {
    icon: Compass,
    title: 'AI Build Companion',
    desc: 'Stuck on an AI output? Paste it in and get instant diagnosis, clear explanations, step-by-step fixes, and a complete plan to finish what you started.',
    highlight: true,
  },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['2 projects', '500 AI calls / month', 'Community support', 'Public deployment'],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Builder',
    price: '$29',
    period: 'per month',
    features: ['Unlimited projects', '10,000 AI calls / month', 'Custom domain', 'Priority support', 'Analytics dashboard'],
    cta: 'Start 14-day trial',
    highlight: true,
  },
  {
    name: 'Studio',
    price: '$99',
    period: 'per month',
    features: ['Everything in Builder', 'Team seats (5)', 'White-label option', 'Stripe monetization', 'SLA + dedicated support'],
    cta: 'Talk to us',
    highlight: false,
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [heroRef, heroVisible] = useScrollReveal()
  const [featureRef, featureVisible] = useScrollReveal()
  const [pricingRef, pricingVisible] = useScrollReveal()

  return (
    <div className="min-h-screen bg-void font-body overflow-x-hidden relative text-primary">
      <div className="grain-overlay"></div>
      
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-[120px] pb-[120px] px-6 lg:px-8 max-w-[1120px] mx-auto min-h-[90vh] flex flex-col justify-center">
        <div className="mesh-glow"></div>
        <div className="shimmer-line"></div>
        
        <div className="relative z-10 w-full flex flex-col items-start md:text-left text-left mt-8">
          <div className={`inline-flex items-center gap-2 mb-6 ${heroVisible ? 'animate-fade-up stagger-1 opacity-0' : 'opacity-0'}`}>
            <div className="w-[4px] h-[4px] bg-accent rounded-full animate-pulse-dot"></div>
            <span className="font-mono text-[11px] tracking-[0.12em] text-accent uppercase">Now in public beta</span>
          </div>

          <h1 className={`font-display text-[44px] md:text-[72px] font-semibold leading-[1.1] tracking-[-0.03em] mb-6 max-w-[800px] text-white ${heroVisible ? 'animate-fade-up stagger-2 opacity-0' : 'opacity-0'}`}>
            Build AI products faster. 
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#7c3aed]">
              Without writing code.
            </span>
          </h1>

          <p className={`font-body text-[17px] text-secondary leading-[1.7] max-w-[520px] mb-10 tracking-[-0.01em] ${heroVisible ? 'animate-fade-up stagger-3 opacity-0' : 'opacity-0'}`}>
            From raw idea to live product — guided by an AI copilot that handles the technical complexity, so you can focus on the problem you're solving.
          </p>

          <div className={`flex items-center gap-4 ${heroVisible ? 'animate-fade-up stagger-4 opacity-0' : 'opacity-0'}`}>
            <button onClick={() => navigate('/onboarding')} className="btn-primary rounded-[7px] px-[24px] py-[12px] text-[14px]">
              Start building free <ArrowRight size={15} />
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-ghost rounded-[7px] px-[24px] py-[12px] text-[14px] border-lit text-secondary">
              Go to Dashboard
            </button>
          </div>

          <div className={`mt-[64px] flex items-center justify-start gap-6 divide-x divide-dim/50 ${heroVisible ? 'animate-fade-up stagger-5 opacity-0' : 'opacity-0'}`}>
            <div className="flex flex-col">
              <span className="font-mono text-primary text-[14px]">2,400+</span>
              <span className="font-body text-secondary text-[13px]">Builders</span>
            </div>
            <div className="flex flex-col pl-6">
              <span className="font-mono text-primary text-[14px]">&lt; 14 Days</span>
              <span className="font-body text-secondary text-[13px]">To Launch</span>
            </div>
            <div className="flex flex-col pl-6">
              <span className="font-mono text-primary text-[14px]">4.9★</span>
              <span className="font-body text-secondary text-[13px]">Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid: 12-col layout basis for max-w 1120px is mostly flex / CSS grid handles it via max-w */}
      {/* Features */}
      <section ref={featureRef} id="features" className="py-[120px] px-6 max-w-[1120px] mx-auto relative z-10 border-t border-dim">
        <div className="shimmer-line"></div>
        <div className="mb-[48px]">
          <h2 className="section-label mb-[16px]">Features</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-[24px]">
          {features.filter(f => !f.highlight).map((f, idx) => (
            <div 
              key={f.title} 
              className={`card-premium card-hover group ${featureVisible ? `animate-fade-up opacity-0` : 'opacity-0'}`} 
              style={{ animationDelay: `${(idx + 1) * 60}ms` }}
            >
              <div className="w-[32px] h-[32px] rounded-[8px] bg-accent-dim border border-glow flex items-center justify-center mb-6">
                <f.icon size={16} className="text-accent" />
              </div>
              <h3 className="font-body font-medium text-[15px] text-primary mb-2 tracking-[-0.01em]">{f.title}</h3>
              <p className="font-body font-normal text-[13px] text-secondary leading-[1.65]">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Highlighted: AI Build Companion */}
        {features.filter(f => f.highlight).map((f, idx) => (
          <div 
            key={f.title}
            onClick={() => navigate('/onboarding')}
            className={`mt-[24px] relative overflow-hidden rounded-[12px] border border-accent/25 
                        bg-gradient-to-r from-accent/[0.06] to-[#7c3aed]/[0.06] p-[24px] cursor-pointer group
                        hover:border-accent/40 hover:from-accent/[0.08] hover:to-[#7c3aed]/[0.08]
                        transition-all duration-300 ${featureVisible ? 'animate-fade-up opacity-0' : 'opacity-0'}`}
            style={{ animationDelay: '420ms' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
            <div className="flex items-center gap-[20px]">
              <div className="w-[44px] h-[44px] rounded-[10px] bg-gradient-to-br from-accent to-[#7c3aed] 
                              flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
                <f.icon size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-[8px] mb-[4px]">
                  <h3 className="font-body font-semibold text-[15px] text-primary tracking-[-0.01em]">{f.title}</h3>
                  <span className="font-mono text-[9px] tracking-[0.12em] uppercase px-[6px] py-[2px] rounded-[4px] 
                                   bg-accent/15 text-accent border border-accent/20">New</span>
                </div>
                <p className="font-body font-normal text-[13px] text-secondary leading-[1.65]">{f.desc}</p>
              </div>
              <ArrowRight size={16} className="text-accent opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section ref={pricingRef} id="pricing" className="py-[120px] px-6 max-w-[1120px] mx-auto relative z-10">
        <div className="mb-[48px] flex flex-col md:flex-row justify-between items-end">
          <div>
            <h2 className="section-label mb-[16px]">Pricing</h2>
            <h3 className="font-display text-[32px] font-semibold text-primary">Precise scale.</h3>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-[24px]">
          {plans.map((p, idx) => (
            <div 
              key={p.name} 
              className={`relative flex flex-col card-premium ${p.highlight ? 'border-accent/50 bg-[#6366f10f]' : ''} ${pricingVisible ? `animate-fade-up opacity-0` : 'opacity-0'}`}
              style={{ animationDelay: `${(idx + 1) * 60}ms`, borderTop: p.highlight ? '2px solid var(--accent)' : '' }}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="font-mono text-[10px] tracking-[0.12em] bg-raised text-accent border border-base px-[8px] py-[2px] rounded-[4px] uppercase">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-secondary mb-4">{p.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-[40px] font-semibold text-primary tracking-[-0.03em]">{p.price}</span>
                  <span className="font-body text-[13px] text-text-muted">/{p.period}</span>
                </div>
              </div>
              
              <ul className="space-y-[12px] flex-1 mb-[32px]">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-[12px] font-body text-[13px] text-secondary">
                    <CheckCircle size={14} className="text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => navigate('/onboarding')}
                className={`w-full ${p.highlight ? 'btn-primary' : 'btn-ghost'}`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dim py-[48px] px-6 relative z-10">
        <div className="max-w-[1120px] mx-auto flex flex-col md:flex-row items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[8px]">
            <div className="w-[6px] h-[6px] bg-accent rounded-[1px]"></div>
            <span className="font-display font-semibold text-[14px] text-primary">LaunchAI</span>
          </div>
          <p className="font-body text-[13px] text-text-muted">© 2026 LaunchAI Inc.</p>
          <div className="flex gap-[24px] font-body text-[13px] text-secondary">
            <Link to="/privacy" className="hover:text-primary transition-colors duration-150">Privacy</Link>
            <Link to="/terms"  className="hover:text-primary transition-colors duration-150">Terms</Link>
            <Link to="/changelog" className="hover:text-primary transition-colors duration-150">Changelog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
