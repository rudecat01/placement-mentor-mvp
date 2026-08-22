import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Save, 
  X,
  Zap
} from 'lucide-react';
import { api } from '../api';

export default function SettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState({ gemini_connected: false, has_key: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const checkStatus = async () => {
    try {
      const res = await api.getApiStatus();
      setStatus(res);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await api.setApiKey(apiKey.trim());
      setStatus({ gemini_connected: res.gemini_connected, has_key: true });
      setMessage(res.message || 'Key saved successfully!');
    } catch (err) {
      setMessage('Failed to save API key.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 5, 7, 0.9)',
      backdropFilter: 'blur(24px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div className="glass-card glow-border-orange" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '32px',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={22} color="var(--accent-orange)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900 }}>Placement Mentor <span style={{ color: 'var(--accent-orange)' }}>AI Settings</span></h2>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Status Badge */}
        <div style={{
          background: status.gemini_connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 101, 0, 0.12)',
          border: status.gemini_connected ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(255, 101, 0, 0.35)',
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '22px'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: status.gemini_connected ? 'var(--accent-emerald)' : 'var(--accent-orange)' }}>
              {status.gemini_connected ? '✓ Google Gemini LLM Connected (Live Reasoning)' : '⚡ Deterministic Fallback Mode (Offline)'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
              {status.gemini_connected ? 'Model: gemini-1.5-flash live active' : 'Connect free Gemini key below for live open-ended dialogue'}
            </div>
          </div>

          <span className={`badge ${status.gemini_connected ? 'badge-emerald' : 'badge-orange'}`}>
            {status.gemini_connected ? 'Live AI' : 'Deterministic'}
          </span>
        </div>

        {/* Input Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
              Google Gemini API Key:
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '12px 16px',
                background: 'var(--bg-surface-elevated)',
                color: '#fff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Need a free key?</span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: 'var(--accent-orange)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 700 }}
            >
              Get Free Gemini Key from Google AI Studio <ExternalLink size={13} />
            </a>
          </div>

          {message && (
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: status.gemini_connected ? 'var(--accent-emerald)' : 'var(--accent-orange)' }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-orange" onClick={handleSaveKey} disabled={loading || !apiKey.trim()}>
              <Save size={16} /> {loading ? 'Testing Key...' : 'Save & Connect Key'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
