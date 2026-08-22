import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers,
  Zap
} from 'lucide-react';
import { api } from '../api';

export default function CompanyPrepHub({ onSelectProblem, setActiveTab }) {
  const [selectedCompany, setSelectedCompany] = useState('amazon');
  const [prepData, setPrepData] = useState(null);
  const [loading, setLoading] = useState(true);

  const companies = [
    { id: 'amazon', name: 'Amazon', badge: 'Leadership Principles' },
    { id: 'google', name: 'Google', badge: 'Algorithms & Scale' },
    { id: 'meta', name: 'Meta', badge: 'Speed & Architecture' },
    { id: 'microsoft', name: 'Microsoft', badge: 'Core CS & System Design' }
  ];

  useEffect(() => {
    loadCompanyData(selectedCompany);
  }, [selectedCompany]);

  const loadCompanyData = async (compId) => {
    setLoading(true);
    try {
      const res = await api.getCompanyPrep(compId);
      setPrepData(res);
    } catch (err) {
      console.error('Failed to load company prep:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 color="var(--accent-orange)" size={26} /> Placement Mentor <span style={{ color: 'var(--accent-orange)' }}>Company Prep Tracks</span>
        </h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Targeted interview questions, company-specific bar-raiser simulations, and freemium problem tracks.
        </div>
      </div>

      {/* Company Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {companies.map((comp) => {
          const isSelected = selectedCompany === comp.id;
          return (
            <div
              key={comp.id}
              onClick={() => setSelectedCompany(comp.id)}
              className={`glass-card ${isSelected ? 'glow-border-orange' : ''}`}
              style={{
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                {comp.name}
              </div>
              <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>
                {comp.badge}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Track Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left: Curated Practice Problems */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'capitalize' }}>
              {selectedCompany} Problem Bank (Freemium Preview)
            </h3>
            <span className="badge badge-emerald">2 Unlocked Problems</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {prepData?.unlocked_preview_problems?.map((prob) => (
              <div
                key={prob.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>{prob.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Topic: {prob.topic} • Expected Time: {prob.estimated_minutes}m
                  </div>
                </div>

                <button
                  className="btn btn-orange btn-sm"
                  onClick={() => {
                    if (onSelectProblem) onSelectProblem(prob.id);
                    if (setActiveTab) setActiveTab('practice');
                  }}
                >
                  Solve in IDE
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Gated Premium Tier Breakdown */}
        <div className="glass-card glow-border-orange" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Lock size={18} color="var(--accent-orange)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-orange)' }}>
              Pro Company Track
            </h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
            Unlock the complete 24-question curated {selectedCompany.toUpperCase()} problem set, Bar-Raiser mock interview simulations, and leadership principle rubrics.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>Full 24-problem high-frequency bank</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>Shadow Critic Bar-Raiser simulation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="var(--accent-emerald)" />
              <span>Google XYZ project bullet generator</span>
            </div>
          </div>

          <button className="btn btn-orange" style={{ width: '100%' }}>
            <Zap size={16} /> Upgrade to Placement Mentor Pro
          </button>
        </div>

      </div>

    </div>
  );
}
