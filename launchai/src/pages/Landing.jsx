import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import {
  Zap, ArrowRight, Sparkles, LayoutDashboard, Wand2,
  MessageSquare, Rocket, CheckCircle, Star
} from 'lucide-react'

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
]

const problems = [
  'No idea where to start with AI',
  'Prompt engineering feels like black magic',
  '"Which tool?" analysis paralysis',
  'Apps fail silently and you don\'t know why',
  'Built something great — zero users',
  'Can\'t turn idea into actual product logic',
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

const steps = [
  { n: '01', title: 'Describe your idea', desc: 'Tell the copilot what problem you\'re solving. It helps you define the user, validate demand, and scope the MVP.' },
  { n: '02', title: 'Build with AI guidance', desc: 'The visual builder + AI copilot scaffold your UI, data flows, and AI logic as you describe them in natural language.' },
  { n: '03', title: 'Deploy & monetize', desc: 'One click publishes your app. The monetization wizard sets up pricing, payments, and analytics in minutes.' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-surface-900 font-body overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[700px] h-[400px] bg-brand-500/8 rounded-full blur-[120px]" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px]
                          bg-purple-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-6">
            <Sparkles size={12} />
            Now in public beta — free to start
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-5">
            Build AI-powered products
            <br />
            <span className="glow-text">without writing code</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            From raw idea to live product — guided by an AI copilot that handles the
            technical complexity, so you can focus on the problem you're solving.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/onboarding')} className="btn-primary text-base px-6 py-3">
              Start building free <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/copilot')} className="btn-ghost text-base px-6 py-3">
              Try the AI Copilot
            </button>
          </div>

          <p className="text-xs text-gray-600 mt-4">No credit card required · Deploy in minutes</p>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-16 px-6 bg-surface-800/50 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-gray-500 mb-8">
            Sound familiar? You're not alone — these are the top reasons AI products fail.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {problems.map(p => (
              <div key={p} className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-700/60 border border-white/5">
                <span className="text-red-400/70 mt-0.5 text-sm">✕</span>
                <span className="text-sm text-gray-400">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">How it works</p>
            <h2 className="font-display text-3xl font-bold">Idea to product in three steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(s => (
              <div key={s.n} className="relative">
                <div className="text-5xl font-display font-bold text-white/5 mb-3 select-none">{s.n}</div>
                <h3 className="font-semibold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-surface-800/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Features</p>
            <h2 className="font-display text-3xl font-bold">Everything a non-technical founder needs</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="card-hover group">
                <div className="w-9 h-9 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4
                                group-hover:bg-brand-500/25 transition-colors">
                  <f.icon size={18} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Pricing</p>
            <h2 className="font-display text-3xl font-bold">Simple, transparent plans</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {plans.map(p => (
              <div key={p.name} className={`card flex flex-col relative ${
                p.highlight ? 'border-brand-500/40 bg-brand-500/5' : ''
              }`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge bg-brand-500 text-surface-900 font-semibold px-3 py-1 text-xs">
                      Most popular
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-400 mb-1">{p.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="font-display text-4xl font-bold text-white">{p.price}</span>
                    <span className="text-sm text-gray-500 mb-1">/{p.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={14} className="text-brand-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/onboarding')}
                  className={p.highlight ? 'btn-primary justify-center' : 'btn-ghost justify-center'}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card border-brand-500/20 bg-gradient-to-b from-brand-500/5 to-transparent">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-brand-500 fill-brand-500" />
              ))}
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Stop planning. Start building.
            </h2>
            <p className="text-gray-400 mb-7">
              Join hundreds of founders using LaunchAI to ship AI products — no coding required.
            </p>
            <button onClick={() => navigate('/onboarding')} className="btn-primary text-base px-8 py-3">
              Get started for free <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
              <Zap size={12} className="text-surface-900" fill="currentColor" />
            </div>
            <span className="font-display font-bold text-sm text-white">LaunchAI</span>
          </div>
          <p className="text-xs text-gray-600">© 2025 LaunchAI. Built for founders who ship.</p>
          <div className="flex gap-5 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
