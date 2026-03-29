import React, { useState } from 'react';
import CritiqueResult from './CritiqueResult';

// ⬇️ Change to your deployed server URL in production
const API_BASE = "http://localhost:4000";

export default function CritiqueSubmit() {
  const [screen, setScreen] = useState('form');
  const [tier, setTier] = useState('free');
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    targetAudience: '',
    aiFeatures: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [resultData, setResultData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectTitle || !formData.projectDescription || !formData.targetAudience || !formData.aiFeatures) {
      setErrorMsg('Please fill out all fields.');
      return;
    }

    setErrorMsg('');
    setScreen('loading');

    try {
      const res = await fetch(`${API_BASE}/api/critique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, tier })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Server error occurred');
      }

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
      aiFeatures: ''
    });
    setResultData(null);
    setErrorMsg('');
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    marginTop: '6px',
    fontFamily: 'system-ui, sans-serif',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginTop: '16px'
  };

  if (screen === 'loading') {
    return (
      <div style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif', padding: '60px 20px' }}>
        <style>
          {`
            @keyframes pulse-ring {
              0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(26, 115, 232, 0.7); }
              70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(26, 115, 232, 0); }
              100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(26, 115, 232, 0); }
            }
          `}
        </style>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: tier === 'pro' ? '#1a73e8' : '#22c55e',
          margin: '0 auto 24px auto',
          animation: 'pulse-ring 2s infinite'
        }}></div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Gemini is reviewing your project…</h3>
        <p style={{ color: '#6b7280', fontSize: '15px' }}>
          {tier === 'free' ? 'This takes a few seconds' : 'Running deep analysis — this takes 10–20 seconds'}
        </p>
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
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#111827' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Submit Your Project for AI Critique</h1>
      <p style={{ fontSize: '16px', color: '#4b5563', margin: '0 0 32px 0' }}>Get honest, actionable feedback powered by Gemini 2.5 Pro</p>

      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: '500' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>
          Project Title
          <input 
            type="text" 
            style={inputStyle} 
            value={formData.projectTitle} 
            onChange={(e) => setFormData({...formData, projectTitle: e.target.value})} 
          />
        </label>

        <label style={labelStyle}>
          Project Description
          <textarea 
            rows="4" 
            style={inputStyle} 
            placeholder="What does your project do? What problem does it solve?"
            value={formData.projectDescription} 
            onChange={(e) => setFormData({...formData, projectDescription: e.target.value})} 
          />
        </label>

        <label style={labelStyle}>
          Target Audience
          <input 
            type="text" 
            style={inputStyle} 
            placeholder="Who is this built for?"
            value={formData.targetAudience} 
            onChange={(e) => setFormData({...formData, targetAudience: e.target.value})} 
          />
        </label>

        <label style={labelStyle}>
          AI Features Used
          <textarea 
            rows="2" 
            style={inputStyle} 
            placeholder="What AI features did you add? e.g. chatbot, image generation..."
            value={formData.aiFeatures} 
            onChange={(e) => setFormData({...formData, aiFeatures: e.target.value})} 
          />
        </label>

        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', marginBottom: '32px' }}>
          {/* FREE CARD */}
          <div 
            onClick={() => setTier('free')}
            style={{
              flex: 1,
              border: `2px solid ${tier === 'free' ? '#22c55e' : '#e5e7eb'}`,
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              backgroundColor: tier === 'free' ? '#f0fdf4' : '#ffffff',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>Free Critique</h4>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Free</span>
            </div>
            <p style={{ margin: '0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
              3 key insights — Strongest point, Biggest risk, Top suggestion
            </p>
          </div>

          {/* PRO CARD */}
          <div 
            onClick={() => setTier('pro')}
            style={{
              flex: 1,
              border: `2px solid ${tier === 'pro' ? '#1a73e8' : '#e5e7eb'}`,
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              backgroundColor: tier === 'pro' ? '#eff6ff' : '#ffffff',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>Pro Critique ⭐</h4>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>$9 one-time</span>
            </div>
            <p style={{ margin: '0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
              Full breakdown — Market fit, AI analysis, Competitor landscape, Roadmap
            </p>
          </div>
        </div>

        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: tier === 'free' ? '#22c55e' : '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {tier === 'free' ? 'Get Free Critique →' : 'Get Pro Critique →'}
        </button>
      </form>
    </div>
  );
}
