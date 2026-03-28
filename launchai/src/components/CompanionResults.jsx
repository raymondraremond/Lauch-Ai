import { useState, useRef, useEffect } from 'react'
import { Copy, Check, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'

/**
 * Parse basic markdown-like formatting in AI responses.
 * Handles bold, headings, lists, code blocks, and checkboxes.
 */
function parseFormattedText(text) {
  if (!text) return []
  
  const lines = text.split('\n')
  const blocks = []
  let currentBlock = null
  let inCodeBlock = false
  let codeContent = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ type: 'code', content: codeContent.trim() })
        codeContent = ''
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeContent += line + '\n'
      continue
    }

    // Bold headings like **Heading**
    if (line.trim().match(/^\*\*[^*]+\*\*\s*$/)) {
      blocks.push({ type: 'heading', content: line.trim().replace(/\*\*/g, '') })
      continue
    }

    // Horizontal rules
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push({ type: 'divider' })
      continue
    }

    // Checkbox items
    if (line.trim().match(/^[☐☑✅]\s/)) {
      blocks.push({ type: 'checkbox', content: line.trim(), checked: line.trim().startsWith('✅') || line.trim().startsWith('☑') })
      continue
    }

    // Warning items
    if (line.trim().startsWith('⚠️')) {
      blocks.push({ type: 'warning', content: line.trim().replace(/^⚠️\s*/, '') })
      continue
    }

    // Numbered list items
    if (line.trim().match(/^\d+\.\s/)) {
      blocks.push({ type: 'numbered', content: line.trim(), number: parseInt(line.trim()) })
      continue
    }

    // Bullet list items
    if (line.trim().match(/^[-•]\s/)) {
      blocks.push({ type: 'bullet', content: line.trim().replace(/^[-•]\s/, '') })
      continue
    }

    // Task items (- Task: ...)
    if (line.trim().match(/^-\s+Task\s+\d+:/i)) {
      blocks.push({ type: 'task', content: line.trim().replace(/^-\s+/, '') })
      continue
    }

    // Done-when items
    if (line.trim().startsWith('✅ Done when:') || line.trim().startsWith('- ✅')) {
      blocks.push({ type: 'done', content: line.trim().replace(/^-?\s*✅\s*/, '') })
      continue
    }

    // Empty lines
    if (line.trim() === '') {
      blocks.push({ type: 'spacer' })
      continue
    }

    // Regular paragraph
    blocks.push({ type: 'paragraph', content: line })
  }

  return blocks
}

/**
 * Render inline formatting (bold, italic, code, links).
 */
