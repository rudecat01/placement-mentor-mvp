import React, { useState } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';

export default function WhatIfSimulator() {
  const [dailyMinutes, setDailyMinutes] = useState(120);
  const [daysRemaining, setDaysRemaining] = useState(45);
  const [targetCompanyTier, setTargetCompanyTier] = useState('tier1'); // 'tier1' | 'tier2' | 'service'
  const [interviewsPerWeek, setInterviewsPerWeek] = useState(2);

  // Dynamic simulation computation
  const totalPrepCapacityHours = Math.round((dailyMinutes * daysRemaining) / 60);
  const projectedProblemsMastered = Math.round(totalPrepCapacityHours / 0.8);
  
  const baseReadiness = 65;
  const timeBonus = (dailyMinutes - 60) * 0.12;
  const daysBonus = (daysRemaining - 30) * 0.25;
  const mockBonus = interviewsPerWeek * 3.5;
  const projectedScore = Math.min(98, Math.max(35, Math.round(baseReadiness + timeBonus + daysBonus + mockBonus)));

  const tierRequirements = {
    tier1: { minScore: 85, label: 'Tier-1 FAANG/MAMAA (Google, Amazon, Meta)' },
    tier2: { minScore: 70, label: 'Tier-2 Product High-Growth (Uber, Stripe, Swiggy)' },
    service: { minScore: 55, label: 'Tier-3 Enterprise Consultancies' }
  };

  const currentTier = tierRequirements[targetCompanyTier];
  const willClearHiringBar = projectedScore >= currentTier.minScore;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders color="var(--accent-orange)" size={26} /> Placement Mentor <span style={{ color: 'var(--accent-orange)' }}>What-If Scenario Simulator</span>
        </h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Adjust your daily preparation budget and timeline constraints to project placement hiring-bar outcomes.
        </div>
      </div>

      {/* Simulator Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Interactive Sliders */}
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Simulation Parameters</h3>

          {/* Slider 1: Daily Time Budget */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Daily Time Budget (Invariant):</span>
              <strong style={{ color: 'var(--accent-orange)', fontSize: '1rem' }}>{dailyMinutes} minutes/day</strong>
            </div>
            <input 
              type="range" 
              min="30" 
              max="240" 
              step="15"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-orange)' }}
            />
          </div>

          {/* Slider 2: Days Remaining */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Preparation Timeline:</span>
              <strong style={{ color: '#fff', fontSize: '1rem' }}>{daysRemaining} days</strong>
            </div>
            <input 
              type="range" 
              min="14" 
              max="90" 
              step="1"
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-orange)' }}
            />
          </div>

          {/* Slider 3: Mock Interviews / Week */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mock Interview Frequency:</span>
              <strong style={{ color: 'var(--accent-emerald)', fontSize: '1rem' }}>{interviewsPerWeek} sessions/week</strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="1"
              value={interviewsPerWeek}
              onChange={(e) => setInterviewsPerWeek(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
            />
          </div>

          {/* Radio: Target Company Tier */}
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Target Company Category:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(tierRequirements).map(([key, info]) => (
                <label 
                  key={key} 
                  style={{
                    background: targetCompanyTier === key ? 'rgba(255, 101, 0, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: targetCompanyTier === key ? '1px solid var(--border-orange)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <input 
                    type="radio" 
                    name="companyTier" 
                    value={key} 
                    checked={targetCompanyTier === key}
                    onChange={(e) => setTargetCompanyTier(e.target.value)}
                    style={{ accentColor: 'var(--accent-orange)' }}
                  />
                  <span>{info.label} (Required: {info.minScore}+)</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Projected Outcomes */}
        <div className="glass-card glow-border-orange" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-orange)' }}>
            Projected Placement Readiness
          </h3>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 101, 0, 0.1)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-orange)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 800 }}>SIMULATED READINESS INDEX</div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-orange)' }}>
                {projectedScore}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>

            <span className={`badge ${willClearHiringBar ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
              {willClearHiringBar ? '✓ Clears Hiring Bar' : '✗ Below Hiring Bar'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Dedicated Practice Hours:</span>
              <strong style={{ color: '#fff' }}>{totalPrepCapacityHours} hours</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Projected Problems Mastered (BKT &ge; 0.85):</span>
              <strong style={{ color: '#fff' }}>~{projectedProblemsMastered} problems</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Target Hiring Threshold:</span>
              <strong style={{ color: 'var(--accent-orange)' }}>{currentTier.minScore}/100</strong>
            </div>
          </div>

          <div style={{ background: willClearHiringBar ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)', border: willClearHiringBar ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-sm)', padding: '14px', fontSize: '0.825rem', color: '#fff', lineHeight: 1.5 }}>
            {willClearHiringBar 
              ? `✅ With ${dailyMinutes}m/day over ${daysRemaining} days, you are projected to clear the bar for ${currentTier.label}.`
              : `⚠️ You are currently ${currentTier.minScore - projectedScore} points below the hiring threshold. Increase daily budget to 150m+ or add mock interview sessions.`
            }
          </div>
        </div>

      </div>

    </div>
  );
}
