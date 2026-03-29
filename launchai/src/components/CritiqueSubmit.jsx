import React, { useState } from 'react';
import CritiqueResult from './CritiqueResult';

// ⬇️ Change to your deployed server URL in production
const API_BASE = "http://localhost:4000";

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

      const res = await fetch(`${API_BASE}/api/critique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
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
      aiFeatures: '',
      url: '',
      additionalContext: ''
    });
    setFileData({ name: '', content: '', type: '' });
    setSubmissionType('text');
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
          {submissionType === 'text' ? 'This takes a few seconds' : submissionType === 'file' ? 'Reading and analyzing your file…' : 'Fetching and reviewing your link…'}
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

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '32px', 
        backgroundColor: '#f3f4f6', 
        padding: '6px', 
        borderRadius: '12px' 
      }}>
        {[
          { id: 'text', label: '📝 Text Form' },
          { id: 'file', label: '📄 Upload File' },
          { id: 'link', label: '🔗 Paste a Link' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setSubmissionType(tab.id); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: submissionType === tab.id ? '600' : '500',
              backgroundColor: submissionType === tab.id ? '#fff' : 'transparent',
              border: 'none',
              boxShadow: submissionType === tab.id ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
              color: submissionType === tab.id ? '#1a73e8' : '#6b7280',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '14px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fef2f2', 
          color: '#dc2626', 
          borderRadius: '12px', 
          marginBottom: '32px', 
          fontSize: '14px', 
          fontWeight: '500', 
          border: '1px solid #fecaca',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          {errorMsg}
        </div>
      )}

      <div style={{ 
        transition: 'opacity 0.3s ease-in-out', 
        opacity: 1 
      }}>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>
            Project Title
            <input 
              type="text" 
              style={inputStyle} 
              placeholder="e.g. My Awesome AI App"
              value={formData.projectTitle} 
              onChange={(e) => setFormData({...formData, projectTitle: e.target.value})} 
            />
          </label>

          {submissionType === 'text' && (
            <div key="text-fields">
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
            </div>
          )}

          {submissionType === 'file' && (
            <div key="file-fields" style={{ marginTop: '24px' }}>
              <label style={{ ...labelStyle, marginTop: 0 }}>Upload Project Details</label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragActive ? '#1a73e8' : '#e5e7eb'}`,
                  borderRadius: '16px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  marginTop: '12px',
                  backgroundColor: dragActive ? '#f0f7ff' : '#fafafa',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                {fileData.name ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ 
                      width: '64px', 
                      height: '64px', 
                      backgroundColor: '#dcfce7', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginBottom: '16px',
                      fontSize: '32px'
                    }}>
                      📄
                    </div>
                    <div style={{ color: '#15803d', fontWeight: '600', fontSize: '16px' }}>
                      {fileData.name}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFileData({ name: '', content: '', type: '' })}
                      style={{ 
                        marginTop: '16px', 
                        color: '#ef4444', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '14px', 
                        fontWeight: '500' 
                      }}
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>☁️</div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Drag & drop your file here</p>
                    <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280' }}>Supports PDF, TXT, MD (Max 5MB)</p>
                    <label htmlFor="file-upload" style={{
                      display: 'inline-block',
                      padding: '10px 24px',
                      backgroundColor: '#fff',
                      color: '#374151',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      Select File
                    </label>
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept=".pdf,.txt,.md" 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processFile(e.target.files[0]);
                        }
                      }} 
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {submissionType === 'link' && (
            <div key="link-fields">
              <label style={labelStyle}>
                URL
                <input 
                  type="text" 
                  style={inputStyle} 
                  placeholder="https://your-project-link.com"
                  value={formData.url} 
                  onChange={(e) => setFormData({...formData, url: e.target.value})} 
                />
              </label>

              <label style={labelStyle}>
                Additional context (optional)
                <textarea 
                  rows="4" 
                  style={inputStyle} 
                  placeholder="Anything you want the AI to focus on when reviewing the link? e.g. 'Focus on my conversion funnel'"
                  value={formData.additionalContext} 
                  onChange={(e) => setFormData({...formData, additionalContext: e.target.value})} 
                />
              </label>
            </div>
          )}

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
          {submissionType === 'file' ? 'Critique My File →' : submissionType === 'link' ? 'Critique This Link →' : tier === 'free' ? 'Get Free Critique →' : 'Get Pro Critique →'}
        </button>
      </form>
      </div>
    </div>
  );
}
