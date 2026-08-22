import React from 'react';
import { 
  Zap, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

export default function WorkflowCycleTracker({ 
  currentDay, 
  readinessScore, 
  onNavigate 
}) {
  const steps = [
    {
      number: '01',
      title: 'Multi-Source Onboarding',
      desc: 'Resume + GitHub + LeetCode signals',
      status: 'completed',
      tab: 'dashboard'
    },
    {
      number: '02',
      title: 'Skill Graph (DAG)',
      desc: 'Initial Bayesian Mastery priors',
      status: 'completed',
      tab: 'dashboard'
    },
    {
      number: '03',
      title: 'Fixed Budget Roadmap',
      desc: 'Strict 120m daily invariant',
      status: 'active',
      tab: 'dashboard'
    },
    {
      number: '04',
      title: 'DSA Practice & Sandbox',
      desc: '3-Tier hints & telemetry scoring',
      status: 'active',
      tab: 'practice'
    },
    {
      number: '05',
      title: 'Dual-Agent Interview',
      desc: 'Interviewer + Shadow Critic scorecard',
      status: 'ready',
      tab: 'interview'
    },
    {
      number: '06',
      title: 'PTG & Blue/Red Coach',
      desc: 'Transfer gap diagnosis & pressure drills',
      status: 'ready',
      tab: 'interview'
    },
    {
      number: '07',
      title: 'Checkpoint Re-Planner',
      desc: 'Audit logs & Day N+1 progression',
      status: 'pending',
      tab: 'dashboard'
    }
  ];

  return (
    <div className="glass-card glow-border-orange" style={{ padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="var(--accent-orange)" fill="var(--accent-orange)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Closed-Loop Autonomous Placement Workflow</h3>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Diagnose → Plan → Practice (Sandbox/Hints) → Interview (Shadow Critic) → PTG (Blue/Red Team) → Re-Plan
          </div>
        </div>

        <span className="badge badge-orange" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
          Day {currentDay || 1} Loop Active
        </span>
      </div>

      {/* Workflow Steps Horizontal Flow */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '6px'
      }}>
        {steps.map((step, idx) => {
          const isDone = step.status === 'completed';
          const isActive = step.status === 'active';
          const isReady = step.status === 'ready';

          return (
            <div
              key={idx}
              onClick={() => onNavigate && onNavigate(step.tab)}
              style={{
                background: isActive ? 'rgba(255, 101, 0, 0.12)' : isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                border: isActive ? '1px solid var(--border-orange)' : isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '110px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isActive ? 'var(--accent-orange)' : isDone ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {step.number}
                </span>
                {isDone ? (
                  <CheckCircle2 size={14} color="var(--accent-emerald)" />
                ) : isActive ? (
                  <span className="pulse-dot" style={{ background: 'var(--accent-orange)', width: '6px', height: '6px' }} />
                ) : null}
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, marginBottom: '4px' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
