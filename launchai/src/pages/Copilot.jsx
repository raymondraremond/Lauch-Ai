import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import ChatWidget from '../components/ChatWidget.jsx'
import { Lightbulb, Code2, Zap, TrendingUp, Compass, ArrowRight, UploadCloud } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  { icon: Lightbulb, text: 'Help me validate my AI product idea' },
  { icon: Code2,     text: 'Write a prompt for my chatbot' },
  { icon: Zap,       text: 'Which tools should I use for my app?' },
  { icon: TrendingUp,text: 'How do I get my first 100 users?' },
]

export default function Copilot() {
  const navigate = useNavigate()
  const [isGlobalDragging, setIsGlobalDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const chatRef = useRef(null)

  // Global Drag & Drop Handler
  useEffect(() => {
    const handleWindowDragOver = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleWindowDragEnter = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer.types.includes('Files')) {
        setDragCounter(prev => prev + 1)
        setIsGlobalDragging(true)
      }
    }

    const handleWindowDragLeave = (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.dataTransfer.types.includes('Files')) {
        const next = dragCounter - 1
        setDragCounter(next)
        if (next <= 0) setIsGlobalDragging(false)
      }
    }

    const handleWindowDrop = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setIsGlobalDragging(false)
      setDragCounter(0)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (chatRef.current) {
          chatRef.current.handleFiles(e.dataTransfer.files)
        }
      }
    }

    window.addEventListener('dragover', handleWindowDragOver)
    window.addEventListener('dragenter', handleWindowDragEnter)
    window.addEventListener('dragleave', handleWindowDragLeave)
    window.addEventListener('drop', handleWindowDrop)

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver)
      window.removeEventListener('dragenter', handleWindowDragEnter)
      window.removeEventListener('dragleave', handleWindowDragLeave)
      window.removeEventListener('drop', handleWindowDrop)
    }
  }, [dragCounter])

  return (
    <div className="min-h-screen bg-void font-body flex flex-col">
      {/* Global Drag Overlay */}
      {isGlobalDragging && (
        <div className="fixed inset-0 z-[200] bg-accent/10 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 border-[6px] border-dashed border-accent/40 m-8 rounded-[32px] pointer-events-none" />
          <div className="card-premium p-12 flex flex-col items-center shadow-2xl scale-110 pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-accent text-white flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(59,130,246,0.6)] animate-bounce-subtle">
              <UploadCloud size={48} />
            </div>
            <h2 className="font-display text-[32px] font-bold text-primary mb-2 tracking-tight text-center">Drop to Analyze Design</h2>
            <p className="font-body text-[16px] text-secondary text-center max-w-sm">
              Your screenshot will be analyzed by the AI Copilot to help you build faster.
            </p>
          </div>
        </div>
      )}

      <Navbar minimal />
      <Sidebar />

      <main className="ml-[220px] pt-[76px] px-8 py-8 flex flex-col min-h-screen">
        <div className="max-w-[1000px] mx-auto w-full flex-1 flex flex-col">
          <div className="mb-[32px]">
            <h1 className="font-display text-[28px] font-semibold text-primary mb-1 tracking-[-0.03em]">AI Copilot</h1>
            <p className="font-body text-[14px] text-secondary">
              Your AI product-building teammate — ask anything about your idea, tools, or building strategy.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] mb-[16px]">
            {SUGGESTIONS.map(s => (
              <div key={s.text} className="card-premium card-hover cursor-pointer flex items-start gap-[12px] py-[16px] px-[16px]">
                <div className="w-[32px] h-[32px] rounded-[8px] bg-accent-dim border border-glow flex justify-center items-center flex-shrink-0">
                  <s.icon size={16} className="text-accent" />
                </div>
                <span className="font-body text-[13px] text-primary leading-[1.5] tracking-[-0.01em]">{s.text}</span>
              </div>
            ))}
          </div>

          {/* Companion cross-promo */}
          <button
            onClick={() => navigate('/companion')}
            className="mb-[32px] flex items-center gap-3 px-4 py-3 rounded-[8px] border border-accent/15
                       bg-accent/[0.04] hover:bg-accent/[0.08] hover:border-accent/25
                       transition-all duration-200 group w-full text-left"
          >
            <Compass size={15} className="text-accent flex-shrink-0" />
            <span className="font-body text-[13px] text-secondary group-hover:text-primary transition-colors flex-1">
              <span className="text-accent font-medium">Stuck on an AI output?</span> Try the Build Companion — paste it in and get instant fixes.
            </span>
            <ArrowRight size={13} className="text-accent/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </button>

          <div className="flex-1 min-h-[500px]">
            <ChatWidget ref={chatRef} compact placeholder="Ask me anything about building your AI product…" />
          </div>
        </div>
      </main>
    </div>
  )
}
