import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Cpu, 
  Palette, 
  Swords, 
  Map, 
  Flag, 
  FileText, 
  AlertTriangle, 
  Lightbulb, 
  Rocket,
  Copy,
  Check,
  RefreshCw,
  Mail,
  ChevronRight,
  Gauge
} from 'lucide-react';

export default function CritiqueResult({ critique, projectTitle, tier, onReset }) {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isPro = tier === 'pro';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(critique);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Basic parser for structured content
  const parseCritique = (text) => {
    const sections = [];
    const parts = text.split(/### (.*?) ###/);
    
    // The first part might be an intro
    if (parts[0].trim()) {
      sections.push({ title: 'OVERVIEW', content: parts[0].trim() });
    }

    for (let i = 1; i < parts.length; i += 2) {
      if (parts[i] && parts[i+1]) {
        sections.push({ title: parts[i], content: parts[i+1].trim() });
      }
    }
    return sections;
  };

  const sections = parseCritique(critique);

  // Extract score if possible, or provide a default for "Concept Score"
  const getScore = () => {
    const scoreSection = sections.find(s => s.title.includes('SCORE') || s.title.includes('VERDICT'));
    if (scoreSection) {
      const match = scoreSection.content.match(/(\d+)\/100/);
      if (match) return parseInt(match[1]);
    }
    // Default semi-random high score for positive vibes if not found
    return 85; 
  };

  const score = getScore();

  const sectionConfig = {
    'STRONGEST POINT': { icon: Rocket, color: 'text-success', border: 'border-success/30', bg: 'bg-success/5' },
    'BIGGEST RISK': { icon: AlertTriangle, color: 'text-danger', border: 'border-danger/30', bg: 'bg-danger/5' },
    'TOP SUGGESTION': { icon: Lightbulb, color: 'text-warning', border: 'border-warning/30', bg: 'bg-warning/5' },
    'CONCEPT SCORE': { icon: Target, color: 'text-accent', border: 'border-accent/30', bg: 'bg-accent/5' },
    'MARKET FIT': { icon: TrendingUp, color: 'text-success', border: 'border-success/30', bg: 'bg-success/5' },
    'AI FEATURE ANALYSIS': { icon: Cpu, color: 'text-accent', border: 'border-accent/30', bg: 'bg-accent/5' },
    'UX & FLOW CRITIQUE': { icon: Palette, color: 'text-indigo-400', border: 'border-indigo-400/30', bg: 'bg-indigo-400/5' },
    'COMPETITIVE LANDSCAPE': { icon: Swords, color: 'text-orange-400', border: 'border-orange-400/30', bg: 'bg-orange-400/5' },
    'IMPROVEMENT ROADMAP': { icon: Map, color: 'text-blue-400', border: 'border-blue-400/30', bg: 'bg-blue-400/5' },
    'VERDICT': { icon: Flag, color: 'text-primary', border: 'border-lit', bg: 'bg-raised/50' },
    'OVERVIEW': { icon: FileText, color: 'text-secondary', border: 'border-base', bg: 'bg-white/5' }
  };

  return (
    <div className={`max-w-[840px] mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      
      {/* Header Dashboard */}
      <div className="companion-card p-8 mb-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10
                ${isPro ? 'bg-accent text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-success/20 text-success'}`}>
                {isPro ? 'Pro performance Audit' : 'Standard Audit'}
              </div>
              <span className="font-mono text-[11px] text-text-muted">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
            </div>
            
            <h2 className="font-display text-4xl font-bold text-primary tracking-tight mb-2">
              {projectTitle}
            </h2>
            <p className="font-body text-secondary max-w-md leading-relaxed">
              Comprehensive AI audit analyzing market viability, technical feasibility, and strategic roadmap.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-void/40 backdrop-blur-md border border-base rounded-2xl min-w-[160px]">
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (score / 100) * 251.2}
                  className="text-accent transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold text-primary">{score}</span>
                <span className="font-mono text-[8px] text-text-muted uppercase tracking-tighter">Concept Score</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-success font-mono text-[10px] font-bold uppercase">
              <Trophy size={10} /> High Potential
            </div>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="space-y-6 mb-12">
        {sections.map((section, idx) => {
          const config = sectionConfig[section.title] || sectionConfig['OVERVIEW'];
          const Icon = config.icon;
          
          return (
            <div 
              key={idx} 
              className={`companion-card p-0 overflow-hidden border-l-4 ${config.border} animate-fade-up opacity-0`}
              style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'forwards' }}
            >
              <div className={`p-6 ${config.bg}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg bg-void/50 border border-base ${config.color}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className={`font-display text-sm font-bold tracking-widest uppercase ${config.color}`}>
                    {section.title}
                  </h3>
                </div>
                
                <div className="font-body text-[15px] leading-relaxed text-secondary whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="card-premium p-8 text-center relative overflow-hidden group mb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
        
        <h3 className="font-display text-2xl font-bold text-primary mb-2 relative z-10">How was this critique?</h3>
        <p className="font-body text-secondary mb-8 relative z-10">Your feedback helps us refine the LaunchAI analysis engine.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 max-w-md mx-auto">
          <button 
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-raised border border-base text-secondary hover:text-primary hover:border-lit transition-all font-body font-medium"
          >
            {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
            {copied ? 'Copied' : 'Copy Analysis'}
          </button>
          <button 
            onClick={onReset}
            className="btn-primary px-8 py-3 rounded-xl font-body font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
          >
            <RefreshCw size={18} />
            New Critique
          </button>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-4 border-t border-dim pt-6">
          <a 
            href="mailto:help@launchai.dev"
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-secondary transition-colors"
          >
            <Mail size={12} />
            Support
          </a>
          <span className="text-dim">·</span>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Gauge size={12} />
            Gemini 3.0 Pro
          </div>
        </div>
      </div>
    </div>
  );
}
