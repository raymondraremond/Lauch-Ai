import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'

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
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-void flex flex-col font-body">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 h-[56px] border-b border-dim bg-base/50 backdrop-blur-md">
        <div className="flex items-center gap-[8px]">
          <div className="w-[6px] h-[6px] bg-accent rounded-[1px]"></div>
          <span className="font-display font-semibold text-primary text-[14px]">LaunchAI</span>
        </div>
        
        <div className="flex items-center gap-[8px]">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-[8px]">
              <div className={`flex items-center gap-[6px] text-[12px] font-medium transition-colors ${
                i < step ? 'text-accent' : i === step ? 'text-primary' : 'text-text-muted'
              }`}>
                <div className={`w-[20px] h-[20px] rounded-full flex items-center justify-center text-[11px] font-mono border transition-colors
                  ${i < step ? 'bg-accent text-white border-accent' :
                    i === step ? 'bg-accent-dim text-accent border-accent/30' :
                    'bg-overlay text-text-muted border-base'}`}>
                  {i < step ? <Check size={10} /> : i + 1}
                </div>
                <span className="hidden sm:block tracking-[-0.01em]">{s}</span>
              </div>
              {i < steps.length - 1 && <div className="w-[32px] h-[1px] bg-base" />}
            </div>
          ))}
        </div>
        <div className="w-[72px]" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="grain-overlay opacity-50"></div>
        <div className="w-full max-w-[500px] relative z-10">

          {/* Step 0: Industry */}
          {step === 0 && (
            <div className="animate-fade-up">
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-accent mb-[8px]">Step 1 of 4</p>
              <h2 className="font-display text-[28px] font-semibold text-primary mb-[4px] tracking-[-0.03em]">What's your industry?</h2>
              <p className="font-body text-[14px] text-secondary mb-[24px]">We'll suggest templates and tools relevant to your field.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-[12px]">
                {industries.map(ind => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`block w-full p-[12px] text-[13px] text-left rounded-[8px] border transition-all duration-150 ${
                      industry === ind
                        ? 'border-accent bg-accent-dim text-primary'
                        : 'border-base bg-raised text-secondary hover:border-lit hover:text-primary'
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
            <div className="animate-fade-up">
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-accent mb-[8px]">Step 2 of 4</p>
              <h2 className="font-display text-[28px] font-semibold text-primary mb-[4px] tracking-[-0.03em]">What do you want to build?</h2>
              <p className="font-body text-[14px] text-secondary mb-[24px]">Choose the best description of your goal.</p>
              
              <div className="space-y-[12px]">
                {goals.map(g => (
                  <button
                    key={g.label}
                    onClick={() => setGoal(g.label)}
                    className={`w-full flex items-center gap-[12px] p-[16px] rounded-[8px] border text-left transition-all duration-150 ${
                      goal === g.label
                        ? 'border-accent bg-accent-dim text-primary'
                        : 'border-base bg-raised text-secondary hover:border-lit hover:text-primary'
                    }`}
                  >
                    <span className="text-[20px]">{g.icon}</span>
                    <span className="text-[14px] font-medium tracking-[-0.01em]">
                      {g.label}
                    </span>
                    {goal === g.label && <Check size={16} className="ml-auto text-accent" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Template */}
          {step === 2 && (
            <div className="animate-fade-up">
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-accent mb-[8px]">Step 3 of 4</p>
              <h2 className="font-display text-[28px] font-semibold text-primary mb-[4px] tracking-[-0.03em]">Pick a starting template</h2>
              <p className="font-body text-[14px] text-secondary mb-[24px]">You can customise everything after — this just gives you a head start.</p>
              
              <div className="space-y-[12px]">
                {templates.map(t => (
                  <button
                    key={t.title}
                    onClick={() => setTemplate(t.title)}
                    className={`w-full flex items-center gap-[16px] p-[16px] rounded-[8px] border text-left transition-all duration-150 ${
                      template === t.title
                        ? 'border-accent bg-accent-dim text-primary'
                        : 'border-base bg-raised text-secondary hover:border-lit hover:text-primary'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <span className="text-[14px] font-medium tracking-[-0.01em]">
                          {t.title}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.05em] px-[6px] py-[2px] rounded-[4px] bg-overlay text-text-muted border border-base uppercase">{t.tag}</span>
                      </div>
                      <p className="text-[13px] text-text-muted">{t.desc}</p>
                    </div>
                    {template === t.title && <Check size={16} className="text-accent flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Account */}
          {step === 3 && (
            <div className="animate-fade-up">
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-accent mb-[8px]">Step 4 of 4</p>
              <h2 className="font-display text-[28px] font-semibold text-primary mb-[4px] tracking-[-0.03em]">Create your free account</h2>
              <p className="font-body text-[14px] text-secondary mb-[24px]">No credit card required. Your project is auto-saved.</p>
              
              <div className="space-y-[16px]">
                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-[8px]">Your name</label>
                  <input
                    className="input"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-secondary mb-[8px]">Email address</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="mt-[24px] p-[12px] rounded-[8px] bg-accent-dim border border-accent/20 text-[12px] text-secondary">
                  <strong className="text-accent font-medium">Your setup:</strong> {industry} · {goal} · {template}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-[32px] pt-[24px] border-t border-dim">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex items-center gap-[8px] py-[8px] px-[16px] !rounded-[6px]">
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            <button
              onClick={step < steps.length - 1 ? () => setStep(s => s + 1) : handleFinish}
              disabled={!canNext[step]}
              className={`btn-primary flex items-center gap-[8px] py-[8px] px-[16px] !rounded-[6px] ${!canNext[step] ? 'opacity-50 cursor-not-allowed hover:-translate-y-0 hover:bg-accent' : ''}`}
            >
              {step < steps.length - 1 ? 'Continue' : 'Launch my workspace'} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
