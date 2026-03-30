import { Send, Bot, User, Loader, X, Sparkles, Image as ImageIcon, UploadCloud } from 'lucide-react'
import { callGeminiWithRotation, getGeminiKeys } from '../lib/ApiKeyManager.js'

const SYSTEM_PROMPT = `You are the LaunchAI Copilot, a world-class AI developer.
Your goal is to help users build sophisticated AI applications by adding components to their canvas.

ACTION TAGS:
- Add components: [ACTION:ADD, type:TYPE, label:LABEL, variableId:VAR_ID, systemPrompt:PROMPT]
- TYPEs: text-input, textarea, toggle, dropdown, ai-chat, chart, weather-card, api-status, structured-result, file-upload
- LOGICAL BINDING: Always assign a logical 'variableId' (e.g., 'user_query', 'document_file').
- AI BLOCKS: For 'structured-result' or 'ai-chat', you can pre-configure the 'systemPrompt' using {{variableId}} syntax.
- VISUAL ANALYSIS: If an image is provided, suggest the closest LaunchAI match.
- Example: "I'll add a city input and a weather predictor. [ACTION:ADD, type:text-input, label:City, variableId:city] [ACTION:ADD, type:structured-result, label:Forecast, variableId:out, systemPrompt:Provide a weather forecast for {{city}}]"

Keep responses concise and focused on building. Don't explain too much, just act.`

const ChatWidget = forwardRef(({ placeholder = "Ask your AI copilot anything…", compact = false, onAction = () => {} }, ref) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your LaunchAI Copilot. Tell me about your idea and I'll help you build it step by step. What problem do you want to solve?",
    },
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imageType, setImageType] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useImperativeHandle(ref, () => ({
    handleFiles
  }))

  async function sendMessage() {
    const text = input.trim()
    if ((!text && !uploadedImage) || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text, image: uploadedImage }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)

    const processReply = (reply, provider) => {
      // Parse actions: [ACTION:ADD, type:..., label:..., variableId:..., systemPrompt:...]
      const actionRegex = /\[ACTION:(\w+),\s*type:([\w-]+),\s*label:([^,\]]+)(?:,\s*variableId:([^,\]]+))?(?:,\s*systemPrompt:([^\]]+))?\]/g
      let match
      let cleanReply = reply

      while ((match = actionRegex.exec(reply)) !== null) {
        const [full, action, type, label, variableId, systemPrompt] = match
        const data = { action, type, label: label.trim() }
        if (variableId) data.variableId = variableId.trim()
        if (systemPrompt) data.systemPrompt = systemPrompt.trim()
        
        onAction(data)
        cleanReply = cleanReply.replace(full, '')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: cleanReply.trim(), provider }])
      setLoading(false)
    }

    const anthropicKey = localStorage.getItem('VITE_ANTHROPIC_API_KEY') || import.meta.env.VITE_ANTHROPIC_API_KEY
    const geminiKeys   = getGeminiKeys()

    if (geminiKeys.length > 0 || import.meta.env.VITE_GOOGLE_API_KEY) {
      try {
        const geminiHistory = updated[0].role === 'assistant' ? updated.slice(1) : updated
        const parts = [{ text: text }]
        if (uploadedImage) {
          parts.push({
            inline_data: {
              mime_type: imageType,
              data: uploadedImage.split(',')[1]
            }
          })
        }

        const reply = await callGeminiWithRotation(async (apiKey) => {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: [
                  ...geminiHistory.slice(0, -1).map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                  })),
                  { role: 'user', parts: parts }
                ],
                generationConfig: { maxOutputTokens: 800, temperature: 0.7 },
              }),
            }
          )
          
          if (!res.ok) {
            const errBody = await res.text()
            throw new Error(`Gemini API error: ${res.status} — ${errBody}`)
          }
          
          const data = await res.json()
          return data.candidates?.[0]?.content?.parts?.[0]?.text
        })

        if (reply) {
          setUploadedImage(null)
          setImageType(null)
          processReply(reply, 'Gemini')
          return
        }
      } catch (err) { 
        console.error('Gemini rotation failed:', err)
        // If it's a real failure after trying all keys, show it
        if (!err.message.includes('No Gemini API keys')) {
          setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Gemini Error: ${err.message}`, provider: 'Error' }])
          setLoading(false)
          return
        }
      }
    }

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

    await new Promise(r => setTimeout(r, 800))
    processReply(getDemoResponse(text), 'Demo')
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true)
    else if (e.type === 'dragleave') setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files) => {
    const file = files[0]
    if (!file || !file.type.startsWith('image/')) return
    setImageType(file.type)
    const reader = new FileReader()
    reader.onloadend = () => setUploadedImage(reader.result)
    reader.readAsDataURL(file)
  }

  function handleImageUpload(e) {
    if (e.target.files) handleFiles(e.target.files)
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

  const hasGemini = getGeminiKeys().length > 0 || !!import.meta.env.VITE_GOOGLE_API_KEY
  const hasClaude = !!(localStorage.getItem('VITE_ANTHROPIC_API_KEY') || import.meta.env.VITE_ANTHROPIC_API_KEY)
  const isLive   = hasGemini || hasClaude

  return (
    <div 
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`flex flex-col bg-raised border border-base rounded-[12px] overflow-hidden font-body relative
                     ${compact ? 'h-full flex-1' : 'h-[600px]'}`}>
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-accent/20 backdrop-blur-md border-[3px] border-dashed border-accent m-2 rounded-[10px] flex flex-col items-center justify-center pointer-events-none animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            <Sparkles size={32} className="animate-pulse" />
          </div>
          <span className="text-primary font-bold text-lg tracking-tight">Drop screenshot to rebuild</span>
          <span className="text-secondary text-sm mt-1">Our AI will analyze your design instantly</span>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-[28px] h-[28px] rounded-[6px] flex-shrink-0 flex items-center justify-center
              ${m.role === 'assistant' ? 'bg-accent-dim text-accent border border-glow' : 'bg-muted text-secondary border border-base'}`}>
              {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <div className="flex flex-col gap-1 max-w-[80%]">
              {m.image && <img src={m.image} className="rounded-lg border border-base mb-2 max-w-[200px]" />}
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

      <div className="p-4 bg-overlay border-t border-base">
        {uploadedImage && (
          <div className="mb-3 relative inline-block animate-fade-in">
            <img src={uploadedImage} className="w-16 h-16 rounded-lg object-cover border border-lit shadow-lg" alt="Upload preview" />
            <button onClick={() => setUploadedImage(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center border border-void">
              <X size={10} />
            </button>
          </div>
        )}
        <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex items-center gap-[8px]">
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-[36px] h-[36px] rounded-[10px] bg-base flex flex-shrink-0 items-center justify-center text-secondary hover:text-primary hover:border-lit border border-base transition-all" title="Upload screenshot">
            <ImageIcon size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 input bg-void/50 border-base focus:border-accent/40 placeholder:text-text-muted"
          />
          <button
            type="submit"
            disabled={(!input.trim() && !uploadedImage) || loading}
            className="w-[36px] h-[36px] rounded-[10px] bg-accent text-white flex flex-shrink-0 items-center justify-center shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
        <p className="mt-3 font-mono text-[9px] tracking-[0.1em] text-text-muted text-center uppercase opacity-50">
          {isLive ? 'AI Active (Live Mode)' : 'Demo Mode — add a key in Settings for live AI'}
        </p>
      </div>
    </div>
  )
})

export default ChatWidget
