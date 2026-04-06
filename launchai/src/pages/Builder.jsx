import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import ChatWidget from '../components/ChatWidget.jsx'
import { getProjectById, saveProject, getBestPracticeTemplate } from '../lib/ProjectStore.js'
import { callAI } from '../lib/AIClient.js'
import { AI_MODELS } from '../lib/AIConfig.js'
import {
  Type, AlignLeft, ToggleLeft, List, MessageSquare, BarChart2,
  Trash2, Move, Eye, Save, Rocket, GripVertical, Plus, Settings2,
  Check, Sparkles, ArrowRight, Cloud, Activity, FileText, Download, X,
  ChevronUp, ChevronDown, UploadCloud, Compass, Loader2, Wand2
} from 'lucide-react'

const PALETTE = [
  { type: 'text-input',  label: 'Text Input',   icon: Type,          preview: <input placeholder="Enter text…" className="input" /> },
  { type: 'textarea',    label: 'Text Area',     icon: AlignLeft,     preview: <textarea placeholder="Enter description…" rows={2} className="input resize-none" /> },
  { type: 'toggle',      label: 'Toggle',        icon: ToggleLeft,    preview: <div className="flex items-center gap-[8px]"><div className="w-[32px] h-[16px] rounded-full bg-accent/40 relative"><div className="absolute right-[2px] top-[2px] w-[12px] h-[12px] rounded-full bg-accent" /></div><span className="font-body text-[13px] text-secondary">Enabled</span></div> },
  { type: 'dropdown',    label: 'Dropdown',      icon: List,          preview: <select className="input cursor-default opacity-50"><option>Select option…</option></select> },
  { type: 'weather-card',label: 'Weather Card',  icon: Cloud,         preview: <div className="p-3 bg-raised border border-base rounded-[8px] flex items-center justify-between"><div className="flex flex-col"><span className="text-[18px] font-mono text-primary">24°C</span><span className="text-[11px] text-secondary uppercase tracking-wider">Partly Cloudy</span></div><Cloud size={24} className="text-secondary" /></div> },
  { type: 'api-status',  label: 'API Status',    icon: Activity,      preview: <div className="p-2 border border-success/20 bg-success/5 rounded-[6px] flex items-center gap-2"><div className="w-[6px] h-[6px] rounded-full bg-success animate-pulse" /><span className="font-mono text-[10px] text-success uppercase tracking-wider">Backend Healthy</span></div> },
  { type: 'structured-result', label: 'AI Output Box', icon: FileText, preview: <div className="p-3 border border-dim bg-overlay rounded-[8px] space-y-2"><div className="h-[4px] w-[60%] bg-accent/20 rounded-full" /><div className="h-[4px] w-[40%] bg-accent/10 rounded-full" /></div> },
  { type: 'ai-chat',     label: 'AI Chat Widget',icon: MessageSquare, preview: <div className="p-2 border border-dashed border-accent bg-accent-dim rounded-[8px] font-mono text-[11px] uppercase tracking-[0.05em] text-accent flex items-center gap-[4px]"><MessageSquare size={13}/> AI Chat Block</div> },
  { type: 'chart',       label: 'Chart',         icon: BarChart2,     preview: <div className="flex items-end gap-[4px] h-[32px]">{[60,40,80,50,90,70].map((h,i)=><div key={i} style={{height:`${h}%`}} className="flex-1 rounded-[2px] bg-accent/40" />)}</div> },
  { type: 'file-upload', label: 'File Upload',   icon: UploadCloud,   preview: <div className="p-2 border border-dashed border-secondary bg-overlay rounded-[8px] flex items-center justify-center gap-2"><UploadCloud size={14} className="text-secondary"/><span className="text-[10px] text-secondary">Drop files...</span></div> },
]

// ─── Idea-to-Scaffold Modal ──────────────────────────────────────────────────
const SCAFFOLD_SYSTEM_PROMPT = `You are a LaunchAI app scaffolder. Given a product idea description, output ONLY a valid JSON object. Do not include markdown codeblocks, conversational text, or explanations.

Rules:
- Types allowed: text-input, textarea, toggle, dropdown, file-upload, structured-result, ai-chat, chart, weather-card, api-status
- Build 3-6 components that form a complete, functional app.
- Provide a concise product name.

Output format example:
{ 
  "name": "Invoice Analyzer", 
  "components": [
    {"type":"file-upload","label":"Upload Invoice","variableId":"invoice_file","systemPrompt":""},
    {"type":"structured-result","label":"AI Analysis","variableId":"analysis","systemPrompt":"Analyze the invoice at {{invoice_file}} and extract: vendor, total, line items, due date."}
  ] 
}`