function InlineFormatted({ text }) {
  if (!text) return null
  
  // Process inline formatting
  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
    // Inline code: `text`
    const codeMatch = remaining.match(/`([^`]+)`/)
    // Italic: *text* (not inside bold)
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/)

    // Find earliest match
    let earliest = null
    let earliestIdx = Infinity

    if (boldMatch && remaining.indexOf(boldMatch[0]) < earliestIdx) {
      earliest = { type: 'bold', match: boldMatch }
      earliestIdx = remaining.indexOf(boldMatch[0])
    }
    if (codeMatch && remaining.indexOf(codeMatch[0]) < earliestIdx) {
      earliest = { type: 'code', match: codeMatch }
      earliestIdx = remaining.indexOf(codeMatch[0])
    }
    if (italicMatch && remaining.indexOf(italicMatch[0]) < earliestIdx) {
      earliest = { type: 'italic', match: italicMatch }
      earliestIdx = remaining.indexOf(italicMatch[0])
    }

    if (!earliest) {
      parts.push(<span key={key++}>{remaining}</span>)
      break
    }

    // Text before match
    const before = remaining.substring(0, earliestIdx)
    if (before) parts.push(<span key={key++}>{before}</span>)

    // The match itself
    switch (earliest.type) {
      case 'bold':
        parts.push(<strong key={key++} className="text-primary font-medium">{earliest.match[1]}</strong>)
        break
      case 'code':
        parts.push(
          <code key={key++} className="px-1.5 py-0.5 rounded-[4px] bg-muted text-accent font-mono text-[12px]">
            {earliest.match[1]}
          </code>
        )
        break
      case 'italic':
        parts.push(<em key={key++} className="text-secondary italic">{earliest.match[1]}</em>)
        break
    }

    remaining = remaining.substring(earliestIdx + earliest.match[0].length)
  }

  return <>{parts}</>
}

/**
 * CompanionResults — Renders AI companion results in a structured, calming format.
 */
export default function CompanionResults({ result, onModeSwitch }) {
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  if (!result) return null

  const { response, provider, mode } = result
  const blocks = parseFormattedText(response)

  // Extract confidence from Diagnose mode
  let confidence = null
  if (mode === 'diagnose') {
    const match = response.match(/\*\*Clarity Level:\*\*\s*(LOW|MEDIUM|HIGH)/i)
    if (match) {
      confidence = match[1].toLowerCase()
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(response)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const confidenceColors = {
    low: { dot: 'bg-danger', text: 'text-danger', label: 'Low clarity' },
    medium: { dot: 'bg-warning', text: 'text-warning', label: 'Medium clarity' },
    high: { dot: 'bg-success', text: 'text-success', label: 'High clarity' },
  }

  return (
    <div ref={containerRef} className="companion-results animate-fade-up mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-body text-[15px] font-medium text-primary tracking-[-0.01em]">
            Results
          </h3>
          {confidence && (
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full bg-raised border border-base`}>
              <div className={`w-[7px] h-[7px] rounded-full ${confidenceColors[confidence].dot} confidence-dot`} />
              <span className={`font-mono text-[11px] tracking-[0.05em] uppercase ${confidenceColors[confidence].text}`}>
                {confidenceColors[confidence].label}
              </span>
            </div>
          )}
          {provider && provider !== 'Demo' && (
            <span className="font-mono text-[10px] tracking-[0.05em] uppercase text-text-muted bg-overlay px-2 py-0.5 rounded border border-base">
              via {provider}
            </span>
          )}
          {provider === 'Demo' && (
            <span className="font-mono text-[10px] tracking-[0.05em] uppercase text-accent bg-accent-dim px-2 py-0.5 rounded border border-accent/20">
              Demo Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-base bg-raised 
                       text-text-muted hover:text-secondary hover:border-lit transition-colors text-[12px] font-body"
          >
            {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border border-base bg-raised 
                       text-text-muted hover:text-secondary hover:border-lit transition-colors text-[12px] font-body"
          >
            {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Result Body */}
      {!collapsed && (
        <div className="companion-card p-6 space-y-0.5">
          {blocks.map((block, idx) => {
            const delay = Math.min(idx * 30, 600)
            const style = { animationDelay: `${delay}ms` }

            switch (block.type) {
              case 'heading':
                return (
                  <h4
                    key={idx}
                    className="font-body text-[14px] font-semibold text-primary tracking-[-0.01em] pt-4 pb-2 
                               border-b border-dim mb-3 flex items-center gap-2 animate-fade-up opacity-0"
                    style={style}
                  >
                    <div className="w-[3px] h-[14px] rounded-full bg-accent" />
                    {block.content}
                  </h4>
                )

              case 'numbered':
                return (
                  <div
                    key={idx}
                    className="result-step flex gap-3 py-2 animate-fade-up opacity-0"
                    style={style}
                  >
                    <div className="w-[22px] h-[22px] rounded-[6px] bg-accent-dim border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="font-mono text-[11px] text-accent font-medium">{block.number}</span>
                    </div>
                    <p className="font-body text-[13px] text-secondary leading-[1.65] flex-1">
                      <InlineFormatted text={block.content.replace(/^\d+\.\s/, '')} />
                    </p>
                  </div>
                )

              case 'bullet':
                return (
                  <div
                    key={idx}
                    className="flex gap-3 py-1 ml-2 animate-fade-up opacity-0"
                    style={style}
                  >
                    <div className="w-[5px] h-[5px] rounded-full bg-accent/40 mt-[7px] flex-shrink-0" />
                    <p className="font-body text-[13px] text-secondary leading-[1.65]">
                      <InlineFormatted text={block.content} />
                    </p>
                  </div>
                )

              case 'task':
                return (
                  <div
                    key={idx}
                    className="flex gap-3 py-1.5 ml-4 animate-fade-up opacity-0"
                    style={style}
                  >
                    <div className="w-[4px] h-[4px] rounded-full bg-accent mt-[8px] flex-shrink-0" />
                    <p className="font-body text-[13px] text-secondary leading-[1.65]">
                      <InlineFormatted text={block.content} />
                    </p>
                  </div>
                )

              case 'done':
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 py-1.5 ml-4 animate-fade-up opacity-0"
                    style={style}
                  >
                    <span className="text-success text-[13px]">✅</span>
                    <p className="font-body text-[13px] text-success/80 leading-[1.65]">
                      <InlineFormatted text={block.content} />
                    </p>
                  </div>
                )

              case 'checkbox':
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 py-1 animate-fade-up opacity-0"
                    style={style}
                  >
                    <div className={`w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center
                      ${block.checked ? 'bg-success/20 border-success/40' : 'bg-muted border-base'}`}
                    >
                      {block.checked && <Check size={10} className="text-success" />}
                    </div>
                    <p className={`font-body text-[13px] leading-[1.65] ${block.checked ? 'text-success/70 line-through' : 'text-secondary'}`}>
                      <InlineFormatted text={block.content.replace(/^[☐☑✅]\s/, '')} />
                    </p>
                  </div>
                )

              case 'warning':
                return (
                  <div
                    key={idx}
                    className="flex gap-2.5 py-2 px-3 rounded-[8px] bg-warning/5 border border-warning/15 my-1 animate-fade-up opacity-0"
                    style={style}
                  >
                    <span className="text-[14px] flex-shrink-0">⚠️</span>
                    <p className="font-body text-[13px] text-warning/80 leading-[1.65]">
                      <InlineFormatted text={block.content} />
                    </p>
                  </div>
                )

              case 'code':
                return (
                  <div
                    key={idx}
                    className="my-2 rounded-[8px] bg-void border border-base overflow-hidden animate-fade-up opacity-0"
                    style={style}
                  >
                    <div className="px-3 py-1.5 bg-muted/30 border-b border-base">
                      <span className="font-mono text-[10px] text-text-muted uppercase tracking-[0.1em]">Code</span>
                    </div>
                    <pre className="p-4 font-mono text-[12px] text-accent leading-[1.7] overflow-x-auto">
                      {block.content}
                    </pre>
                  </div>
                )

              case 'divider':
                return <div key={idx} className="border-t border-dim my-3" />

              case 'spacer':
                return <div key={idx} className="h-1" />

              case 'paragraph':
              default:
                return (
                  <p
                    key={idx}
                    className="font-body text-[13px] text-secondary leading-[1.7] py-0.5 animate-fade-up opacity-0"
                    style={style}
                  >
                    <InlineFormatted text={block.content} />
                  </p>
                )
            }
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 flex items-center gap-3">
        {onModeSwitch && (
          <button
            onClick={onModeSwitch}
            className="flex items-center gap-2 px-3 py-2 rounded-[7px] border border-base bg-raised 
                       text-secondary hover:text-primary hover:border-lit transition-all text-[13px] font-body font-medium"
          >
            <RotateCcw size={13} />
            Try another mode
          </button>
        )}
      </div>
    </div>
  )
}
