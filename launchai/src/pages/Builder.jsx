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
  { type: 'text-input',  label: 'Text Input',   icon: Type,          preview: <input readOnly placeholder="Enter text…" className="input cursor-default pointer-events-none" /> },
  { type: 'textarea',    label: 'Text Area',     icon: AlignLeft,     preview: <textarea readOnly placeholder="Enter description…" rows={2} className="input resize-none cursor-default pointer-events-none" /> },
  { type: 'toggle',      label: 'Toggle',        icon: ToggleLeft,    preview: <div className="flex items-center gap-[8px]"><div className="w-[32px] h-[16px] rounded-full bg-accent/40 relative"><div className="absolute right-[2px] top-[2px] w-[12px] h-[12px] rounded-full bg-accent" /></div><span className="font-body text-[13px] text-secondary">Enabled</span></div> },
  { type: 'dropdown',    label: 'Dropdown',      icon: List,          preview: <select disabled className="input cursor-default opacity-50"><option>Select option…</option></select> },
  { type: 'ai-chat',     label: 'AI Chat Widget',icon: MessageSquare, preview: <div className="p-2 border border-dashed border-accent bg-accent-dim rounded-[8px] font-mono text-[11px] uppercase tracking-[0.05em] text-accent flex items-center gap-[4px]"><MessageSquare size={13}/> AI Chat Block</div> },
  { type: 'chart',       label: 'Chart',         icon: BarChart2,     preview: <div className="flex items-end gap-[4px] h-[32px]">{[60,40,80,50,90,70].map((h,i)=><div key={i} style={{height:`${h}%`}} className="flex-1 rounded-[2px] bg-accent/40" />)}</div> },
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
    <div className="min-h-screen bg-void font-body flex flex-col overflow-hidden">
      <Navbar minimal />
      <Sidebar />

      <div className="ml-[220px] pt-[56px] flex h-[100vh] overflow-hidden">

        {/* Component Palette */}
        <aside className="w-[240px] border-r border-dim bg-base p-4 flex flex-col gap-[12px] overflow-y-auto">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-text-muted mb-2">Components</p>
          {PALETTE.map(item => (
            <button
              key={item.type}
              draggable
              onDragStart={() => setDragging(item.type)}
              onDragEnd={() => setDragging(null)}
              onClick={() => addComponent(item.type)}
              className={`flex items-center gap-[12px] p-[10px] rounded-[8px] border text-left
                          transition-colors duration-150 font-body text-[13px] font-medium cursor-grab active:cursor-grabbing tracking-[-0.01em]
                          ${draggingPalette === item.type
                            ? 'border-accent bg-accent-dim text-primary'
                            : 'border-base bg-raised text-secondary hover:border-lit hover:text-primary'}`}
            >
              <item.icon size={15} className={`flex-shrink-0 ${draggingPalette === item.type ? 'text-accent' : 'text-text-muted group-hover:text-secondary'}`} />
              {item.label}
            </button>
          ))}
          <p className="font-body text-[12px] text-text-muted mt-2 text-center select-none">Click or drag to add</p>
        </aside>

        {/* Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-dim bg-base/80 backdrop-blur-md z-10 w-[600px] border-r">
            <div className="flex items-center gap-[12px]">
              <input
                className="bg-transparent font-body text-[14px] font-medium text-primary outline-none placeholder-text-muted w-[140px] tracking-[-0.01em]"
                placeholder="Untitled App"
                defaultValue="Invoice Analyzer"
              />
              <span className="badge-draft"><div className="w-[5px] h-[5px] rounded-full mr-[6px] bg-text-muted"></div>Draft</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => setShowPreview(v => !v)}
                className={`flex items-center gap-[6px] text-[13px] px-[12px] py-[6px] rounded-[6px] border transition-colors duration-150 tracking-[-0.01em]
                  ${showPreview ? 'bg-accent-dim border-accent/40 text-accent font-medium' : 'border-base text-secondary hover:text-primary bg-raised hover:border-lit'}`}
              >
                <Eye size={14} /> {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-[6px] font-body text-[13px] px-[12px] py-[6px] rounded-[6px] border border-base bg-raised text-secondary hover:text-primary hover:border-lit transition-colors duration-150 tracking-[-0.01em]"
              >
                <Save size={14} className={saved ? 'text-success' : ''} /> {saved ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-[13px] px-[16px] py-[6px] !rounded-[6px]"
              >
                <Rocket size={14} /> Deploy
              </button>
            </div>
          </div>

          <div className="grain-overlay opacity-[0.02]"></div>

          {/* Canvas body */}
          <div className="flex-1 overflow-y-auto p-[32px] bg-void relative z-10 w-[600px] border-r border-dim h-full">
            <div className="max-w-[100%] mx-auto pb-32">
              <div className="card min-h-[500px] relative">
                <div className="absolute top-[12px] left-[12px] flex items-center gap-[8px]">
                  <div className="flex gap-[6px]">
                    <div className="w-[10px] h-[10px] rounded-full bg-danger/50 border border-danger/20" />
                    <div className="w-[10px] h-[10px] rounded-full bg-warning/50 border border-warning/20" />
                    <div className="w-[10px] h-[10px] rounded-full bg-success/50 border border-success/20" />
                  </div>
                </div>
                
                <p className="font-mono text-[10px] tracking-[0.1em] text-text-muted mb-[32px] text-center pt-[4px] uppercase">App Preview Canvas</p>

                {components.length === 0 && (
                  <div className="text-center py-[64px] text-text-muted">
                    <Plus size={32} className="mx-auto mb-[16px] opacity-20" />
                    <p className="font-body text-[14px]">Add components from the left panel</p>
                    <p className="font-body text-[13px] mt-[4px]">or describe what you want to the AI Copilot →</p>
                  </div>
                )}

                <div className="space-y-[12px]">
                  {components.map(comp => {
                    const palette = PALETTE.find(p => p.type === comp.type)
                    const isSelected = selected === comp.id
                    return (
                      <div
                        key={comp.id}
                        onClick={() => setSelected(isSelected ? null : comp.id)}
                        className={`group relative p-[16px] rounded-[8px] border transition-all duration-150 cursor-pointer
                          ${isSelected
                            ? 'border-accent bg-accent-dim'
                            : 'border-transparent hover:border-base hover:bg-raised'}`}
                      >
                        {/* Label */}
                        {!showPreview && isSelected ? (
                          <div className="flex items-center gap-[8px] mb-[8px]">
                            <Settings2 size={14} className="text-accent" />
                            <input
                              autoFocus
                              value={labelEdit[comp.id] ?? comp.label}
                              onChange={e => {
                                setLabelEdit(prev => ({ ...prev, [comp.id]: e.target.value }))
                                updateLabel(comp.id, e.target.value)
                              }}
                              className="font-body text-[13px] font-medium text-accent bg-transparent outline-none border-b border-accent/30 pb-[2px] w-full placeholder-accent/50"
                              placeholder="Component label"
                              onClick={e => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <label className={`block font-body text-[13px] font-medium mb-[8px] ${isSelected ? 'text-accent' : 'text-secondary'}`}>{comp.label}</label>
                        )}

                        {/* Preview */}
                        <div className="select-none pointer-events-none">
                          {palette?.preview}
                        </div>

                        {/* Actions */}
                        {!showPreview && (
                          <div className={`absolute top-[8px] right-[8px] flex gap-[4px] transition-opacity duration-150
                            ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            <button className="w-[28px] h-[28px] rounded-[6px] bg-base hover:bg-[var(--border-lit)] border border-base flex items-center justify-center transition-colors">
                              <GripVertical size={13} className="text-secondary" />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); removeComponent(comp.id) }}
                              className="w-[28px] h-[28px] rounded-[6px] bg-base hover:bg-danger/10 border border-base hover:border-danger/20 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={13} className="text-secondary hover:text-danger" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Copilot Sidebar */}
        <aside className="w-[320px] bg-base border-l border-dim flex flex-col overflow-hidden h-full absolute right-0">
          <div className="px-[16px] py-[16px] border-b border-dim flex items-center gap-[12px] bg-base">
            <div className="w-[28px] h-[28px] rounded-[6px] bg-accent-dim border border-glow flex justify-center items-center">
              <MessageSquare size={14} className="text-accent" />
            </div>
            <span className="font-body text-[14px] font-medium text-primary tracking-[-0.01em]">AI Copilot</span>
            <span className="badge-active ml-auto"><div className="w-[5px] h-[5px] bg-success rounded-full mr-[6px]"></div>Live</span>
          </div>
          <div className="flex-1 overflow-hidden p-[16px] pt-0">
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