function IdeaScaffoldModal({ onScaffold, onUseTemplate, onBlank, onCancel }) {
  const [idea, setIdea] = useState('')
  const [isBuilding, setIsBuilding] = useState(false)
  const [error, setError] = useState(null)

  const IDEA_EXAMPLES = [
    'A customer support bot for a SaaS tool',
    'An invoice analyzer that extracts data from PDFs',
    'A lead qualification form with AI scoring',
    'A social media post generator',
    'A legal document summarizer',
  ]

  async function handleBuildFromIdea() {
    if (!idea.trim()) return
    setIsBuilding(true)
    setError(null)
    try {
      const data = await callAI({
        parts: [
          { text: SCAFFOLD_SYSTEM_PROMPT },
          { text: `Product idea: ${idea.trim()}` }
        ],
        model: AI_MODELS.DEFAULT_GENERATION
      })
      
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      
      // Extremely robust JSON extraction
      let clean = raw.trim()
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i) || raw.match(/({[\s\S]*})/)
      if (jsonMatch) clean = jsonMatch[1].trim()
      
      const parsed = JSON.parse(clean)
      const parsedComps = parsed.components || (Array.isArray(parsed) ? parsed : [])
      
      const components = parsedComps.map((c, i) => ({
        id: Date.now().toString() + i,
        type: c.type,
        label: c.label || 'Component',
        variableId: c.variableId || `var_${i}`,
        systemPrompt: c.systemPrompt || ''
      }))
      
      onScaffold(components, parsed.name || idea.trim())
    } catch (err) {
      console.error('Scaffold error:', err)
      setError(err.message === 'Failed to fetch' || !err.message 
        ? 'Network error. Please check your connection.'
        : err.message.length < 100 
          ? err.message 
          : 'Could not parse AI response. Try rephrasing your idea.')
      setIsBuilding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-void/80">
      <div className="card-premium p-8 max-w-[560px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-[36px] h-[36px] rounded-[10px] bg-gradient-to-br from-accent to-[#7c3aed] flex items-center justify-center shadow-lg shadow-accent/25">
            <Wand2 size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-[22px] font-semibold text-primary tracking-[-0.03em]">What do you want to build?</h2>
            <p className="font-body text-[13px] text-secondary">Describe your idea — AI will scaffold the whole app for you.</p>
          </div>
        </div>

        {/* Idea Input */}
        <div className="mt-6">
          <textarea
            className="input w-full min-h-[100px] resize-none text-[14px] leading-[1.65] bg-void/50"
            placeholder="e.g. A customer support bot that reads uploaded documents and answers questions about them"
            value={idea}
            onChange={e => setIdea(e.target.value)}
            disabled={isBuilding}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleBuildFromIdea() }}
          />
        </div>

        {/* Quick Examples */}
        {!isBuilding && (
          <div className="flex flex-wrap gap-2 mt-3">
            {IDEA_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setIdea(ex)}
                className="font-body text-[11px] px-[10px] py-[5px] rounded-full border border-base bg-raised text-secondary hover:border-accent/40 hover:text-accent transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-3 text-[12px] text-danger font-body">{error}</p>}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleBuildFromIdea}
            disabled={!idea.trim() || isBuilding}
            className={`btn-primary w-full py-3 text-[14px] flex items-center justify-center gap-2 ${
              !idea.trim() || isBuilding ? 'opacity-50 cursor-not-allowed hover:translate-y-0' : ''
            }`}
          >
            {isBuilding
              ? <><Loader2 size={16} className="animate-spin" /> Building your app&hellip;</>
              : <><Sparkles size={16} /> Build this app <ArrowRight size={14} /></>}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onUseTemplate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] border border-base bg-raised text-[13px] text-secondary hover:border-lit hover:text-primary transition-all"
            >
              Use Template
            </button>
            <button
              onClick={onBlank}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] border border-base bg-raised text-[13px] text-secondary hover:border-lit hover:text-primary transition-all"
            >
              Blank Canvas
            </button>
          </div>
        </div>

        <button onClick={onCancel} className="mt-6 text-[12px] text-text-muted hover:text-secondary block mx-auto font-body transition-colors">Cancel</button>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

