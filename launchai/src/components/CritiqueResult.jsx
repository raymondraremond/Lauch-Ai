import React, { useState } from 'react';

export default function CritiqueResult({ critique, projectTitle, tier, onReset }) {
  const [copied, setCopied] = useState(false);
  const isPro = tier === 'pro';

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

  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    transition: 'transform 0.2s ease',
  };

  const sectionIcons = {
    'STRONGEST POINT': '🚀',
    'BIGGEST RISK': '⚠️',
    'TOP SUGGESTION': '💡',
    'CONCEPT SCORE': '🎯',
    'MARKET FIT': '📈',
    'AI FEATURE ANALYSIS': '🤖',
    'UX & FLOW CRITIQUE': '🎨',
    'COMPETITIVE LANDSCAPE': '⚔️',
    'IMPROVEMENT ROADMAP': '🗺️',
    'VERDICT': '🏁',
    'OVERVIEW': '📝'
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto', color: '#111827', padding: '0 20px 60px' }}>
      <style>
        {`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .critique-card {
            animation: slideIn 0.5s ease forwards;
          }
        `}
      </style>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '40px',
        padding: '24px 0',
        borderBottom: '1px solid #f3f4f6'
      }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0', letterSpacing: '-0.025em' }}>
             {projectTitle}
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>AI-Powered Product Audit</p>
        </div>
        <span style={{
          background: isPro ? 'linear-gradient(135deg, #1e40af 0%, #1a73e8 100%)' : 'linear-gradient(135deg, #065f46 0%, #22c55e 100%)',
          color: 'white',
          padding: '6px 16px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          {isPro ? 'Pro Audit ⭐' : 'Standard Audit'}
        </span>
      </div>

      {/* Sections Dashboard */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {sections.map((section, idx) => (
          <div key={idx} className="critique-card" style={{ ...cardStyle, animationDelay: `${idx * 0.1}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>{sectionIcons[section.title] || '✨'}</span>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#374151', margin: '0', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                {section.title}
              </h3>
            </div>
            <div style={{ 
              fontSize: '16px', 
              lineHeight: '1.7', 
              color: '#4b5563', 
              whiteSpace: 'pre-wrap' 
            }}>
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div style={{ 
        marginTop: '48px', 
        padding: '32px', 
        backgroundColor: '#111827', 
        borderRadius: '24px', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>How was this critique?</h3>
        <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 24px 0' }}>Help us improve the analysis engine.</p>
        
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '400px' }}>
          <button 
            onClick={handleCopy}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#374151',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px'
            }}
          >
            {copied ? '✅ Copied!' : '📋 Copy Analysis'}
          </button>
          <button 
            onClick={onReset}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#1a73e8',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '14px'
            }}
          >
            🚀 New Critique
          </button>
        </div>
        
        <a 
          href="mailto:help@launchai.dev"
          style={{
            marginTop: '24px',
            color: '#9ca3af',
            fontSize: '13px',
            textDecoration: 'none'
          }}
        >
          Questions? Contact Support
        </a>
      </div>
    </div>
  );
}
