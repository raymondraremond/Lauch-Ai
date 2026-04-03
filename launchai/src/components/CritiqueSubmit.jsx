import React, { useState } from 'react';
import { 
  Sparkles, Zap, Type, FileText, Link as LinkIcon, 
  Upload, ShieldCheck, X, Check, ChevronRight, AlertCircle 
} from 'lucide-react';
import CritiqueResult from './CritiqueResult';
import { supabase } from '../lib/supabase';
import { getUserCredits } from '../lib/AIClient.js';

// ⬇️ Change to your deployed server URL in production
const API_BASE = "/api";

export default function CritiqueSubmit() {
  const [screen, setScreen] = useState('form');
  const [tier, setTier] = useState('free');
  const [submissionType, setSubmissionType] = useState('text');
  const [dragActive, setDragActive] = useState(false);
  const [fileData, setFileData] = useState({ name: '', content: '', type: '' });
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    targetAudience: '',
    aiFeatures: '',
    url: '',
    additionalContext: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [resultData, setResultData] = useState(null);
  const [credits, setCredits] = useState(null);

  React.useEffect(() => {
    getUserCredits().then(setCredits);
  }, []);

  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['txt', 'md', 'pdf'].includes(ext)) {
      setErrorMsg('Invalid file type. Only .txt, .md, .pdf allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File too large. Max 5MB.');
      return;
    }
    
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = (e) => {
      let content = e.target.result;
      if (ext === 'pdf') {
         content = content.split(',')[1];
      }
      setFileData({ name: file.name, type: ext, content });
    };
    if (ext === 'pdf') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[DEBUG] Submission Type:', submissionType);
    console.log('[DEBUG] Form Data:', formData);
    
    if (submissionType === 'text') {
      if (!formData.projectTitle || !formData.projectDescription || !formData.targetAudience || !formData.aiFeatures) {
        setErrorMsg('Please fill out all fields.');
        return;
      }
    } else if (submissionType === 'file') {
      if (!formData.projectTitle || !fileData.content) {
        setErrorMsg('Please enter a title and select a valid file.');
        return;
      }
    } else if (submissionType === 'link') {
      if (!formData.projectTitle || !formData.url) {
        setErrorMsg('Please enter a title and a valid URL.');
        return;
      }
      if (!formData.url.startsWith('http://') && !formData.url.startsWith('https://')) {
        setErrorMsg('Please enter a valid URL starting with https://');
        return;
      }
    }

    setErrorMsg('');
    setScreen('loading');

    try {
      let bodyData = {};
      if (submissionType === 'text') {
        bodyData = { submissionType: 'text', projectTitle: formData.projectTitle, projectDescription: formData.projectDescription, targetAudience: formData.targetAudience, aiFeatures: formData.aiFeatures, tier };
      } else if (submissionType === 'file') {
        bodyData = { submissionType: 'file', projectTitle: formData.projectTitle, fileContent: fileData.content, fileType: fileData.type, tier };
      } else if (submissionType === 'link') {
        bodyData = { submissionType: 'link', projectTitle: formData.projectTitle, url: formData.url, additionalContext: formData.additionalContext, tier };
      }

      if (!supabase) throw new Error('Authentication service not available. Please try again later.');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('Authentication required. Please sign in.');
      }

      const res = await fetch(`${API_BASE}/api/critique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (res.status === 402) {
        throw new Error(data.error || 'Insufficient credits (NGN top-up required)');
      }

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Server error occurred');
      }

      if (data.remainingCredits !== undefined) setCredits(data.remainingCredits);

      setResultData({
        critique: data.critique,
        projectTitle: data.projectTitle || formData.projectTitle,
        tier: data.tier || tier
      });
      setScreen('result');

    } catch (err) {
      setErrorMsg(err.message);
      setScreen('form');
    }
  };

  const handleReset = () => {
    setScreen('form');
    setFormData({
      projectTitle: '',
      projectDescription: '',
      targetAudience: '',
      aiFeatures: '',
      url: '',
      additionalContext: ''
    });
    setFileData({ name: '', content: '', type: '' });
    setSubmissionType('text');
    setResultData(null);
    setErrorMsg('');
  };

  if (screen === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-up text-center">
        <div className="companion-pulse w-16 h-16 rounded-2xl bg-accent-dim border border-accent/30 flex items-center justify-center mb-6">
          <Sparkles size={32} className="text-accent animate-pulse" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-primary mb-2">Gemini is reviewing your project...</h3>
        <p className="font-body text-secondary max-w-sm">
          {submissionType === 'text' ? 'Our AI is analyzing your project details to find key insights and risks.' : 
           submissionType === 'file' ? 'Reading and deeply analyzing your provided documentation...' : 
           'Crawling and reviewing your project link for feedback...'}
        </p>
        <div className="mt-8 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (screen === 'result' && resultData) {
    return (
      <CritiqueResult 
        critique={resultData.critique} 
        projectTitle={resultData.projectTitle} 
        tier={resultData.tier} 
        onReset={handleReset} 
      />
    );
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-dim border border-accent/20 mb-4">
          <Sparkles size={14} className="text-accent" />
          <span className="font-mono text-[11px] tracking-[0.05em] uppercase text-accent font-medium">AI Project Audit</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-primary tracking-tight mb-3">
          Submit Your Project for AI Critique
        </h1>
        <p className="font-body text-lg text-secondary max-w-xl mx-auto leading-relaxed mb-6">
          Get honest, actionable feedback on product-market fit, AI potential, and roadmap risks.
        </p>

        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-void/50 border border-glow mx-auto">
          <Zap size={14} className="text-accent" fill="currentColor" />
          <span className="font-mono text-sm font-bold text-primary">{credits !== null ? `${credits} CR` : 'Loading...'}</span>
          <div className="h-4 w-[1px] bg-white/10 mx-1" />
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">{tier === 'pro' ? 'Cost: 3' : 'Cost: 1'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 gap-1 bg-raised border border-base rounded-xl mb-8 max-w-md mx-auto">
        {[
          { id: 'text', label: 'Form', icon: Type },
          { id: 'file', label: 'File', icon: FileText },
          { id: 'link', label: 'Link', icon: LinkIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = submissionType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setSubmissionType(tab.id); setErrorMsg(''); }}
              className={`flex flex-1 items-center justify-center gap-2 py-2 px-4 rounded-lg font-body text-sm font-medium transition-all
                ${isActive ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-secondary hover:text-primary hover:bg-white/5'}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-xl mb-8 text-danger text-sm animate-fade-up">
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card border-base bg-raised/50 backdrop-blur-sm p-6 space-y-6">
          <div className="space-y-2">
            <label className="section-label">Project Title</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. My Awesome AI App"
              value={formData.projectTitle} 
              onChange={(e) => setFormData({...formData, projectTitle: e.target.value})} 
            />
          </div>

          {submissionType === 'text' && (
            <>
              <div className="space-y-2">
                <label className="section-label">Project Description</label>
                <textarea 
                  rows="4" 
                  className="input" 
                  placeholder="What does your project do? What problem does it solve?"
                  value={formData.projectDescription} 
                  onChange={(e) => setFormData({...formData, projectDescription: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="section-label">Target Audience</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Who is this built for?"
                    value={formData.targetAudience} 
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="section-label">AI Features Used</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g. LLM, Image Gen..."
                    value={formData.aiFeatures} 
                    onChange={(e) => setFormData({...formData, aiFeatures: e.target.value})} 
                  />
                </div>
              </div>
            </>
          )}

          {submissionType === 'file' && (
            <div className="space-y-4">
              <label className="section-label">Project Documentation</label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-12 px-6 transition-all cursor-pointer
                  ${dragActive ? 'border-accent bg-accent-dim' : 'border-base bg-muted/30 hover:border-lit hover:bg-muted/50'}`}
                onClick={() => document.getElementById('file-upload').click()}
              >
                {fileData.name ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 border border-success/20">
                      <ShieldCheck size={32} className="text-success" />
                    </div>
                    <p className="font-body font-medium text-primary text-lg mb-1">{fileData.name}</p>
                    <p className="font-mono text-xs text-success uppercase tracking-widest">Ready for analysis</p>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setFileData({ name: '', content: '', type: '' }); }}
                      className="mt-6 flex items-center gap-2 text-sm text-text-muted hover:text-danger transition-colors font-medium"
                    >
                      <X size={14} />
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-accent-dim flex items-center justify-center mb-5 border border-accent/20">
                      <Upload size={28} className="text-accent" />
                    </div>
                    <p className="font-body font-semibold text-primary text-xl mb-2">Drag & drop your file here</p>
                    <p className="font-body text-secondary text-sm mb-6 text-center max-w-xs">
                      Supports PDF, TXT, or Markdown documentation (Max 5MB)
                    </p>
                    <div className="px-6 py-2.5 bg-raised border border-base rounded-lg text-sm font-medium text-primary hover:border-lit transition-all shadow-sm">
                      Select File
                    </div>
                  </>
                )}
                <input 
                  id="file-upload" 
                  type="file" 
                  accept=".pdf,.txt,.md" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processFile(e.target.files[0]);
                    }
                  }} 
                />
              </div>
            </div>
          )}

          {submissionType === 'link' && (
            <>
              <div className="space-y-2">
                <label className="section-label">Link</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <LinkIcon size={16} />
                  </div>
                  <input 
                    type="text" 
                    className="input pl-10" 
                    placeholder="https://your-project-link.com"
                    value={formData.url} 
                    onChange={(e) => setFormData({...formData, url: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="section-label">Focus Areas (optional)</label>
                <textarea 
                  rows="3" 
                  className="input" 
                  placeholder="Anything specific you want the AI to focus on? e.g. 'Conversion funnel' or 'AI accuracy'"
                  value={formData.additionalContext} 
                  onChange={(e) => setFormData({...formData, additionalContext: e.target.value})} 
                />
              </div>
            </>
          )}
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => setTier('free')}
            className={`card-premium cursor-pointer transition-all duration-300 group
              ${tier === 'free' ? 'border-success/50 ring-1 ring-success/20 shadow-[0_0_20px_rgba(52,211,153,0.05)]' : 'border-base opacity-70 hover:opacity-100 hover:border-lit'}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${tier === 'free' ? 'bg-success/20 text-success' : 'bg-muted text-text-muted'}`}>
                <ShieldCheck size={20} />
              </div>
              <span className={`font-display text-lg font-bold ${tier === 'free' ? 'text-success' : 'text-primary'}`}>Free</span>
            </div>
            <h4 className="font-display font-semibold text-primary mb-1">Standard Audit</h4>
            <p className="font-body text-xs text-secondary leading-relaxed mb-4">
              3 key insights including strongest points and critical risks.
            </p>
            <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold 
              ${tier === 'free' ? 'text-success' : 'text-text-muted'}`}>
              <Check size={12} /> Unlimited Access
            </div>
          </div>

          <div 
            onClick={() => setTier('pro')}
            className={`card-premium cursor-pointer transition-all duration-300 relative group
              ${tier === 'pro' ? 'border-accent ring-1 ring-accent/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-base opacity-70 hover:opacity-100 hover:border-lit'}`}
          >
            {/* Recommended Badge */}
            <div className="absolute -top-3 right-4 px-3 py-1 bg-accent rounded-full shadow-lg shadow-accent/20 flex items-center gap-1.5 z-10 border border-white/10">
              <Zap size={10} className="text-white fill-white" />
              <span className="font-mono text-[9px] text-white font-bold uppercase tracking-widest">Recommended</span>
            </div>

            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${tier === 'pro' ? 'bg-accent/20 text-accent' : 'bg-muted text-text-muted'}`}>
                <Sparkles size={20} />
              </div>
              <span className={`font-display text-lg font-bold ${tier === 'pro' ? 'text-accent' : 'text-primary'}`}>$9</span>
            </div>
            <h4 className="font-display font-semibold text-primary mb-1">Pro Performance Audit</h4>
            <p className="font-body text-xs text-secondary leading-relaxed mb-4">
              Full breakdown including Market Fit, Competitive Edge, and Roadmap.
            </p>
            <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold 
              ${tier === 'pro' ? 'text-accent' : 'text-text-muted'}`}>
              <Check size={12} /> Deep Intelligence
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className={`btn-primary w-full py-4 text-base font-bold shadow-xl transition-all group overflow-hidden relative
            ${tier === 'free' ? '!bg-emerald-500 hover:!bg-emerald-400' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="relative flex items-center justify-center gap-2">
            {submissionType === 'file' ? 'Analyze My Documentation' : 
             submissionType === 'link' ? 'Audit This Project Link' : 
             tier === 'free' ? 'Generate Free Critique' : 'Unlock Pro Audit Intelligence'}
            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
        
        <p className="text-center text-[11px] text-text-muted uppercase tracking-[0.15em] font-medium">
          Powered by Gemini 3.1 Flash · Optimized Performance
        </p>
      </form>
    </div>
  );
}
