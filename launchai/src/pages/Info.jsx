import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { ArrowLeft, Info, FileText, Shield, Clock } from 'lucide-react'

export default function InfoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname.substring(1) // e.g., 'privacy'
  const title = path.charAt(0).toUpperCase() + path.slice(1)

  const content = {
    privacy: {
      icon: Shield,
      desc: 'How we handle your data and protect your privacy.',
      text: 'Last updated: March 2026\n\nAt LaunchAI, we prioritize your data security. This is a placeholder for our Privacy Policy. For now, know that we store your API keys locally in your browser and never send them to our servers.'
    },
    terms: {
      icon: FileText,
      desc: 'The legal agreement between you and LaunchAI.',
      text: 'Last updated: March 2026\n\nBy using LaunchAI, you agree to build amazing things responsibly. This is a placeholder for our Terms of Service.'
    },
    changelog: {
      icon: Clock,
      desc: 'Latest updates and improvements to LaunchAI.',
      text: 'v0.1.0 — Initial Public Beta\n- Added AI Build Companion\n- Integrated Google Gemini & Claude\n- Premium UI Redesign'
    }
  }

  const active = content[path] || content.privacy
  const Icon = active.icon

  return (
    <div className="min-h-screen bg-void font-body flex flex-col">
      <Navbar minimal />
      {/* Sidebar is only for app pages, for legal pages we might not need it, or we can include it if the user is logged in. 
          But for simplicity, let's keep it clean. */}
      
      <main className="max-w-[700px] mx-auto pt-[120px] px-6 py-8 flex flex-col min-h-screen">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] text-text-muted hover:text-secondary transition-colors mb-12"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="mb-12">
          <div className="w-[48px] h-[48px] rounded-[12px] bg-accent-dim border border-glow flex items-center justify-center mb-6">
            <Icon size={20} className="text-accent" />
          </div>
          <h1 className="font-display text-[32px] font-semibold text-primary mb-2 tracking-[-0.03em]">{title}</h1>
          <p className="font-body text-[15px] text-secondary">{active.desc}</p>
        </div>

        <div className="card p-8 bg-raised text-secondary font-body text-[14px] leading-[1.8] whitespace-pre-line">
          {active.text}
        </div>
      </main>
    </div>
  )
}
