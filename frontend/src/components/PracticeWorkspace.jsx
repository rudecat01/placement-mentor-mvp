import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Lightbulb, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Cpu, 
  Sparkles,
  ChevronRight,
  Code2,
  Terminal,
  Zap,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

export default function PracticeWorkspace({ selectedProblemId, onMasteryChange }) {
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState('');
  const [hints, setHints] = useState([]);
  const [socraticGuidance, setSocraticGuidance] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeHintTier, setActiveHintTier] = useState(0);
  const [activeTab, setActiveTab] = useState('statement'); // 'statement' | 'hints' | 'socratic'
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    loadProblems();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (selectedProblemId && problems.length > 0) {
      const match = problems.find(p => p.id === selectedProblemId);
      if (match) selectProblem(match);
    }
  }, [selectedProblemId, problems]);

  const loadProblems = async () => {
    try {
      const data = await api.getProblems();
      setProblems(data);
      if (data.length > 0 && !selectedProblemId) {
        selectProblem(data[0]);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    }
  };

  const selectProblem = (prob) => {
    setCurrentProblem(prob);
    setCode(prob.starter_code?.python || prob.reference_solution?.python || 'def solution():\n    pass\n');
    setHints([]);
    setActiveHintTier(0);
    setSocraticGuidance(null);
    setVerdict(null);
    setTimeElapsed(0);
  };

  const handleRequestHint = async (tier) => {
    if (!currentProblem) return;
    try {
      const res = await api.requestHint(currentProblem.id, tier);
      setHints(prev => [...prev.filter(h => h.hint_tier !== tier), res].sort((a, b) => a.hint_tier - b.hint_tier));
      setActiveHintTier(tier);
      setActiveTab('hints');
    } catch (err) {
      console.error('Failed to get hint:', err);
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem) return;
    setLoading(true);
    setVerdict(null);
    try {
      const res = await api.submitSolution({
        problem_id: currentProblem.id,
        language: 'python',
        submitted_code: code,
        time_spent_seconds: timeElapsed,
        hints_requested_count: hints.length
      });

      setVerdict(res.verdict);

      if (res.verdict.verdict === 'Accepted') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      if (res.mastery_update && onMasteryChange) {
        onMasteryChange(res.mastery_update);
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSocraticDebug = async () => {
    if (!currentProblem || !verdict) return;
    try {
      const res = await api.socraticDebug({
        problem_id: currentProblem.id,
        user_code: code,
        failed_test_input: verdict.failed_input ? JSON.stringify(verdict.failed_input) : null,
        expected_output: verdict.expected_output ? JSON.stringify(verdict.expected_output) : null,
        actual_output: verdict.actual_output ? JSON.stringify(verdict.actual_output) : null,
        compiler_error: verdict.compiler_error
      });
      setSocraticGuidance(res);
      setActiveTab('socratic');
    } catch (err) {
      console.error('Socratic debug request failed:', err);
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: 'calc(100vh - 120px)' }}>
      
      {/* Top Problem Selection Ribbon */}
      <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {problems.map((prob) => {
            const isSelected = currentProblem?.id === prob.id;
            return (
              <button
                key={prob.id}
                onClick={() => selectProblem(prob)}
                style={{
                  background: isSelected ? 'rgba(255, 101, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--border-orange)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {prob.title}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <Clock size={14} color="var(--accent-orange)" />
            {formatTimer(timeElapsed)}
          </div>

          <button 
            className="btn btn-orange btn-sm"
            onClick={handleSubmit}
            disabled={loading}
          >
            <Play size={14} fill="#ffffff" /> {loading ? 'Running Tests...' : 'Run & Submit Code'}
          </button>
        </div>
      </div>

      {/* Main Split: Left Spec / Hints & Right Monaco IDE */}
      <div style={{ display: 'grid', gridTemplateColumns: '40% 60%', gap: '16px', flex: 1, minHeight: 0 }}>
        
        {/* Left Column: Problem Spec, 3-Tier Hints & Socratic Debugger */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
          {/* Sub-tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.01)' }}>
            <button
              onClick={() => setActiveTab('statement')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'statement' ? 'rgba(255, 101, 0, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'statement' ? '2px solid var(--accent-orange)' : '2px solid transparent',
                color: activeTab === 'statement' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'hints' ? 'rgba(255, 101, 0, 0.08)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'hints' ? '2px solid var(--accent-orange)' : '2px solid transparent',
                color: activeTab === 'hints' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              3-Tier Hints ({hints.length}/3)
            </button>
            {socraticGuidance && (
              <button
                onClick={() => setActiveTab('socratic')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: activeTab === 'socratic' ? 'rgba(255, 101, 0, 0.08)' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'socratic' ? '2px solid var(--accent-orange)' : '2px solid transparent',
                  color: activeTab === 'socratic' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Socratic AI ⚡
              </button>
            )}
          </div>

          {/* Content Area */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            
            {activeTab === 'statement' && currentProblem && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentProblem.title}</h2>
                  <span className="badge badge-orange">{currentProblem.topic}</span>
                  <span className="badge badge-amber">Diff: {currentProblem.difficulty}/4</span>
                </div>

                <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-line', marginBottom: '20px' }}>
                  {currentProblem.statement}
                </div>

                {/* Visible Tests */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>Example Cases:</h4>
                  {currentProblem.visible_tests?.map((t, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '10px 12px', marginBottom: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      <div style={{ color: 'var(--text-muted)' }}>Input: <span style={{ color: '#fff' }}>{JSON.stringify(t.input)}</span></div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Output: <span style={{ color: 'var(--accent-orange)' }}>{JSON.stringify(t.output)}</span></div>
                      {t.explanation && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>{t.explanation}</div>}
                    </div>
                  ))}
                </div>

                {/* Complexity Guarantees */}
                <div style={{ background: 'rgba(255, 101, 0, 0.06)', border: '1px solid rgba(255, 101, 0, 0.2)', borderRadius: 'var(--radius-xs)', padding: '10px 14px', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>Expected Complexity: </span>
                  Time: {currentProblem.expected_complexity?.time || 'O(N)'} | Space: {currentProblem.expected_complexity?.space || 'O(1)'}
                </div>
              </div>
            )}

            {activeTab === 'hints' && (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[1, 2, 3].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => handleRequestHint(tier)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: activeHintTier === tier ? 'var(--accent-orange)' : 'rgba(255,255,255,0.03)',
                        color: activeHintTier === tier ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Tier {tier} Hint
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {hints.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '30px 10px' }}>
                      <Lightbulb size={32} color="var(--accent-orange)" style={{ margin: '0 auto 10px auto' }} />
                      Need guidance? Click any Tier above to unlock progressive hints without revealing code answers.
                    </div>
                  ) : (
                    hints.map((h) => (
                      <div key={h.hint_tier} style={{ background: 'rgba(255, 101, 0, 0.08)', border: '1px solid rgba(255, 101, 0, 0.3)', borderRadius: 'var(--radius-xs)', padding: '14px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-orange)', marginBottom: '4px' }}>
                          {h.tier_title}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#fff', lineHeight: 1.5 }}>
                          {h.hint_content}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'socratic' && socraticGuidance && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(255, 101, 0, 0.1)', border: '1px solid var(--border-orange)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-orange)', fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>
                    <Sparkles size={16} /> Socratic Bug Investigation
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#fff', lineHeight: 1.5, fontWeight: 600 }}>
                    "{socraticGuidance.socratic_question}"
                  </div>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  <strong>Focus Area:</strong> {socraticGuidance.investigation_focus}
                </div>

                {socraticGuidance.suggested_micro_test && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '10px 12px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Suggested Micro-Test:</div>
                    <div style={{ color: 'var(--accent-emerald)', marginTop: '2px' }}>{socraticGuidance.suggested_micro_test}</div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Monaco Editor & Telemetry Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
          
          {/* Monaco Code Editor */}
          <div className="glass-card" style={{ flex: 1, minHeight: '340px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>solution.py (Python 3.10)</span>
              <button 
                onClick={() => setCode(currentProblem?.starter_code?.python || '')} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(val) => setCode(val || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />
            </div>
          </div>

          {/* Test Execution Telemetry Console */}
          <div className="glass-card" style={{ height: '180px', padding: '14px 18px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} color="var(--accent-orange)" /> Execution Verdict & Profiler Telemetry
              </span>

              {verdict && verdict.verdict !== 'Accepted' && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleRequestSocraticDebug}
                  style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                >
                  <Sparkles size={12} color="var(--accent-orange)" /> Ask Socratic Debugger
                </button>
              )}
            </div>

            {!verdict ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', paddingTop: '20px', textAlign: 'center' }}>
                Press "Run & Submit Code" to profile your solution against visible and hidden test suites.
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span className={`badge ${verdict.verdict === 'Accepted' ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.825rem' }}>
                    {verdict.verdict === 'Accepted' ? '✓ Accepted' : `✗ ${verdict.verdict}`}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Passed: {verdict.passed_tests}/{verdict.total_tests} test cases
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Time: {verdict.execution_time_ms.toFixed(1)}ms | RAM: {verdict.peak_memory_mb.toFixed(2)}MB
                  </span>
                </div>

                {verdict.compiler_error && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-xs)', padding: '8px 12px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#fb7185' }}>
                    {verdict.compiler_error}
                  </div>
                )}

                {verdict.failed_input && (
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    <div>Failed on input: <span style={{ color: '#fff' }}>{JSON.stringify(verdict.failed_input)}</span></div>
                    <div>Expected: <span style={{ color: 'var(--accent-emerald)' }}>{JSON.stringify(verdict.expected_output)}</span> | Actual: <span style={{ color: '#fb7185' }}>{JSON.stringify(verdict.actual_output)}</span></div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
