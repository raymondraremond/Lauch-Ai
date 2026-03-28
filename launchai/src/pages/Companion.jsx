import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import CompanionResults from '../components/CompanionResults.jsx'
import { detectContentType, getAllContentTypes } from '../lib/ContentDetector.js'
import { analyzeWithCompanion, getAllModes } from '../lib/CompanionAI.js'
import { getHistory, saveToHistory, deleteFromHistory, clearHistory, formatRelativeTime, getModeLabel } from '../lib/CompanionHistory.js'
import {
  Upload, X, FileText, Image, Sparkles, Search,
  Wand2, Lightbulb, ListOrdered, Flag, Loader,
  ArrowRight, Info, ChevronRight, Clock, Trash2,
  History, ChevronDown, Eye
} from 'lucide-react'

const MODE_ICONS = {
  diagnose: Search,
  improve: Wand2,
  explain: Lightbulb,
  nextsteps: ListOrdered,
  finish: Flag,
}

const MODE_DESCRIPTIONS = {
  diagnose: "Find what's wrong or missing",
  improve: "Get a cleaner, better version",
  explain: "Understand it in plain language",
  nextsteps: "See exactly what to do next",
  finish: "Get a complete action plan",
}

export default function Companion() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  // State
  const [input, setInput] = useState('')
  const [files, setFiles] = useState([]) // { name, type, size, preview }
  const [imagePreview, setImagePreview] = useState(null) // for image modal
  const [contentType, setContentType] = useState(null)
  const [manualType, setManualType] = useState(null)
  const [activeMode, setActiveMode] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // History
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const allTypes = getAllContentTypes()
  const allModes = getAllModes()
  const effectiveType = manualType || contentType?.type || 'other'

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory())
  }, [])

  // Auto-detect content type as user types
  function handleInputChange(e) {
    const text = e.target.value
    setInput(text)
    if (text.length > 20) {
      const detected = detectContentType(text)
      setContentType(detected)
    } else {
      setContentType(null)
    }
  }

  // File handling
  function handleFileSelect(e) {
    const selected = Array.from(e.target.files)
    processFiles(selected)
  }

  function processFiles(fileList) {
    const newFiles = []
    for (const file of fileList) {
      if (file.size > 5 * 1024 * 1024) continue

      const fileData = { name: file.name, type: file.type, size: file.size, preview: null }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          fileData.preview = e.target.result
          setFiles(prev => [...prev]) // trigger re-render
        }
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('text/') || file.name.match(/\.(js|jsx|ts|tsx|py|html|css|json|md|txt|csv)$/i)) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target.result
          setInput(prev => prev + (prev ? '\n\n' : '') + `--- File: ${file.name} ---\n${text}`)
          const detected = detectContentType(text)
          setContentType(detected)
        }
        reader.readAsText(file)
      }

      newFiles.push(fileData)
    }
    setFiles(prev => [...prev, ...newFiles])
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  // Drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.length) {
      processFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  // Submit
  function handleSubmit() {
    if (!input.trim() && files.length === 0) return
    setSubmitted(true)
    if (!activeMode) {
      setActiveMode('diagnose')
    }
  }

  // Run analysis
  async function runAnalysis(mode) {
    setActiveMode(mode)
    setIsAnalyzing(true)
    setResult(null)

    try {
      const res = await analyzeWithCompanion(input, effectiveType, mode)
      setResult(res)

      // Save to history
      const entry = saveToHistory({
        input,
        contentType: effectiveType,
        mode,
        result: res.response,
        provider: res.provider,
      })
      if (entry) {
        setHistory(getHistory())
      }
    } catch (err) {
      setResult({
        response: `⚠️ Something went wrong: ${err.message}\n\nPlease try again or check your API key configuration.`,
        provider: 'Error',
        mode,
      })
    }
    setIsAnalyzing(false)
  }

  // Reset
  function handleReset() {
    setInput('')
    setFiles([])
    setContentType(null)
    setManualType(null)
    setActiveMode(null)
    setResult(null)
    setSubmitted(false)
    setIsAnalyzing(false)
    setImagePreview(null)
  }

  // Load from history
  function loadFromHistory(entry) {
    setInput(entry.input)
    setManualType(entry.contentType)
    setSubmitted(true)
    setActiveMode(entry.mode)
    setResult({
      response: entry.result,
      provider: entry.provider,
      mode: entry.mode,
    })
    setShowHistory(false)
  }

  function handleDeleteHistory(id) {
    deleteFromHistory(id)
    setHistory(getHistory())
  }

  function handleClearHistory() {
    clearHistory()
    setHistory([])
  }

  function handleModeSwitch() {
    setResult(null)
    setActiveMode(null)
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="min-h-screen bg-void font-body">
      <Navbar minimal />
      <Sidebar />

      <main className="ml-[220px] pt-[76px] px-8 py-8">
        <div className="max-w-[820px] mx-auto">

          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-[36px] h-[36px] rounded-[10px] bg-gradient-to-br from-accent to-[#7c3aed] flex items-center justify-center shadow-lg shadow-accent/20">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="font-display text-[28px] font-semibold text-primary tracking-[-0.03em] leading-tight">
                    AI Build Companion
                  </h1>
                </div>
              </div>

              {/* History Toggle */}
              {history.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[7px] border text-[13px] font-body font-medium
                             transition-all duration-200 ${
                    showHistory
                      ? 'border-accent bg-accent-dim text-accent'
                      : 'border-base bg-raised text-secondary hover:border-lit hover:text-primary'
                  }`}
                >
                  <History size={14} />
                  History
                  <span className="font-mono text-[10px] bg-overlay px-1.5 py-0.5 rounded text-text-muted">{history.length}</span>
                </button>
              )}
            </div>
            <p className="font-body text-[14px] text-secondary leading-[1.6] max-w-[560px]">
              Paste any AI output you're stuck on. We'll help you understand it, fix it, and turn it into something finished.
            </p>
          </div>

          {/* History Panel */}
          {showHistory && history.length > 0 && (
            <div className="mb-8 animate-fade-up companion-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-body text-[13px] font-medium text-primary flex items-center gap-2">
                  <Clock size={13} className="text-accent" />
                  Recent Sessions
                </h3>
                <button
                  onClick={handleClearHistory}
                  className="font-body text-[11px] text-text-muted hover:text-danger transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {history.map(entry => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 rounded-[8px] bg-muted/30 border border-dim
                               hover:border-lit hover:bg-overlay/50 transition-all group cursor-pointer"
                    onClick={() => loadFromHistory(entry)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] tracking-[0.05em] uppercase text-accent">
                          {entry.contentType}
                        </span>
                        <span className="font-body text-[10px] text-text-muted">·</span>
                        <span className="font-body text-[10px] text-text-muted">
                          {getModeLabel(entry.mode)}
                        </span>
                        {entry.provider && entry.provider !== 'Demo' && (
                          <>
                            <span className="font-body text-[10px] text-text-muted">·</span>
                            <span className="font-mono text-[9px] text-text-muted">{entry.provider}</span>
                          </>
                        )}
                      </div>
                      <p className="font-body text-[12px] text-secondary truncate">
                        {entry.input}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-text-muted flex-shrink-0">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteHistory(entry.id) }}
                      className="w-[24px] h-[24px] rounded-[5px] hover:bg-danger/10 flex items-center justify-center
                                 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <Trash2 size={11} className="text-text-muted hover:text-danger" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intake Section */}
          {!submitted ? (
            <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
              {/* Main Input Card */}
              <div
                className={`companion-card p-0 transition-all duration-300 ${dragOver ? 'ring-2 ring-accent ring-offset-2 ring-offset-void' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Textarea */}
                <div className="p-5 pb-0">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Paste your AI output here, describe your problem, or drop a file below…

Examples:
• A ChatGPT response that didn't quite work
• Code that has errors you can't fix
• A business plan that feels incomplete
• A marketing email that needs improvement"
                    className="w-full min-h-[200px] bg-transparent text-primary placeholder-text-muted
                               font-body text-[14px] leading-[1.7] outline-none resize-y tracking-[-0.01em]"
                    style={{ maxHeight: '500px' }}
                  />
                </div>

                {/* File Upload Zone */}
                <div className="px-5 pb-4">
                  {/* Uploaded files preview */}
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-muted/50 border border-base group"
                        >
                          {file.type?.startsWith('image/') ? (
                            <>
                              {file.preview ? (
                                <button
                                  onClick={() => setImagePreview(file.preview)}
                                  className="flex items-center gap-2"
                                >
                                  <img src={file.preview} alt={file.name} className="w-[20px] h-[20px] rounded object-cover" />
                                  <Eye size={10} className="text-accent" />
                                </button>
                              ) : (
                                <Image size={13} className="text-accent flex-shrink-0" />
                              )}
                            </>
                          ) : (
                            <FileText size={13} className="text-accent flex-shrink-0" />
                          )}
                          <span className="font-body text-[12px] text-secondary truncate max-w-[140px]">{file.name}</span>
                          <span className="font-mono text-[10px] text-text-muted">{formatFileSize(file.size)}</span>
                          <button
                            onClick={() => removeFile(idx)}
                            className="w-[18px] h-[18px] rounded-full hover:bg-danger/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} className="text-danger" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image Preview Modal */}
                  {imagePreview && (
                    <div className="mb-3 relative rounded-[8px] overflow-hidden border border-base bg-void">
                      <img src={imagePreview} alt="Preview" className="max-h-[200px] w-auto mx-auto" />
                      <button
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 w-[24px] h-[24px] rounded-full bg-void/80 border border-base
                                   flex items-center justify-center hover:bg-danger/20 transition-colors"
                      >
                        <X size={12} className="text-secondary" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-dim pt-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-dashed border-dim
                                   hover:border-accent hover:bg-accent-dim text-text-muted hover:text-accent
                                   transition-all text-[12px] font-body font-medium"
                      >
                        <Upload size={13} />
                        Upload file
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".txt,.md,.js,.jsx,.ts,.tsx,.py,.html,.css,.json,.csv,.png,.jpg,.jpeg,.webp,.gif,.svg"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <span className="font-body text-[11px] text-text-muted">
                        or drag & drop · text, code, images up to 5MB
                      </span>
                    </div>

                    {/* Auto-detected type badge */}
                    {contentType && contentType.type !== 'other' && !manualType && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-dim border border-accent/20 animate-fade-up">
                        <span className="text-[12px]">{contentType.emoji}</span>
                        <span className="font-mono text-[10px] tracking-[0.05em] uppercase text-accent">
                          {contentType.label} detected
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Type Selector */}
              <div className="mt-5">
                <p className="font-body text-[12px] text-text-muted mb-3 flex items-center gap-1.5">
                  <Info size={12} />
                  What kind of output is this? {contentType && contentType.type !== 'other' ? '(auto-detected, click to override)' : '(select one)'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {allTypes.map(t => (
                    <button
                      key={t.type}
                      onClick={() => setManualType(manualType === t.type ? null : t.type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-[12px] font-body font-medium
                                  transition-all duration-150 ${
                        (manualType === t.type) || (!manualType && contentType?.type === t.type)
                          ? 'border-accent bg-accent-dim text-accent'
                          : 'border-base bg-raised text-secondary hover:border-lit hover:text-primary'
                      }`}
                    >
                      <span className="text-[13px]">{t.emoji}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Analyze Button */}
              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() && files.length === 0}
                  className={`btn-primary px-8 py-3 text-[14px] rounded-[8px] !font-medium ${
                    !input.trim() && files.length === 0
                      ? 'opacity-40 cursor-not-allowed hover:translate-y-0 hover:bg-accent'
                      : ''
                  }`}
                >
                  <Sparkles size={16} />
                  Analyze my output
                  <ArrowRight size={15} />
                </button>
                <span className="font-body text-[12px] text-text-muted">
                  Free · No signup required
                </span>
              </div>

              {/* Tips */}
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { title: 'Any AI output', desc: 'ChatGPT, Claude, Gemini, Copilot — we handle all of them' },
                  { title: 'Not just code', desc: 'Also works for content, designs, business plans, and more' },
                  { title: 'Beginner-friendly', desc: 'Everything explained in plain language, no jargon' },
                ].map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-[8px] bg-raised/50 border border-dim">
                    <div className="w-[5px] h-[5px] rounded-full bg-accent mt-[7px] flex-shrink-0" />
                    <div>
                      <p className="font-body text-[12px] font-medium text-primary tracking-[-0.01em]">{tip.title}</p>
                      <p className="font-body text-[11px] text-text-muted leading-[1.5] mt-0.5">{tip.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Post-submit: Mode Selector + Results */
            <div className="animate-fade-up">
              {/* Input Summary */}
              <div className="companion-card p-4 mb-6 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[14px]">{allTypes.find(t => t.type === effectiveType)?.emoji || '📄'}</span>
                    <span className="font-mono text-[11px] tracking-[0.05em] uppercase text-accent">
                      {allTypes.find(t => t.type === effectiveType)?.label || 'Other'}
                    </span>
                    {files.length > 0 && (
                      <span className="font-mono text-[10px] text-text-muted">
                        + {files.length} file{files.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-[13px] text-secondary leading-[1.6] line-clamp-3">
                    {input.substring(0, 200)}{input.length > 200 ? '…' : ''}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-base bg-raised
                             text-text-muted hover:text-secondary hover:border-lit transition-colors text-[12px] font-body font-medium flex-shrink-0"
                >
                  Start over
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="mb-2">
                <p className="font-body text-[12px] text-text-muted mb-3 flex items-center gap-1.5">
                  <ChevronRight size={12} className="text-accent" />
                  How should we help?
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {allModes.map(mode => {
                    const Icon = MODE_ICONS[mode.key]
                    const isActive = activeMode === mode.key
                    const isLoading = isAnalyzing && activeMode === mode.key

                    return (
                      <button
                        key={mode.key}
                        onClick={() => !isAnalyzing && runAnalysis(mode.key)}
                        disabled={isAnalyzing}
                        className={`mode-tab flex flex-col items-center gap-2 p-4 rounded-[10px] border text-center
                                    transition-all duration-200 group ${
                          isActive
                            ? 'mode-tab-active border-accent bg-accent-dim'
                            : 'border-base bg-raised hover:border-lit hover:bg-overlay'
                        } ${isAnalyzing && !isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`w-[32px] h-[32px] rounded-[8px] flex items-center justify-center transition-colors ${
                          isActive ? 'bg-accent/20' : 'bg-muted group-hover:bg-overlay'
                        }`}>
                          {isLoading
                            ? <Loader size={16} className="text-accent animate-spin" />
                            : <Icon size={16} className={isActive ? 'text-accent' : 'text-text-muted group-hover:text-secondary'} />
                          }
                        </div>
                        <div>
                          <p className={`font-body text-[13px] font-medium tracking-[-0.01em] ${
                            isActive ? 'text-accent' : 'text-secondary group-hover:text-primary'
                          }`}>
                            {mode.emoji} {mode.label}
                          </p>
                          <p className="font-body text-[10px] text-text-muted mt-0.5 leading-[1.4]">
                            {MODE_DESCRIPTIONS[mode.key]}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Analyzing State */}
              {isAnalyzing && (
                <div className="mt-8 flex flex-col items-center py-12 animate-fade-up">
                  <div className="companion-pulse w-[48px] h-[48px] rounded-[12px] bg-accent-dim border border-accent/30 flex items-center justify-center mb-4">
                    <Loader size={20} className="text-accent animate-spin" />
                  </div>
                  <p className="font-body text-[14px] text-primary font-medium mb-1">Analyzing your output…</p>
                  <p className="font-body text-[12px] text-text-muted">This usually takes a few seconds</p>
                </div>
              )}

              {/* Results */}
              {result && !isAnalyzing && (
                <CompanionResults
                  result={result}
                  onModeSwitch={handleModeSwitch}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
