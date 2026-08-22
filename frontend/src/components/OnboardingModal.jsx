import React, { useState } from 'react';
import { 
  User, 
  Clock, 
  Calendar, 
  FileText, 
  Github, 
  Code2, 
  Sliders, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  X,
  Zap
} from 'lucide-react';
import { api } from '../api';

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: 'Aryan Sharma',
    target_role: 'Software Development Engineer',
    daily_time_budget_minutes: 120,
    preparation_duration_days: 45,
    resume_text: `Aryan Sharma
EXPERIENCE
Software Engineer Intern
• Built backend microservices in Python, SQL, Docker, reducing latency by 35%.
• Implemented caching with Redis across 50,000+ daily requests.

SKILLS
Python, Java, Data Structures, Algorithms, SQL, Git, Docker, System Design

EDUCATION
B.Tech Computer Science`,
    github_username: 'aryan-sharma',
    leetcode_username: 'aryan_dev',
    self_assessment_sliders: {
      arrays_hashing: 0.75,
      sliding_window: 0.60,
      two_pointers: 0.70,
      binary_search: 0.65,
      trees_bst: 0.50,
      graphs: 0.45,
      dynamic_programming: 0.35,
      rest_apis_http: 0.75,
      sql_dbms: 0.65
    }
  });

  if (!isOpen) return null;

  const handleSliderChange = (topic, val) => {
    setFormData(prev => ({
      ...prev,
      self_assessment_sliders: {
        ...prev.self_assessment_sliders,
        [topic]: parseFloat(val)
      }
    }));
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      const res = await api.onboard(formData);
      if (onComplete) onComplete(res);
      onClose();
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 5, 7, 0.92)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card glow-border-orange" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-orange)' }}>
              STEP {step} OF 3
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, marginTop: '2px' }}>
              {step === 1 && 'Placement Target & Time Invariant'}
              {step === 2 && 'Signal Ingestion (Resume, GitHub, LeetCode)'}
              {step === 3 && 'Competency Prior Calibration'}
            </h2>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          
          {/* Step 1: Target & Fixed Budget */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Full Name:</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  style={{ width: '100%', marginTop: '6px', padding: '10px 14px', background: 'var(--bg-surface-elevated)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-pill)', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Target Role Track:</label>
                <select
                  value={formData.target_role}
                  onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                  style={{ width: '100%', marginTop: '6px', padding: '10px 14px', background: 'var(--bg-surface-elevated)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-pill)', outline: 'none' }}
                >
                  <option>Software Development Engineer</option>
                  <option>Backend Systems Engineer</option>
                  <option>Full-Stack Web Engineer</option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Strict Daily Time Budget (Invariant):
                  </label>
                  <strong style={{ color: 'var(--accent-orange)' }}>{formData.daily_time_budget_minutes} mins/day</strong>
                </div>
                <input
                  type="range"
                  min="30"
                  max="240"
                  step="15"
                  value={formData.daily_time_budget_minutes}
                  onChange={(e) => setFormData({ ...formData, daily_time_budget_minutes: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent-orange)' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  The Roadmap Planner strictly conserves this time budget every day without mid-day reshuffles.
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Signal Ingestion */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Resume Plaintext:</label>
                <textarea
                  rows={6}
                  value={formData.resume_text}
                  onChange={(e) => setFormData({ ...formData, resume_text: e.target.value })}
                  style={{ width: '100%', marginTop: '6px', padding: '10px 14px', background: 'var(--bg-surface-elevated)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>GitHub Username:</label>
                  <input
                    type="text"
                    value={formData.github_username}
                    onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
                    style={{ width: '100%', marginTop: '6px', padding: '10px 14px', background: 'var(--bg-surface-elevated)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-pill)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LeetCode Handle:</label>
                  <input
                    type="text"
                    value={formData.leetcode_username}
                    onChange={(e) => setFormData({ ...formData, leetcode_username: e.target.value })}
                    style={{ width: '100%', marginTop: '6px', padding: '10px 14px', background: 'var(--bg-surface-elevated)', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-pill)', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Self-Assessment Sliders */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Calibrate your baseline competency priors across core DAG topics:
              </div>

              {Object.entries(formData.self_assessment_sliders).map(([topic, val]) => (
                <div key={topic}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                    <span style={{ textTransform: 'capitalize', color: '#fff', fontWeight: 600 }}>{topic.replace('_', ' ')}</span>
                    <strong style={{ color: 'var(--accent-orange)' }}>{Math.round(val * 100)}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.95"
                    step="0.05"
                    value={val}
                    onChange={(e) => handleSliderChange(topic, e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--accent-orange)' }}
                  />
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? (
            <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button className="btn btn-orange" onClick={() => setStep(step + 1)}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-orange" onClick={handleFinishOnboarding} disabled={loading}>
              <Zap size={16} /> {loading ? 'Calibrating DAG & Roadmap...' : 'Generate Day 1 Roadmap'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
