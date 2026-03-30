import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Send, Bot, User, Loader } from 'lucide-react'

const SYSTEM_PROMPT = `You are the LaunchAI Copilot — an expert AI product-building assistant.
You help users build their AI apps by suggesting and adding components to the canvas.

AVAILABLE COMPONENTS:
- text-input: For short text entries
- textarea: For long text or content
- toggle: For on/off settings
- dropdown: For selecting from a list
- ai-chat: A chat interface for AI interaction
- chart: For data visualization

ACTION TAGS:
If you want to add a component, include this tag in your message:
[ACTION:ADD, type:COMPONENT_TYPE, label:DISPLAY_LABEL]

Example: "I've added a text input for the user's name. [ACTION:ADD, type:text-input, label:User Name]"

Keep responses concise and focused on building. One step at a time.`

export default function ChatWidget({ placeholder = "Ask your AI copilot anything…", compact = false, onAction = () => {} }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your LaunchAI Copilot. Tell me about your idea and I'll help you build it step by step. What problem do you want to solve?",
    },
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const apiKey    = import.meta.env.VITE_ANTHROPIC_API_KEY

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)

    const processReply = (reply, provider) => {
      // Parse actions: [ACTION:ADD, type:text-input, label:Name]
      const actionRegex = /\[ACTION:(\w+),\s*type:([\w-]+),\s*label:([^\]]+)\]/g
      let match
      let cleanReply = reply

      while ((match = actionRegex.exec(reply)) !== null) {
        const [full, action, type, label] = match
        onAction({ action, type, label: label.trim() })
        cleanReply = cleanReply.replace(full, '').trim()
      }

      setMessages(prev => [...prev, { role: 'assistant', content: cleanReply, provider }])
      setLoading(false)
    }

    // Check localStorage first, then fallback to import.meta.env
    const anthropicKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY') || import.meta.env.VITE_ANTHROPIC_API_KEY
    const geminiKey    = localStorage.getItem('VITE_GOOGLE_API_KEY') || import.meta.env.VITE_GOOGLE_API_KEY

    // 1. Try Gemini (Free Tier priority)
    if (geminiKey) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: updated.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
              })),
              generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
            }),
          }
        )
        const data = await res.json()
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (reply) {
          processReply(reply, 'Gemini')
          return
        }
      } catch (err) {
        console.error('Gemini failed:', err)
      }
    }

    // 2. Try Anthropic
    if (anthropicKey) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: 800,
            system: SYSTEM_PROMPT,
            messages: updated.map(m => ({ role: m.role, content: m.content })),
          }),
        })
        const data = await res.json()
        const reply = data.content?.[0]?.text
        if (reply) {
          processReply(reply, 'Claude')
          return
        }
      } catch (err) {
        console.error('Anthropic failed:', err)
      }
    }

    // 3. Demo Fallback
    await new Promise(r => setTimeout(r, 800))
    processReply(getDemoResponse(text), 'Demo')
  }

  function getDemoResponse(text) {
    const t = text.toLowerCase()
    if (t.includes('text') || t.includes('input'))
      return "Done! I've added a text input for you. [ACTION:ADD, type:text-input, label:New Input]"
    if (t.includes('chat') || t.includes('ai'))
      return "I've added an AI Chat block so your users can talk to your model. [ACTION:ADD, type:ai-chat, label:AI Assistant]"
    if (t.includes('check') || t.includes('toggle'))
      return "Added a toggle switch for you. [ACTION:ADD, type:toggle, label:Enable Feature]"
    return "I can help you build your app! Try asking me to 'add a text input' or 'add a chat block'. I'll update the canvas for you."
  }

  const hasGemini = !!(localStorage.getItem('VITE_GOOGLE_API_KEY') || import.meta.env.VITE_GOOGLE_API_KEY)
  const hasClaude = !!(localStorage.getItem('VITE_ANTHROPIC_API_KEY') || import.meta.env.VITE_ANTHROPIC_API_KEY)
  const isLive   = hasGemini || hasClaude

  return (
    <div className={`flex flex-col bg-raised border border-base rounded-[12px] overflow-hidden font-body
                     ${compact ? 'h-full flex-1' : 'h-[600px]'}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-[28px] h-[28px] rounded-[6px] flex-shrink-0 flex items-center justify-center
              ${m.role === 'assistant' ? 'bg-accent-dim text-accent border border-glow' : 'bg-muted text-secondary border border-base'}`}>
              {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div className={`text-[13px] leading-[1.65] rounded-[10px] px-4 py-3 whitespace-pre-line tracking-[-0.01em]
                ${m.role === 'assistant'
                  ? 'bg-overlay text-primary border border-base rounded-tl-[2px]'
                  : 'bg-accent-dim text-primary border border-accent/20 rounded-tr-[2px]'}`}>
                {m.content}
              </div>
              {m.provider && (
                <span className={`font-mono text-[9px] tracking-[0.05em] uppercase px-1
                  ${m.provider === 'Demo' ? 'text-amber-500' : 'text-accent'}`}>
                  via {m.provider}
                </span>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-[12px]">
            <div className="w-[28px] h-[28px] rounded-[6px] bg-accent-dim border border-glow flex items-center justify-center">
              <Bot size={14} className="text-accent" />
            </div>
            <div className="bg-overlay border border-base rounded-[10px] rounded-tl-[2px] px-4 py-3 flex items-center gap-[6px]">
              <span className="w-[6px] h-[6px] rounded-full bg-accent animate-pulse [animation-delay:0ms]" />
              <span className="w-[6px] h-[6px] rounded-full bg-accent animate-pulse [animation-delay:150ms]" />
              <span className="w-[6px] h-[6px] rounded-full bg-accent animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-base bg-base">
        <div className="flex gap-[8px]">
          <input
            className="input flex-1"
            placeholder={placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-[40px] h-[40px] rounded-[7px] bg-accent hover:bg-accent-hover text-white disabled:opacity-50
                       disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-none"
          >
            {loading ? <Loader size={16} className="animate-spin" />
                     : <Send size={15} />}
          </button>
        </div>
        {!isLive && (
          <p className="font-mono text-[10px] text-text-muted mt-3 text-center tracking-[0.05em] uppercase">
            Demo mode — add a key in <Link to="/settings" className="text-accent lowercase hover:underline">Settings</Link> for live AI
          </p>
        )}
      </div>
    </div>
  )
}
