import React from 'react';

export default function CritiqueResult({ critique, projectTitle, tier, onReset }) {
  const isPro = tier === 'pro';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '680px', margin: '0 auto', color: '#111827' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>{projectTitle} — AI Critique</h2>
        <span style={{
          backgroundColor: isPro ? '#eff6ff' : '#f0fdf4',
          color: isPro ? '#1a73e8' : '#166534',
          border: `1px solid ${isPro ? '#bfdbfe' : '#bbf7d0'}`,
          padding: '4px 12px',
          borderRadius: '999px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          {isPro ? 'Pro Critique ⭐' : 'Free Critique'}
        </span>
      </div>

      <div style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        fontSize: '15px',
        lineHeight: '1.8',
        whiteSpace: 'pre-wrap',
        marginBottom: '32px'
      }}>
        {critique}
      </div>

      <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
        <button 
          onClick={onReset}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Submit Another Project
        </button>
        <a 
          href="mailto:help@launchai.dev?subject=LaunchAI Critique Feedback"
          style={{
            padding: '10px 20px',
            backgroundColor: '#f3f4f6',
            border: '1px solid transparent',
            color: '#374151',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '14px',
            display: 'inline-block'
          }}
        >
          Share Feedback
        </a>
      </div>
    </div>
  );
}
