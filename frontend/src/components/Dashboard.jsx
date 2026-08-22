import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  History, 
  RotateCcw, 
  Award, 
  Zap, 
  Target
} from 'lucide-react';
import { api } from '../api';
import WorkflowCycleTracker from './WorkflowCycleTracker';

export default function Dashboard({ setActiveTab, setSelectedProblemId }) {
  const [profile, setProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [skills, setSkills] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replanLoading, setReplanLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profData, readyData, roadData, skillData, auditData] = await Promise.all([
        api.getProfile(),
        api.getReadinessScore(),
        api.getTodayRoadmap(),
        api.getSkills(),
        api.getAuditLogs()
      ]);
      setProfile(profData);
      setReadiness(readyData);
      setRoadmap(roadData);
      setSkills(skillData);
      setAuditLogs(auditData.reverse().slice(0, 6));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTaskStatus(taskId, newStatus);
      const updatedRoadmap = await api.getTodayRoadmap();
      setRoadmap(updatedRoadmap);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleCompleteDayCheckpoint = async () => {
    setReplanLoading(true);
    try {
      const result = await api.completeDay();
      await loadDashboardData();
      alert(`🎉 Day ${result.new_day - 1} completed! End-of-Day Checkpoint updated your mastery and planned Day ${result.new_day}.`);
    } catch (err) {
      console.error('Failed to run checkpoint:', err);
    } finally {
      setReplanLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '14px' }}>
            <div className="audio-bar" />
            <div className="audio-bar" />
            <div className="audio-bar" />
            <div className="audio-bar" />
            <div className="audio-bar" />
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Synchronizing Placement Mentor Skill Graph...</div>
        </div>
      </div>
    );
  }

  const completedMins = roadmap?.tasks
    ?.filter(t => t.status === 'completed')
    ?.reduce((sum, t) => sum + t.estimated_minutes, 0) || 0;

  const totalBudget = roadmap?.target_budget_minutes || profile?.daily_time_budget_minutes || 120;
  const progressPct = Math.min(100, Math.round((completedMins / totalBudget) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Placement Mentor Hero Section with Orange / Black Style */}
      <div style={{
        position: 'relative',
        padding: '36px 0 16px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        
        {/* Left Hero Content */}
        <div style={{ maxWidth: '720px' }}>
          
          {/* Pill Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }} className="badge-dark-pill">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
            <span style={{ fontWeight: 700, color: '#fff' }}>Autonomous Career Engine</span>
            <span style={{ color: 'var(--text-muted)' }}>• Bayesian Knowledge Tracing (BKT) Active</span>
          </div>

          <h1 style={{
            fontSize: '3rem',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.04em',
            marginBottom: '16px'
          }}>
            ONE STOP <br />
            <span className="gradient-text">Autonomous AI Mentor</span> <br />
            For TECH Interviews
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '28px',
            maxWidth: '600px'
          }}>
            Accelerate your tech career with personalized Bayesian Roadmaps (fixed 120m daily budget), Dual-Agent Mock Interviews, and Google XYZ Resume Doctor.
          </p>

          {/* Dual Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-white"
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
              onClick={() => setActiveTab('practice')}
            >
              Start Day {profile?.current_day || 1} Practice
            </button>

            <button 
              className="btn btn-orange"
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
              onClick={() => setActiveTab('interview')}
            >
              Launch Mock Interview AI →
            </button>
          </div>
        </div>

        {/* Right Status Cards (Placement Mentor Readiness Metrics) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          
          <div className="floating-success-chip" style={{ animationDelay: '0s' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ff6500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.8rem' }}>
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Fixed Daily Budget Invariant</div>
              <div style={{ fontSize: '0.75rem', color: '#ff8533', fontWeight: 600 }}>{totalBudget}m Strictly Conserved</div>
            </div>
          </div>

          <div className="floating-success-chip" style={{ animationDelay: '1.5s', marginLeft: '25px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.8rem' }}>
              <Target size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Performance Transfer Gap (PTG)</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>Transfer Health: {Math.round((readiness?.composite_metrics?.transfer_health || 0.76) * 100)}%</div>
            </div>
          </div>

          <div className="floating-success-chip" style={{ animationDelay: '2.5s', marginLeft: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.8rem' }}>
              <Award size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Target: {profile?.target_role || 'SDE Track'}</div>
              <div style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600 }}>Readiness: {readiness?.readiness_score || 74}% Calibrated</div>
            </div>
          </div>

        </div>

      </div>

      {/* 7-Stage Autonomous Workflow Tracker */}
      <WorkflowCycleTracker 
        currentDay={profile?.current_day || 1}
        readinessScore={readiness?.readiness_score}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* 3 Metric Summary Cards */}
      <div className="grid-3">
        
        {/* Metric 1: Smart Placement Readiness */}
        <div className="glass-card glow-border-orange" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Hiring Bar Readiness
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '4px', letterSpacing: '-0.03em', color: 'var(--accent-orange)' }}>
                {readiness?.readiness_score || 74}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255, 101, 0, 0.15)', border: '1px solid rgba(255, 101, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="var(--accent-orange)" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>DSA Mastery (BKT):</span>
              <strong style={{ color: '#fff' }}>{readiness?.categorical_readiness?.dsa || 72}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>System Design & Dev:</span>
              <strong style={{ color: '#fff' }}>{readiness?.categorical_readiness?.development || 68}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transfer Health (1 - PTG):</span>
              <strong style={{ color: 'var(--accent-emerald)' }}>{Math.round((readiness?.composite_metrics?.transfer_health || 0.76) * 100)}%</strong>
            </div>
          </div>
        </div>

        {/* Metric 2: Strict Fixed Daily Time Budget */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Today's Fixed Budget (Day {profile?.current_day || 1})
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: '4px', letterSpacing: '-0.03em', color: '#fff' }}>
                {completedMins}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/{totalBudget}m</span>
              </div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={24} color="#ff8533" />
            </div>
          </div>

          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #ff8533, #ff6500)', transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{progressPct}% Completed</span>
            <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>Strict Invariant: {totalBudget}m Conserved</span>
          </div>
        </div>

        {/* Metric 3: Interview Eligibility Gates */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Interview Eligibility Gate
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span className="badge badge-emerald">Core Avg: {Math.round((readiness?.composite_metrics?.average_mastery || 0.65) * 100)}%</span>
                <span className="badge badge-orange">Practice: {Math.round((readiness?.composite_metrics?.average_practice_score || 0.65) * 100)}%</span>
              </div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={24} color="var(--accent-emerald)" />
            </div>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
            Automated gate: Unlocks when core topic mastery &ge; 75% and critical topics &ge; 60%.
          </p>
          <button 
            className="btn btn-orange btn-sm" 
            style={{ width: '100%' }}
            onClick={() => setActiveTab('interview')}
          >
            Launch Mock Interview Panel <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* Main Two-Column Layout: Fixed Daily Roadmap vs Competency DAG */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left Column: Fixed Budget Roadmap */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="var(--accent-orange)" /> Day {roadmap?.day_number} Adaptive Roadmap Schedule
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {roadmap?.tasks?.length || 0} tasks planned • {roadmap?.total_allocated_minutes} minutes strictly allocated
              </div>
            </div>

            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleCompleteDayCheckpoint}
              disabled={replanLoading}
            >
              <RotateCcw size={13} /> {replanLoading ? 'Running Checkpoint...' : 'End Day Checkpoint'}
            </button>
          </div>

          {/* Task List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roadmap?.tasks?.map((task) => {
              const isDone = task.status === 'completed';
              const isRedTeam = task.task_type === 'red_team_pressure';
              const isRevision = task.task_type === 'spaced_revision';

              return (
                <div 
                  key={task.id}
                  style={{
                    background: isDone ? 'rgba(16, 185, 129, 0.05)' : isRedTeam ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : isRedTeam ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                    <button 
                      onClick={() => handleToggleTask(task.id, task.status)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: isDone ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        marginTop: '2px'
                      }}
                    >
                      <CheckCircle2 size={20} />
                    </button>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ 
                          fontWeight: 700, 
                          fontSize: '0.92rem',
                          textDecoration: isDone ? 'line-through' : 'none',
                          color: isDone ? 'var(--text-muted)' : '#ffffff'
                        }}>
                          {task.title}
                        </span>
                        {isRedTeam && <span className="badge badge-rose">Adversarial Drill</span>}
                        {isRevision && <span className="badge badge-amber">Spaced Retention</span>}
                        <span className="badge badge-orange">{task.topic}</span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {task.why_selected}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {task.estimated_minutes}m
                    </span>
                    {task.problem_id && (
                      <button 
                        className="btn btn-orange btn-sm"
                        onClick={() => {
                          setSelectedProblemId(task.problem_id);
                          setActiveTab('practice');
                        }}
                      >
                        Solve
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Skill DAG & Audit Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Skill Graph Competencies */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--accent-orange)" /> Skill Graph Competencies (DAG)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {skills.map((skill) => {
                const masteryPct = Math.round(skill.mastery * 100);
                const hasHighPtg = skill.ptg !== null && skill.ptg > 0.25;

                return (
                  <div 
                    key={skill.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
                        {skill.name} {skill.is_critical_for_role && <span style={{ color: 'var(--accent-orange)', fontSize: '0.7rem', fontWeight: 800 }}>★ Core</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Prereqs: {skill.prerequisites.length ? skill.prerequisites.join(', ') : 'None'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hasHighPtg && (
                        <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>
                          PTG {skill.ptg.toFixed(2)}
                        </span>
                      )}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: masteryPct >= 75 ? 'var(--accent-emerald)' : 'var(--accent-orange)' }}>
                          {masteryPct}%
                        </div>
                        <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${masteryPct}%`, height: '100%', background: masteryPct >= 75 ? 'var(--accent-emerald)' : 'var(--accent-orange)' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* "Why This Moved" Audit Timeline */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="#ff8533" /> "Why This Moved" Audit Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {auditLogs.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '14px' }}>
                  No roadmap modifications logged yet. Checkpoint decisions will appear here with explainable audit reasons.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div 
                    key={log.id}
                    style={{
                      borderLeft: '2px solid var(--accent-orange)',
                      paddingLeft: '10px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                      <span>Day {log.day_number} • {log.topic}</span>
                      <span className="badge badge-orange" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>{log.event_type}</span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#fff', margin: '2px 0' }}>{log.change_description}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{log.rationale}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
