import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Code2, 
  FileText, 
  Mic2, 
  Building2, 
  Sliders, 
  Zap,
  Target,
  User,
  Settings
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  readinessScore, 
  onOpenOnboarding, 
  onOpenSettings 
}) {
  const [apiStatus, setApiStatus] = useState({ gemini_connected: false });

  useEffect(() => {
    fetch('/api/settings/api-status')
      .then(r => r.json())
      .then(data => setApiStatus(data))
      .catch(() => {});
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice', label: 'Practice Workspace', icon: Code2 },
    { id: 'resume', label: 'Resume Doctor & ATS', icon: FileText },
    { id: 'interview', label: 'Mock Interview Panel', icon: Mic2 },
    { id: 'company', label: 'Company Hub', icon: Building2 },
    { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
  ];

  return (
    <nav style={{
      background: 'rgba(8, 8, 10, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0 32px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        
        {/* Placement Mentor Brand Logo */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} 
          onClick={() => setActiveTab('dashboard')}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff8533 0%, #ff6500 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(255, 101, 0, 0.5)'
          }}>
            <Zap size={22} color="#ffffff" fill="#ffffff" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>
              Placement<span style={{ color: 'var(--accent-orange)' }}>Mentor</span>
            </span>
            <span className="badge badge-orange" style={{ fontSize: '0.65rem', padding: '2px 8px', fontWeight: 800 }}>
              2.0 PRO
            </span>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(255, 101, 0, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(255, 101, 0, 0.35)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isActive ? 'var(--accent-orange)' : 'var(--text-muted)'} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Status Badges & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* AI Connection Status Badge */}
          <div 
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              background: apiStatus.gemini_connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 101, 0, 0.12)',
              border: apiStatus.gemini_connected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 101, 0, 0.3)',
              fontSize: '0.75rem',
              color: apiStatus.gemini_connected ? 'var(--accent-emerald)' : 'var(--accent-orange)',
              cursor: 'pointer'
            }}
            title="Click to configure AI models"
          >
            <span 
              className="pulse-dot" 
              style={{ background: apiStatus.gemini_connected ? 'var(--accent-emerald)' : 'var(--accent-orange)' }} 
            />
            <span style={{ fontWeight: 700 }}>
              {apiStatus.gemini_connected ? 'Gemini 1.5 Active' : 'AI Offline'}
            </span>
          </div>

          {/* Readiness Score Pill */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-pill)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Target size={14} color="var(--accent-orange)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Readiness:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-orange)' }}>
              {readinessScore !== null ? `${readinessScore}%` : '74%'}
            </span>
          </div>

          {/* Profile / Onboarding Trigger */}
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenOnboarding}
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <User size={14} /> Profile
          </button>

          {/* AI Settings Trigger */}
          <button 
            className="btn btn-primary btn-sm"
            onClick={onOpenSettings}
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <Settings size={14} /> Settings
          </button>

        </div>
      </div>
    </nav>
  );
}
