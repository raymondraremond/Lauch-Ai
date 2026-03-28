/**
 * ContentDetector.js
 * Heuristic-based content type detection for AI outputs.
 * Analyzes text to determine what kind of AI-generated content the user has.
 */

const PATTERNS = {
  code: {
    keywords: [
      'function', 'const ', 'let ', 'var ', 'import ', 'export ', 'class ',
      'return ', 'if (', 'else {', 'for (', 'while (', 'switch ', 'try {',
      'catch ', 'async ', 'await ', 'console.log', 'document.', 'window.',
      'def ', 'print(', 'self.', 'elif ', 'lambda ', 'pip install',
      '<div', '<span', '<button', '</>', 'className=', 'onClick=',
      'npm ', 'yarn ', 'git ', '.json', '.tsx', '.jsx', '.py', '.js',
      'SELECT ', 'FROM ', 'WHERE ', 'INSERT ', 'CREATE TABLE',
      '```', 'setState', 'useState', 'useEffect', 'req.', 'res.',
      '=>', '===', '!==', '&&', '||',
    ],
    weight: 1.2,
    label: 'Code',
    emoji: '💻',
    description: 'Programming code, scripts, or technical implementation',
  },
  design: {
    keywords: [
      'color', 'font', 'layout', 'wireframe', 'figma', 'sketch',
      'ui', 'ux', 'user interface', 'user experience', 'mockup',
      'prototype', 'spacing', 'padding', 'margin', 'grid',
      'typography', 'hierarchy', 'responsive', 'mobile', 'desktop',
      'component', 'design system', 'brand', 'palette', 'gradient',
      'icon', 'illustration', 'animation', 'hover', 'interaction',
      'accessibility', 'contrast', 'whitespace', 'visual',
    ],
    weight: 1.0,
    label: 'Design',
    emoji: '🎨',
    description: 'Visual design, UI/UX, wireframes, or styling',
  },
  content: {
    keywords: [
      'headline', 'cta', 'call to action', 'audience', 'conversion',
      'blog', 'seo', 'article', 'post', 'caption', 'copy', 'tagline',
      'keyword', 'meta description', 'marketing', 'social media',
      'email', 'newsletter', 'subject line', 'engagement', 'click',
      'impression', 'reach', 'follower', 'brand voice', 'tone',
      'content calendar', 'editorial', 'publish', 'campaign',
    ],
    weight: 1.0,
    label: 'Content',
    emoji: '📝',
    description: 'Marketing copy, blog posts, social media, or written content',
  },
  'business-idea': {
    keywords: [
      'market', 'revenue', 'pricing', 'competitor', 'mvp', 'pitch',
      'business model', 'startup', 'funding', 'investor', 'valuation',
      'customer', 'target market', 'value proposition', 'lean canvas',
      'go-to-market', 'traction', 'scalable', 'saas', 'b2b', 'b2c',
      'monetize', 'subscription', 'freemium', 'unit economics',
      'product-market fit', 'problem statement', 'solution',
    ],
    weight: 1.0,
    label: 'Business Idea',
    emoji: '💡',
    description: 'Business plans, startup ideas, or strategy documents',
  },
  workflow: {
    keywords: [
      'zapier', 'make.com', 'n8n', 'automate', 'trigger', 'webhook',
      'integration', 'api', 'endpoint', 'workflow', 'pipeline',
      'automation', 'if this then that', 'ifttt', 'airtable',
      'google sheets', 'slack', 'notion', 'connect', 'sync',
      'schedule', 'cron', 'batch', 'process', 'step 1', 'step 2',
    ],
    weight: 1.0,
    label: 'Workflow',
    emoji: '⚙️',
    description: 'Automations, integrations, or process workflows',
  },
  'landing-page': {
    keywords: [
      'hero', 'section', 'testimonial', 'above the fold', 'landing page',
      'header', 'footer', 'navbar', 'banner', 'signup', 'sign up',
      'subscribe', 'pricing table', 'feature list', 'social proof',
      'trust badge', 'faq', 'contact form', 'lead magnet', 'opt-in',
      'conversion rate', 'bounce rate', 'scroll', 'sticky',
    ],
    weight: 1.0,
    label: 'Landing Page',
    emoji: '🌐',
    description: 'Website pages, landing pages, or web layouts',
  },
  proposal: {
    keywords: [
      'proposal', 'scope', 'deliverables', 'timeline', 'budget',
      'milestone', 'phase', 'objective', 'requirement', 'stakeholder',
      'executive summary', 'project plan', 'resource', 'risk',
      'contract', 'agreement', 'terms', 'sow', 'statement of work',
      'deadline', 'kickoff', 'review', 'approval',
    ],
    weight: 1.0,
    label: 'Proposal',
    emoji: '📋',
    description: 'Project proposals, SOWs, or formal documents',
  },
}

/**
 * Detect the content type of a given text input.
 * @param {string} text - The user's pasted AI output or description
 * @returns {{ type: string, label: string, emoji: string, description: string, confidence: 'low'|'medium'|'high', scores: Object }}
 */
export function detectContentType(text) {
  if (!text || text.trim().length < 10) {
    return {
      type: 'other',
      label: 'Other',
      emoji: '📄',
      description: 'General AI-generated content',
      confidence: 'low',
      scores: {},
    }
  }

  const lower = text.toLowerCase()
  const scores = {}

  for (const [type, config] of Object.entries(PATTERNS)) {
    let score = 0
    for (const keyword of config.keywords) {
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      const matches = lower.match(regex)
      if (matches) {
        score += matches.length * config.weight
      }
    }
    scores[type] = Math.round(score * 10) / 10
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topScore = sorted[0][1]
  const topType = sorted[0][0]

  // Determine confidence
  let confidence = 'low'
  if (topScore > 15) confidence = 'high'
  else if (topScore > 6) confidence = 'medium'

  if (topScore < 2) {
    return {
      type: 'other',
      label: 'Other',
      emoji: '📄',
      description: 'General AI-generated content',
      confidence: 'low',
      scores,
    }
  }

  const config = PATTERNS[topType]
  return {
    type: topType,
    label: config.label,
    emoji: config.emoji,
    description: config.description,
    confidence,
    scores,
  }
}

/**
 * Get all available content types for manual selection.
 */
export function getAllContentTypes() {
  return [
    ...Object.entries(PATTERNS).map(([type, config]) => ({
      type,
      label: config.label,
      emoji: config.emoji,
      description: config.description,
    })),
    {
      type: 'other',
      label: 'Other',
      emoji: '📄',
      description: 'General AI-generated content',
    },
  ]
}
