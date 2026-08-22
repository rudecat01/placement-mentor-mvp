import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Eye, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  ArrowRight,
  ShieldAlert,
  Zap,
  Volume2
} from 'lucide-react';
import { api } from '../api';

export default function MockInterviewRoom() {
  const [eligibility, setEligibility] = useState(null);
  const [stage, setStage] = useState('cs_core'); // 'cs_core' | 'live_dsa' | 'resume_deep_dive' | 'behavioral'
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('Can you explain how B-Tree indexes work in relational databases and their disk I/O tradeoffs?');
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [turnResult, setTurnResult] = useState(null);
  const [turnCount, setTurnCount] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      const res = await api.getInterviewEligibility();
      setEligibility(res);
    } catch (err) {
      console.error('Eligibility check failed:', err);
    }
  };

  const handleSendAnswer = async () => {
    if (!candidateAnswer.trim()) return;
    setLoading(true);
    try {
      const res = await api.executeInterviewTurn({
        stage: stage,
        question: currentQuestion,
        candidate_answer: candidateAnswer,
        duration_seconds: 30.0,
        turn_number: turnCount,
        topic: 'Databases & System Architecture'
      });

      setTurnResult(res);
      setTurnCount(prev => prev + 1);
      if (res.interviewer_dialogue && !res.is_round_complete) {
        setCurrentQuestion(res.interviewer_dialogue);
      }
      setCandidateAnswer('');
    } catch (err) {
      console.error('Turn execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Stage Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic color="var(--accent-orange)" size={26} /> Dual-Agent <span style={{ color: 'var(--accent-orange)' }}>Mock Interview Studio</span>
          </h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            AI Hiring Manager dialogues in real-time while Shadow Critic Agent scores technical depth and delivery biometrics.
          </div>
        </div>

        {/* Stage Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'cs_core', label: '1. CS Core & DB' },
            { id: 'live_dsa', label: '2. Live DSA' },
            { id: 'resume_deep_dive', label: '3. Resume Deep-Dive' },
            { id: 'behavioral', label: '4. Behavioral HR' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => { setStage(s.id); setTurnCount(1); setTurnResult(null); }}
              className={`btn ${stage === s.id ? 'btn-orange' : 'btn-secondary'} btn-sm`}
              style={{ fontSize: '0.78rem' }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Dual-Agent Workspace Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
        
        {/* Left Column: Interviewer Agent Studio */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Active Interviewer Question */}
          <div style={{ background: 'rgba(255, 101, 0, 0.08)', border: '1px solid rgba(255, 101, 0, 0.3)', borderRadius: 'var(--radius-sm)', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)', fontWeight: 800, fontSize: '0.8rem', marginBottom: '8px' }}>
              <span className="pulse-dot" style={{ background: 'var(--accent-orange)' }} />
              AI HIRING MANAGER (TURN {turnCount}/3)
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.5 }}>
              "{currentQuestion}"
            </div>
          </div>

          {/* Spoken Response Input / Visualizer */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Your Spoken / Typed Response:
              </label>

              {/* Audio Wave Visualizer Simulation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div className="audio-bar" />
                <div className="audio-bar" />
                <div className="audio-bar" />
                <div className="audio-bar" />
                <div className="audio-bar" />
              </div>
            </div>

            <textarea
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              rows={6}
              placeholder="Speak or type your technical response here. Elaborate on algorithmic tradeoffs, time complexity, and scale constraints..."
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                padding: '14px',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              className={`btn ${isRecording ? 'btn-orange' : 'btn-secondary'} btn-sm`}
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />} 
              {isRecording ? 'Listening (Active)...' : 'Enable Voice Mode'}
            </button>

            <button 
              className="btn btn-orange"
              onClick={handleSendAnswer}
              disabled={loading || !candidateAnswer.trim()}
            >
              <Zap size={16} /> {loading ? 'Shadow Critic Evaluating...' : 'Submit Spoken Turn'}
            </button>
          </div>

        </div>

        {/* Right Column: Shadow Critic Agent & Speech Biometrics */}
        <div className="glass-card glow-border-orange" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="var(--accent-orange)" /> Shadow Critic Scorecard
            </h3>
            <span className="badge badge-orange">Silent Telemetry</span>
          </div>

          {!turnResult ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '60px' }}>
              Submit your first response on the left. The Shadow Critic will continuously score your Technical Depth, Presence, and Speech Cadence.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* 4 Dimension Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Technical Accuracy</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-orange)' }}>
                    {turnResult.shadow_critic_evaluation.technical_accuracy}/10
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Problem Solving Depth</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
                    {turnResult.shadow_critic_evaluation.problem_solving_depth}/10
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Communication Clarity</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>
                    {turnResult.shadow_critic_evaluation.communication_clarity}/10
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Confidence & Presence</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#60a5fa' }}>
                    {turnResult.shadow_critic_evaluation.confidence_presence}/10
                  </div>
                </div>
              </div>

              {/* Shadow Critic Hidden Notes */}
              <div style={{ background: 'rgba(255, 101, 0, 0.08)', border: '1px solid rgba(255, 101, 0, 0.3)', borderRadius: 'var(--radius-sm)', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-orange)', marginBottom: '4px' }}>
                  SHADOW CRITIC OBSERVATION:
                </div>
                <div style={{ fontSize: '0.85rem', color: '#fff', lineHeight: 1.45 }}>
                  {turnResult.shadow_critic_evaluation.hidden_critic_notes}
                </div>
              </div>

              {/* Speech Biometrics */}
              {turnResult.speech_biometrics && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    SPEECH DELIVERY BIOMETRICS:
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Pacing: <strong style={{ color: '#fff' }}>{turnResult.speech_biometrics.words_per_minute} WPM</strong></span>
                    <span>Fillers: <strong style={{ color: turnResult.speech_biometrics.filler_words_count > 2 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{turnResult.speech_biometrics.filler_words_count}</strong></span>
                    <span>Confidence: <strong style={{ color: 'var(--accent-emerald)' }}>{Math.round(turnResult.speech_biometrics.confidence_score * 100)}%</strong></span>
                  </div>
                </div>
              )}

              {/* Contradiction Flag */}
              {turnResult.contradiction_flag && (
                <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.35)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)', fontWeight: 800, fontSize: '0.8rem' }}>
                    <ShieldAlert size={14} /> Resume Story Contradiction Flagged
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#fff', marginTop: '4px' }}>
                    {turnResult.contradiction_flag.claimed_on_resume}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
