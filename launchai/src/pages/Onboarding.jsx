import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Zap, Check } from 'lucide-react'

const industries = [
  '🏥 Healthcare', '⚖️ Legal', '🏗️ Construction', '🛒 E-commerce',
  '📚 Education', '💼 HR & Recruiting', '💰 Finance', '🍽️ Food & Hospitality',
  '🎨 Creative / Agency', '🏠 Real Estate', '📦 Logistics', '🔧 Other',
]

const goals = [
  { label: 'Automate a repetitive task', icon: '⚡' },
  { label: 'Build a customer-facing chatbot', icon: '💬' },
  { label: 'Create an internal tool', icon: '🛠️' },
  { label: 'Analyse data & generate reports', icon: '📊' },
  { label: 'Build an AI SaaS product', icon: '🚀' },
  { label: 'I\'m not sure yet', icon: '🤔' },
]

const templates = [
  { title: 'Invoice Analyzer',     desc: 'Extract & categorize invoice data automatically',   tag: 'Finance' },
  { title: 'Customer FAQ Bot',     desc: 'AI-powered support chatbot trained on your docs',    tag: 'Support' },
  { title: 'Lead Qualifier',       desc: 'Score & route incoming leads with AI',               tag: 'Sales'   },
  { title: 'Content Pipeline',     desc: 'Generate, review, and publish content at scale',     tag: 'Marketing' },
  { title: 'Blank Canvas',         desc: 'Start from scratch with AI guidance',                tag: 'Custom'  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep]         = useState(0)
  const [industry, setIndustry] = useState('')
  const [goal, setGoal]         = useState('')
  const [template, setTemplate] = useState('')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')

  const steps = ['Industry', 'Goal', 'Template', 'Account']
  const canNext = [
    !!industry,
    !!goal,
    !!template,
    name.trim().length > 1 && email.includes('@'),
  ]

  function handleFinish() {
    // In production: call your auth API here
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center">
            <Zap size={13} className="text-surface-900" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-white text-sm">LaunchAI</span>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs font-medium transition-all ${
                i < step ? 'text-brand-400' : i === step ? 'text-white' : 'text-gray-600'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                  ${i < step ? 'bg-brand-500 text-surface-900' :
                    i === step ? 'bg-white/10 text-white border border-white/20' :
                    'bg-white/5 text-gray-600'}`}>
                  {i < step ? <Check size={10} /> : i + 1}
                </div>
                <span className="hidden sm:block">{s}</span>
              </div>
              {i < steps.length - 1 && <div className="w-8 h-px bg-white/10" />}
            </div>
          ))}
        </div>
        <div className="w-20" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {/* Step 0: Industry */}
          {step === 0 && (
            <div className="animate-slide-up">
              <p className="section-label mb-2">Step 1 of 4</p>
              <h2 className="font-display text-2xl font-bold text-white mb-1">What's your industry?</h2>
              <p className="text-sm text-gray-400 mb-6">We'll suggest templates and tools relevant to your field.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {industries.map(ind => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`p-3 text-sm text-left rounded-xl border transition-all ${
                      industry === ind
                        ? 'border-brand-500/60 bg-brand-500/10 text-brand-300'
                        : 'border-white/8 bg-surface-800 text-gray-300 hover:border-white/20'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="animate-slide-up">
              <p className="section-label mb-2">Step 2 of 4</p>
              <h2 className="font-display text-2xl font-bold text-white mb-1">What do you want to build?</h2>
              <p className="text-sm text-gray-400 mb-6">Choose the best description of your goal.</p>
              <div className="space-y-3">
                {goals.map(g => (
                  <button
                    key={g.label}
                    onClick={() => setGoal(g.label)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      goal === g.label
                        ? 'border-brand-500/60 bg-brand-500/10'
                        : 'border-white/8 bg-surface-800 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl">{g.icon}</span>
                    <span className={`text-sm font-medium ${goal === g.label ? 'text-brand-300' : 'text-gray-200'}`}>
                      {g.label}
                    </span>
                    {goal === g.label && <Check size={14} className="ml-auto text-brand-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Template */}
          {step === 2 && (
            <div className="animate-slide-up">
              <p className="section-label mb-2">Step 3 of 4</p>
              <h2 className="font-display text-2xl font-bold text-white mb-1">Pick a starting template</h2>
              <p className="text-sm text-gray-400 mb-6">You can customise everything after — this just gives you a head start.</p>
              <div className="space-y-3">
                {templates.map(t => (
                  <button
                    key={t.title}
                    onClick={() => setTemplate(t.title)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                      template === t.title
                        ? 'border-brand-500/60 bg-brand-500/10'
                        : 'border-white/8 bg-surface-800 hover:border-white/20'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-sm font-semibold ${template === t.title ? 'text-brand-300' : 'text-white'}`}>
                          {t.title}
                        </span>
                        <span className="badge bg-white/5 text-gray-500 border border-white/8">{t.tag}</span>
                      </div>
                      <p className="text-xs text-gray-400">{t.desc}</p>
                    </div>
                    {template === t.title && <Check size={14} className="text-brand-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Account */}
          {step === 3 && (
            <div className="animate-slide-up">
              <p className="section-label mb-2">Step 4 of 4</p>
              <h2 className="font-display text-2xl font-bold text-white mb-1">Create your free account</h2>
              <p className="text-sm text-gray-400 mb-6">No credit card required. Your project is auto-saved.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Your name</label>
                  <input
                    className="input"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/15 text-xs text-gray-400">
                  <strong className="text-brand-400">Your setup:</strong> {industry} · {goal} · {template}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost text-sm py-2 px-4">
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext[step]}
                className="btn-primary text-sm py-2 px-5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!canNext[step]}
                className="btn-primary text-sm py-2 px-5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Launch my workspace <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
