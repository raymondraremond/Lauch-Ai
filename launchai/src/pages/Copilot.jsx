import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import ChatWidget from '../components/ChatWidget.jsx'
import { Lightbulb, Code2, Zap, TrendingUp } from 'lucide-react'

const SUGGESTIONS = [
  { icon: Lightbulb, text: 'Help me validate my AI product idea' },
  { icon: Code2,     text: 'Write a prompt for my chatbot' },
  { icon: Zap,       text: 'Which tools should I use for my app?' },
  { icon: TrendingUp,text: 'How do I get my first 100 users?' },
]

export default function Copilot() {
  return (
    <div className="min-h-screen bg-surface-900 font-body">
      <Navbar minimal />
      <Sidebar />

      <main className="ml-56 pt-20 px-8 py-8 flex flex-col h-screen">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white mb-1">AI Copilot</h1>
          <p className="text-sm text-gray-500">
            Your AI product-building teammate — ask anything about your idea, tools, or building strategy.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {SUGGESTIONS.map(s => (
            <div key={s.text} className="card-hover flex items-center gap-2.5 py-3">
              <s.icon size={14} className="text-brand-400 flex-shrink-0" />
              <span className="text-xs text-gray-300 leading-tight">{s.text}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 min-h-0">
          <ChatWidget placeholder="Ask me anything about building your AI product…" />
        </div>
      </main>
    </div>
  )
}