function InteractivePreview({ comp, palette }) {
  const [val, setVal] = useState('');
  if (comp.type === 'text-input') return <input value={val} onChange={e=>setVal(e.target.value)} onClick={e=>e.stopPropagation()} placeholder="Enter text…" className="input w-full" />;
  if (comp.type === 'textarea') return <textarea value={val} onChange={e=>setVal(e.target.value)} onClick={e=>e.stopPropagation()} placeholder="Enter description…" rows={2} className="input resize-none w-full" />;
  return palette?.preview;
}

export default function Builder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const projectId = searchParams.get('id')

  // State
  const [projectIdState, setProjectIdState] = useState(projectId || null)
  const [projectName, setProjectName] = useState('Untitled App')
  const [components, setComponents]   = useState([])
  const [selected, setSelected]       = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving]       = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [draggingPalette, setDragging] = useState(null)
  const [showTemplateModal, setShowTemplateModal] = useState(!projectId)
  const [isGlobalDragging, setIsGlobalDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const [isLoading, setIsLoading] = useState(!!projectId)
  const [error, setError] = useState(null)
  const chatRef = useRef(null)

  // Load project or initialize
  useEffect(() => {
    if (projectIdState) {
      async function loadProject() {
        try {
          setIsLoading(true)
          const p = await getProjectById(projectIdState)
          if (p) {
            setProjectName(p.name)
            setComponents(p.components || [])
            setShowTemplateModal(false)
          } else {
            setError('Project not found')
          }
        } catch (err) {
          setError('Failed to load project')
          console.error(err)
        } finally {
          setIsLoading(false)
        }
      }
      loadProject()
    }
  }, [projectIdState])

  const addComponent = (type) => {
    const def = PALETTE.find(p => p.type === type)
    const id = Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const newComp = { 
      id, 
      type, 
      label: def.label,
      variableId: `${type.replace(/-/g, '_')}_${id.toString().slice(-4)}`,
      systemPrompt: type === 'structured-result' || type === 'ai-chat' ? "Analyze the input and provide a detailed response." : ""
    }
    setComponents(prev => [...prev, newComp])
    setSelected(id)
  }

  const removeComponent = (id) => {
    setComponents(prev => prev.filter(c => c.id !== id))
    if (selected === id) setSelected(null)
  }

  const updateComponent = (id, updates) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const moveComponent = (id, direction) => {
    const idx = components.findIndex(c => c.id === id)
    if (idx === -1) return
    const newIdx = direction === 'up' ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= components.length) return
    
    const newComponents = [...components]
    const [removed] = newComponents.splice(idx, 1)
    newComponents.splice(newIdx, 0, removed)
    setComponents(newComponents)
  }

  const handleSave = useCallback(async (silent = false) => {
    setIsSaving(true)
    const p = {
      id: projectIdState,
      name: projectName,
      components,
      status: 'draft'
    }
    try {
      const saved = await saveProject(p)
      if (!projectIdState) {
        setProjectIdState(saved.id)
        // Update URL without reload to reflect new ID
        window.history.replaceState(null, '', `/builder?id=${saved.id}`)
      }
      if (!silent) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
      return saved
    } catch (err) {
      console.error('Failed to save project:', err)
      if (!silent) {
        alert('Failed to save project: ' + (err.message || 'Please check your connection and login status.'))
      }
      throw err; // throw so the caller knows it failed
    } finally {
      setIsSaving(false)
    }
  }, [projectIdState, projectName, components])

  const handleUseTemplate = () => {
    const template = getBestPracticeTemplate()
    setProjectName(template.name)
    setComponents(template.components)
    setShowTemplateModal(false)
  }

  const handleStartBlank = () => {
    setShowTemplateModal(false)
  }

  const handleAiAction = useCallback((actionData) => {
    if (actionData.action === 'ADD') {
      const { type, label, variableId, systemPrompt } = actionData
      const id = Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      setComponents(prev => [...prev, { 
        id, 
        type, 
        label,
        variableId: variableId || `${type.replace(/-/g, '_')}_${id.toString().slice(-4)}`,
        systemPrompt: systemPrompt || (type === 'structured-result' || type === 'ai-chat' ? "Analyze the input and provide a detailed response." : "")
      }])
      setSelected(id)
    }
  }, [])

  useEffect(() => {
    const handleWindowDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
    const handleWindowDragEnter = (e) => {
      e.preventDefault(); e.stopPropagation()
      if (e.dataTransfer.types.includes('Files')) {
        setDragCounter(prev => prev + 1)
        setIsGlobalDragging(true)
      }
    }
    const handleWindowDragLeave = (e) => {
      e.preventDefault(); e.stopPropagation()
      if (e.dataTransfer.types.includes('Files')) {
        const next = dragCounter - 1
        setDragCounter(next)
        if (next <= 0) setIsGlobalDragging(false)
      }
    }
    const handleWindowDrop = (e) => {
      e.preventDefault(); e.stopPropagation()
      setIsGlobalDragging(false)
      setDragCounter(0)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        if (chatRef.current) chatRef.current.handleFiles(e.dataTransfer.files)
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

  function downloadProjectCode(returnAsString = false) {
    const code = `
import React, { useState, useEffect } from 'react';
import { 
  Zap, Send, MessageSquare, Cloud, Activity, BarChart2, 
  CheckCircle, ChevronDown, UploadCloud, FileText, Sparkles, X, Eye,
  Type, AlignLeft, ToggleLeft, List
} from 'lucide-react';

/**
 * ${projectName} - Generated by LaunchAI
 * Copy this content into a .jsx file in your React project.
 * Ensure 'lucide-react' is installed.
 */

export default function App() {
  const [values, setValues] = useState({});
  const [fileData, setFileData] = useState({});
  const [outputs, setOutputs] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('idle');

  // SET YOUR KEY HERE
  const API_KEY = "YOUR_GEMINI_API_KEY";

  const components = ${JSON.stringify(components, null, 2)};

  const handleFileUpload = (variableId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileData(prev => ({ 
        ...prev, 
        [variableId]: { 
          mime_type: file.type, 
          data: event.target.result.split(',')[1], 
          name: file.name 
        } 
      }));
    };
    reader.readAsDataURL(file);
  };

  async function handleRun() {
    if (API_KEY === "YOUR_GEMINI_API_KEY") { 
      alert("Please set your Gemini API Key in the code first!"); 
      return; 
    }
    setIsProcessing(true);
    setStatus('processing');
    try {
      const newOutputs = { ...outputs };
      const aiBlocks = components.filter(c => c.type === 'structured-result' || c.type === 'ai-chat');
      
      for (const block of aiBlocks) {
        let promptText = block.systemPrompt || "Analyze the context.";
        const inlineData = [];
        
        components.forEach(c => {
          if (!c.variableId) return;
          const placeholder = \`{{\${c.variableId}}}\`;
          if (promptText.includes(placeholder)) {
            if (fileData[c.variableId]) {
              inlineData.push({ 
                inline_data: { 
                  mime_type: fileData[c.variableId].mime_type, 
                  data: fileData[c.variableId].data 
                } 
              });
              promptText = promptText.replace(placeholder, '[Attached File]');
            } else {
              promptText = promptText.replace(placeholder, values[c.id] || "");
            }
          }
        });

        const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${API_KEY}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            contents: [{ 
              parts: [{ text: promptText }, ...inlineData] 
            }],
            generationConfig: { maxOutputTokens: 1024 }
          })
        });
        const data = await res.json();
        newOutputs[block.id] = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error communicating with AI.";
      }
      setOutputs(newOutputs);
      setStatus('success');
    } catch (e) { 
      console.error(e);
      alert("Error: " + e.message); 
    } finally { 
      setIsProcessing(false); 
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#edeff2] p-4 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="flex items-center justify-between border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">${projectName}</h1>
            <p className="text-sm text-neutral-500 font-medium uppercase tracking-wider">AI Application • Generated by LaunchAI</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
            <div className={\`w-2 h-2 rounded-full \${status === 'success' ? 'bg-green-500' : 'bg-blue-500'}\`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">\${status}</span>
          </div>
        </header>

        <section className="bg-[#141417] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl space-y-8">
          {components.map(c => (
            <div key={c.id} className="group space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.1em]">\${c.label}</label>
                {values[c.id] && <CheckCircle size={12} className="text-green-500 opacity-50" />}
              </div>

              {/* Text Inputs */}
              {(c.type === 'text-input' || c.type === 'textarea') && (
                c.type === 'text-input' ? (
                  <input 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-neutral-700" 
                    placeholder="Enter value..."
                    onChange={e => setValues({...values, [c.id]: e.target.value})} 
                  />
                ) : (
                  <textarea 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all min-h-[120px] placeholder:text-neutral-700" 
                    placeholder="Describe more details..."
                    onChange={e => setValues({...values, [c.id]: e.target.value})} 
                  />
                )
              )}

              {/* Selection & Toggles */}
              {c.type === 'toggle' && (
                <button 
                  onClick={() => setValues({...values, [c.id]: !values[c.id]})}
                  className={\`w-14 h-7 rounded-full p-1 transition-colors \${values[c.id] ? 'bg-blue-600' : 'bg-neutral-800'}\`}
                >
                  <div className={\`w-5 h-5 bg-white rounded-full transition-transform \${values[c.id] ? 'translate-x-7' : 'translate-x-0'}\`} />
                </button>
              )}

              {c.type === 'dropdown' && (
                <select className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white hover:border-white/20 transition-all cursor-pointer outline-none">
                  <option>Select Option...</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              )}

              {/* Displays */}
              {c.type === 'weather-card' && (
                <div className="p-6 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-2xl flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-white">24°C</span>
                    <span className="text-xs text-neutral-400 capitalize tracking-wide">Dynamic Weather Active</span>
                  </div>
                  <Cloud size={40} className="text-blue-500 opacity-80" />
                </div>
              )}

              {c.type === 'api-status' && (
                <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                  <Activity size={16} className="text-green-500" />
                  <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Active Backend Node</span>
                </div>
              )}

              {c.type === 'chart' && (
                <div className="p-6 bg-black/20 border border-white/5 rounded-2xl h-[160px] flex items-end gap-2">
                  {[40, 20, 70, 50, 90, 60, 80].map((h, i) => (
                    <div key={i} style={{ height: \`\${h}%\` }} className="flex-1 bg-blue-500/30 rounded-t-lg border-t border-blue-500/40" />
                  ))}
                </div>
              )}

              {/* Data Inputs */}
              {c.type === 'file-upload' && (
                <div className="relative group">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={e => handleFileUpload(c.variableId, e)} 
                  />
                  <div className="w-full bg-black/40 border border-dashed border-white/10 rounded-2xl px-6 py-10 text-center group-hover:border-blue-500/50 transition-all">
                    <UploadCloud size={32} className="mx-auto mb-4 text-neutral-500" />
                    <p className="text-sm font-medium text-neutral-300">{fileData[c.variableId]?.name || 'Drop files or click to upload'}</p>
                    <p className="text-[10px] text-neutral-600 mt-1 uppercase tracking-widest">Supports images & PDFs</p>
                  </div>
                </div>
              )}

              {/* AI Logic Blocks */}
              {(c.type === 'structured-result' || c.type === 'ai-chat') && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-500">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{c.type === 'ai-chat' ? 'Conversation Flow' : 'Intelligence Block'}</span>
                  </div>
                  <div className="p-8 bg-black/60 border border-white/5 rounded-[24px] min-h-[160px] text-[15px] leading-relaxed text-neutral-300 whitespace-pre-wrap shadow-inner relative overflow-hidden">
                    {isProcessing ? (
                      <div className="space-y-3">
                        <div className="h-3 w-3/4 bg-white/5 rounded-full animate-pulse" />
                        <div className="h-3 w-1/2 bg-white/5 rounded-full animate-pulse" />
                      </div>
                    ) : (
                      outputs[c.id] || <span className="opacity-20 italic font-medium">Awaiting analysis...</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Action Button */}
          <button 
            onClick={handleRun} 
            disabled={isProcessing} 
            className="w-full group relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-bold transition-all hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] disabled:opacity-50"
          >
            {isProcessing ? (
              <Activity size={18} className="animate-spin" />
            ) : (
              <>
                <Zap size={18} className="transition-transform group-hover:scale-125" fill="currentColor" />
                <span>Run Application</span>
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
`.trim();

    if (returnAsString) return code;
    
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_').toLowerCase()}.jsx`;
    a.click();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center p-8">
        <Navbar minimal />
        <div className="companion-pulse w-16 h-16 rounded-2xl bg-accent-dim border border-glow flex items-center justify-center mb-6">
          <Sparkles size={32} className="text-accent animate-pulse" />
        </div>
        <p className="font-display text-lg text-primary animate-pulse">Loading Workspace...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center p-8 text-center">
        <Navbar minimal />
        <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-6">
          <Trash2 size={32} className="text-danger" />
        </div>
        <h2 className="font-display text-2xl font-bold text-primary mb-2">Error Loading Project</h2>
        <p className="text-secondary max-w-sm mb-8">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">Return to Dashboard</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void font-body flex flex-col overflow-hidden">
      {isGlobalDragging && (
        <div className="fixed inset-0 z-[200] bg-accent/10 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 border-[6px] border-dashed border-accent/40 m-8 rounded-[32px] pointer-events-none" />
          <div className="card-premium p-12 flex flex-col items-center shadow-2xl scale-110 pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-accent text-white flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(59,130,246,0.6)] animate-bounce-subtle">
              <UploadCloud size={48} />
            </div>
            <h2 className="font-display text-[32px] font-bold text-primary mb-2 tracking-tight text-center">Drop to Rebuild with AI</h2>
            <p className="font-body text-[16px] text-secondary text-center max-w-sm">Your screenshot will be instantly analyzed to suggest components.</p>
          </div>
        </div>
      )}

      <Navbar minimal />
      <Sidebar />

      <div className="ml-[220px] pt-[56px] flex h-[100vh] overflow-hidden relative">
        <aside className="w-[240px] flex-shrink-0 border-r border-dim bg-base p-4 flex flex-col gap-[12px] overflow-y-auto hidden lg:flex">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-text-muted mb-2">Components</p>
          {PALETTE.map(item => (
            <button
              key={item.type}
              draggable
              onDragStart={() => setDragging(item.type)}
              onDragEnd={() => setDragging(null)}
              onClick={() => addComponent(item.type)}
              className={`flex items-center gap-[12px] p-[10px] rounded-[8px] border text-left transition-colors duration-150 font-body text-[13px] font-medium cursor-grab active:cursor-grabbing
                          ${draggingPalette === item.type ? 'border-accent bg-accent-dim text-primary' : 'border-base bg-raised text-secondary hover:border-lit hover:text-primary'}`}
            >
              <item.icon size={15} className={`flex-shrink-0 ${draggingPalette === item.type ? 'text-accent' : 'text-text-muted group-hover:text-secondary'}`} />
              {item.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          <div className="flex items-center justify-between px-6 py-3 border-b border-dim bg-base/80 backdrop-blur-md z-10 w-full">
            <div className="flex items-center gap-[12px]">
              <input className="bg-transparent font-body text-[14px] font-medium text-primary outline-none w-[140px]" value={projectName} onChange={e => setProjectName(e.target.value)} />
              <span className="badge-draft hidden sm:inline-flex"><div className="w-[5px] h-[5px] rounded-full mr-[6px] bg-text-muted"></div>Draft</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <div className="mr-2 hidden sm:flex items-center gap-2">
                {isSaving && <span className="font-mono text-[9px] text-text-muted uppercase animate-pulse">Saving...</span>}
                {saveSuccess && <span className="font-mono text-[9px] text-success uppercase flex items-center gap-1"><Check size={10}/> Saved</span>}
              </div>
              <button 
                onClick={() => {
                  const code = downloadProjectCode(true); // Helper to get string only
                  navigator.clipboard.writeText(code);
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 2000);
                }} 
                className="flex items-center gap-[6px] text-[13px] px-[12px] py-[6px] rounded-[6px] border border-base bg-white/5 text-secondary hover:text-white transition-all">
                <FileText size={14} /> <span className="hidden sm:inline">Copy Code</span>
              </button>
              <button onClick={downloadProjectCode} className="flex items-center gap-[6px] text-[13px] px-[12px] py-[6px] rounded-[6px] border border-base text-secondary hover:text-primary bg-raised hover:border-lit transition-colors"><Download size={14} /> <span className="hidden sm:inline">Export</span></button>
              <button
                onClick={async () => {
                  let passId = projectIdState;
                  if (!passId) {
                    try {
                      const saved = await handleSave(true);
                      if (saved?.id) passId = saved.id;
                    } catch (err) {
                      console.warn("Could not save before companion handoff, proceeding as draft", err);
                    }
                  }
                  navigate(`/companion?projectId=${passId || 'draft'}&projectName=${encodeURIComponent(projectName)}`);
                }}
                title="Get help with this project in AI Companion"
                className="flex items-center gap-[6px] text-[13px] px-[12px] py-[6px] rounded-[6px] border border-accent/30 bg-accent-dim text-accent hover:bg-accent/15 transition-colors"
              >
                <Compass size={14} /> <span className="hidden sm:inline">Get help</span>
              </button>
              <button 
                onClick={() => setShowPreview(v => !v)} 
                className={`flex items-center gap-[6px] text-[13px] px-[12px] py-[6px] rounded-[6px] border transition-colors duration-150 ${showPreview ? 'bg-accent-dim border-accent/40 text-accent font-medium' : 'border-base text-secondary hover:text-primary bg-raised hover:border-lit'}`}
              >
                <Eye size={14} /> <span className="hidden sm:inline">{showPreview ? 'Edit' : 'Preview'}</span>
              </button>
              <button 
                onClick={() => handleSave(false)} 
                disabled={isSaving} 
                className="flex items-center gap-[6px] text-[13px] px-[12px] py-[6px] rounded-[6px] border border-base bg-raised text-secondary hover:text-primary hover:border-lit transition-colors duration-150 disabled:opacity-50"
              >
                <Save size={14} /> <span className="hidden sm:inline">Save</span>
              </button>
              <button 
                onClick={async () => {
                  try {
                    const s = await handleSave(true);
                    if (s && s.id) navigate(`/deploy?id=${s.id}`);
                  } catch(e) {
                    // Fall back to just deploying directly if save fails
                    navigate('/deploy');
                  }
                }} 
                className="btn-primary text-[13px] px-[16px] py-[6px] !rounded-[6px]"
              >
                <Rocket size={14} /> <span className="hidden sm:inline">Deploy</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-[32px] bg-void relative z-10 w-full h-full">
            <div className="max-w-[700px] mx-auto pb-32">
              <div className="card min-h-[500px] relative">
                <p className="font-mono text-[10px] tracking-[0.1em] text-text-muted mb-[32px] text-center pt-[4px] uppercase">App Preview Canvas</p>
                {components.length === 0 ? (
                  <div className="text-center py-[80px] px-8">
                    <div className="w-16 h-16 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
                      <Sparkles size={32} className="text-accent animate-pulse" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-primary mb-2">Your Canvas is Ready</h3>
                    <p className="text-secondary text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                      Ask the <b>AI Copilot</b> on the right to build your app for you, or drag components from the left panel manually.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-raised border border-base rounded-full text-[12px] text-text-muted italic">
                      <MessageSquare size={12} /> Try: "Build a weather app with AI analysis"
                    </div>
                  </div>
                ) : (
                  <div className="space-y-[12px]">
                    {components.map((comp, index) => {
                      const palette = PALETTE.find(p => p.type === comp.type)
                      const isSelected = selected === comp.id
                      return (
                        <div key={comp.id} onClick={() => !showPreview && setSelected(isSelected ? null : comp.id)}
                             className={`group relative p-[16px] rounded-[8px] border transition-all duration-150 cursor-pointer ${isSelected ? 'border-accent bg-accent-dim' : 'border-transparent hover:border-base hover:bg-raised'}`}>
                          <label className={`block font-body text-[13px] font-medium mb-[8px] ${isSelected ? 'text-accent' : 'text-secondary'}`}>{comp.label}</label>
                          <div className="" onClick={e => showPreview && e.stopPropagation()}><InteractivePreview comp={comp} palette={palette} /></div>
                          {!showPreview && (
                            <div className={`absolute top-[8px] right-[8px] flex gap-[4px] transition-opacity duration-150 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <button onClick={e => { e.stopPropagation(); moveComponent(comp.id, 'up') }} className="w-[28px] h-[28px] rounded-[6px] bg-base hover:bg-[var(--border-lit)] border border-base flex items-center justify-center" disabled={index === 0}><ChevronUp size={13} /></button>
                              <button onClick={e => { e.stopPropagation(); moveComponent(comp.id, 'down') }} className="w-[28px] h-[28px] rounded-[6px] bg-base hover:bg-[var(--border-lit)] border border-base flex items-center justify-center" disabled={index === components.length - 1}><ChevronDown size={13} /></button>
                              <button onClick={e => { e.stopPropagation(); removeComponent(comp.id) }} className="w-[28px] h-[28px] rounded-[6px] bg-base hover:bg-danger/10 border border-base hover:border-danger/20 flex items-center justify-center"><Trash2 size={13} className="text-secondary hover:text-danger" /></button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className={`w-[320px] flex-shrink-0 bg-base border-l border-dim flex flex-col overflow-hidden h-full z-20 transition-all duration-300
                          ${selected ? 'translate-x-0 opacity-100' : 'translate-x-[320px] opacity-0 pointer-events-none absolute right-0'}`}>
          {selected && (() => {
            const comp = components.find(c => c.id === selected)
            if (!comp) return null
            return (
              <>
                <div className="px-[16px] py-[16px] border-b border-dim flex items-center justify-between bg-base">
                  <div className="flex items-center gap-[10px]">
                    <div className="w-[24px] h-[24px] rounded-[5px] bg-accent/10 border border-accent/20 flex justify-center items-center"><Settings2 size={13} className="text-accent" /></div>
                    <span className="font-body text-[14px] font-semibold text-primary tracking-[-0.01em]">Properties</span>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-text-muted hover:text-primary transition-colors"><X size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-[20px] space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-widest text-text-muted">Display Label</label>
                    <input className="input w-full bg-void/50 border-base" value={comp.label} onChange={e => updateComponent(comp.id, { label: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-widest text-text-muted">Variable ID</label>
                    <input className="input w-full bg-void/50 border-base font-mono text-[12px]" value={comp.variableId} onChange={e => updateComponent(comp.id, { variableId: e.target.value.replace(/\s+/g, '_').toLowerCase() })} />
                  </div>
                  {(comp.type === 'structured-result' || comp.type === 'ai-chat') && (
                    <div className="space-y-2 pt-4 border-t border-base">
                      <label className="text-[11px] font-mono uppercase tracking-widest text-text-muted block mb-2">AI Logic Prompt</label>
                      <textarea className="input w-full bg-void/50 border-base min-h-[120px] text-[13px]" value={comp.systemPrompt} onChange={e => updateComponent(comp.id, { systemPrompt: e.target.value })} />
                    </div>
                  )}
                  <div className="pt-6">
                    <button onClick={() => removeComponent(comp.id)} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-danger/20 bg-danger/5 text-danger hover:bg-danger/10 transition-all text-[13px] font-semibold"><Trash2 size={14} /> Remove Component</button>
                  </div>
                </div>
              </>
            )
          })()}
        </aside>

        <aside className={`w-[340px] flex-shrink-0 bg-base border-l border-dim flex flex-col overflow-hidden h-full z-20 transition-all ${selected ? 'hidden' : 'flex'}`}>
          <div className="px-[16px] py-[16px] border-b border-dim flex items-center gap-[12px] bg-base">
            <div className="w-[28px] h-[28px] rounded-[6px] bg-accent-dim border border-glow flex justify-center items-center"><MessageSquare size={14} className="text-accent" /></div>
            <span className="font-body text-[14px] font-medium text-primary">AI Copilot</span>
          </div>
          <div className="flex-1 overflow-hidden p-[16px] pt-0">
            <ChatWidget ref={chatRef} compact placeholder="Describe a component to add…" onAction={handleAiAction} />
          </div>
        </aside>
      </div>

      {showTemplateModal && (
        <IdeaScaffoldModal
          onScaffold={(comps, name) => {
            setComponents(comps)
            setProjectName(name)
            setShowTemplateModal(false)
          }}
          onUseTemplate={handleUseTemplate}
          onBlank={handleStartBlank}
          onCancel={() => navigate('/dashboard')}
        />
      )}
    </div>
  )
}
