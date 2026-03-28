import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import ChatWidget from '../components/ChatWidget.jsx'
import {
  Type, AlignLeft, ToggleLeft, List, MessageSquare, BarChart2,
  Trash2, Move, Eye, Save, Rocket, GripVertical, Plus, Settings2
} from 'lucide-react'

const PALETTE = [
  { type: 'text-input',  label: 'Text Input',   icon: Type,          preview: <input readOnly placeholder="Enter text…" className="w-full text-xs bg-surface-600 border border-white/10 rounded px-2 py-1.5 text-gray-400 cursor-default" /> },
  { type: 'textarea',    label: 'Text Area',     icon: AlignLeft,     preview: <textarea readOnly placeholder="Enter description…" rows={2} className="w-full text-xs bg-surface-600 border border-white/10 rounded px-2 py-1.5 text-gray-400 resize-none cursor-default" /> },
  { type: 'toggle',      label: 'Toggle',        icon: ToggleLeft,    preview: <div className="flex items-center gap-2"><div className="w-8 h-4 rounded-full bg-brand-500/40 relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-brand-400" /></div><span className="text-xs text-gray-400">Enabled</span></div> },
  { type: 'dropdown',    label: 'Dropdown',      icon: List,          preview: <select disabled className="w-full text-xs bg-surface-600 border border-white/10 rounded px-2 py-1.5 text-gray-400 cursor-default"><option>Select option…</option></select> },
  { type: 'ai-chat',     label: 'AI Chat Widget',icon: MessageSquare, preview: <div className="p-2 bg-surface-600 rounded border border-brand-500/20 text-xs text-brand-400">⚡ AI Chat Widget</div> },
  { type: 'chart',       label: 'Chart',         icon: BarChart2,     preview: <div className="flex items-end gap-1 h-8">{[60,40,80,50,90,70].map((h,i)=><div key={i} style={{height:`${h}%`}} className="flex-1 rounded-sm bg-brand-500/40" />)}</div> },
]

let uid = 3
export default function Builder() {
  const navigate = useNavigate()
  const [components, setComponents]   = useState([
    { id: 1, type: 'text-input', label: 'Invoice Number' },
    { id: 2, type: 'textarea',   label: 'Invoice Content' },
  ])
  const [selected, setSelected]       = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [saved, setSaved]             = useState(false)
  const [draggingPalette, setDragging] = useState(null)
  const [labelEdit, setLabelEdit]     = useState({})

  function addComponent(type) {
    const def = PALETTE.find(p => p.type === type)
    setComponents(prev => [...prev, { id: ++uid, type, label: def.label }])
  }

  function removeComponent(id) {
    setComponents(prev => prev.filter(c => c.id !== id))
    if (selected === id) setSelected(null)
  }

  function updateLabel(id, val) {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, label: val } : c))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-surface-900 font-body">
      <Navbar minimal />
      <Sidebar />

      <div className="ml-56 pt-16 flex h-[calc(100vh-4rem)]">

        {/* Component Palette */}
        <aside className="w-52 border-r border-white/5 bg-surface-800 p-4 flex flex-col gap-3 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Components</p>
          {PALETTE.map(item => (
            <button
              key={item.type}
              draggable
              onDragStart={() => setDragging(item.type)}
              onDragEnd={() => setDragging(null)}
              onClick={() => addComponent(item.type)}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left
                          transition-all text-xs font-medium cursor-grab active:cursor-grabbing
                          ${draggingPalette === item.type
                            ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                            : 'border-white/8 bg-surface-700/50 text-gray-300 hover:border-white/20 hover:text-white'}`}
            >
              <item.icon size={14} className="text-brand-400 flex-shrink-0" />
              {item.label}
            </button>
          ))}
          <p className="text-xs text-gray-600 mt-1 text-center">Click or drag to add</p>
        </aside>

        {/* Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-surface-800/60">
            <div className="flex items-center gap-3">
              <input
                className="bg-transparent text-sm font-semibold text-white outline-none placeholder-gray-600 w-36"
                placeholder="Untitled App"
                defaultValue="Invoice Analyzer"
              />
              <span className="badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">Draft</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(v => !v)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all
                  ${showPreview ? 'bg-brand-500/15 border-brand-500/30 text-brand-300' : 'border-white/10 text-gray-400 hover:text-white'}`}
              >
                <Eye size={13} /> {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-all"
              >
                <Save size={13} /> {saved ? '✓ Saved' : 'Save'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-xs py-1.5 px-3"
              >
                <Rocket size={13} /> Deploy
              </button>
            </div>
          </div>

          {/* Canvas body */}
          <div className="flex-1 overflow-y-auto p-6 bg-surface-900">
            <div className="max-w-xl mx-auto">
              <div className="card min-h-[500px] relative">
                <div className="absolute top-3 right-3 flex gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <p className="text-xs text-gray-600 mb-5 text-center pt-1">App Canvas</p>

                {components.length === 0 && (
                  <div className="text-center py-16 text-gray-600">
                    <Plus size={28} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Add components from the left panel</p>
                    <p className="text-xs mt-1">or describe what you want to the AI Copilot →</p>
                  </div>
                )}

                <div className="space-y-4">
                  {components.map(comp => {
                    const palette = PALETTE.find(p => p.type === comp.type)
                    const isSelected = selected === comp.id
                    return (
                      <div
                        key={comp.id}
                        onClick={() => setSelected(isSelected ? null : comp.id)}
                        className={`group relative p-3 rounded-xl border transition-all cursor-pointer
                          ${isSelected
                            ? 'border-brand-500/50 bg-brand-500/5'
                            : 'border-transparent hover:border-white/10 hover:bg-white/2'}`}
                      >
                        {/* Label */}
                        {!showPreview && isSelected ? (
                          <div className="flex items-center gap-2 mb-2">
                            <Settings2 size={11} className="text-brand-400" />
                            <input
                              autoFocus
                              value={labelEdit[comp.id] ?? comp.label}
                              onChange={e => {
                                setLabelEdit(prev => ({ ...prev, [comp.id]: e.target.value }))
                                updateLabel(comp.id, e.target.value)
                              }}
                              className="text-xs font-medium text-brand-300 bg-transparent outline-none border-b border-brand-500/30 pb-0.5"
                              onClick={e => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <label className="block text-xs font-medium text-gray-400 mb-2">{comp.label}</label>
                        )}

                        {/* Preview */}
                        {palette?.preview}

                        {/* Actions */}
                        {!showPreview && (
                          <div className={`absolute top-2 right-2 flex gap-1 transition-opacity
                            ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <button className="w-6 h-6 rounded-md bg-surface-600 hover:bg-surface-500 flex items-center justify-center transition-colors">
                              <GripVertical size={11} className="text-gray-400" />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); removeComponent(comp.id) }}
                              className="w-6 h-6 rounded-md bg-surface-600 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={11} className="text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Submit button */}
                {components.length > 0 && (
                  <div className="mt-6">
                    <button className="btn-primary w-full justify-center" disabled>
                      Submit to AI Agent
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Copilot Sidebar */}
        <aside className="w-72 border-l border-white/5 bg-surface-800/60 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
            <MessageSquare size={14} className="text-brand-400" />
            <span className="text-xs font-semibold text-gray-300">AI Copilot</span>
            <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20 text-xs ml-auto">Live</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatWidget
              compact
              placeholder="Describe a component to add…"
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
