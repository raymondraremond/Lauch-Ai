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
      desc: 'Our commitment to your data security and privacy.',
      text: `Last updated: March 30, 2026

At LaunchAI, we believe that your data is yours alone. Our "Local-First" architecture ensures a premium, secure experience:

1. API Keys: Your Google Gemini and Anthropic Claude keys are stored exclusively in your browser's local storage. They are never transmitted to our backend.
2. Project Data: Your app configurations, prompts, and assets are stored locally for maximum privacy and speed.
3. Multimodal Data: When you upload images or documents for AI analysis, they are processed in real-time. We do not store these files on our servers.
4. Analytics: We collect minimal, anonymized usage data to improve the platform, never identifying specific users or their generated content.`
    },
    terms: {
      icon: FileText,
      desc: 'The agreement between you and the LaunchAI platform.',
      text: `Last updated: March 30, 2026

By utilizing the LaunchAI professional suite, you agree to the following:

1. Responsible Build: You will not use the AI Builder to generate harmful, illegal, or unethical content.
2. API Responsibility: You are responsible for the usage and billing associated with the API keys you provide.
3. Intellectual Property: You own 100% of the code exported from LaunchAI. We claim no ownership over the apps you build.
4. Beta Status: LaunchAI is currently in professional beta. While we strive for 99.9% stability, we recommend backing up your projects regularly.`
    },
    changelog: {
      icon: Clock,
      desc: 'Evolution of the LaunchAI Professional Suite.',
      text: `v3.1.2 — Multimodal & Professional Stability (Current)
- Implemented Multimodal File Uploads in Builder & Live Apps.
- Enforced Structured AI Project Critique scoring system.
- Added Robust Error Handling to prevent workspace crashes.
- Redesigned Exported Code with Premium Dark-Mode Aesthetics.
- Optimized Gemini 3.1 Flash integration for 40% faster syntheses.

v3.0.0 — The Professional Overhaul
- Introduced Glassmorphism & Mesh Glow design system.
- Added AI Copilot with global drag-and-drop file analysis.
- New "Project Critique" feature for automated app scoring.
- Side-by-side Live Preview in the AI Builder workspace.`
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
