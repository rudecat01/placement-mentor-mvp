import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Search, 
  Briefcase,
  Zap
} from 'lucide-react';
import { api } from '../api';

export default function ResumeDoctor() {
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' | 'ats' | 'jd'
  
  // Bullet Rewriter State
  const [inputBullet, setInputBullet] = useState('Responsible for backend API development and fixing bugs.');
  const [rewriteResult, setRewriteResult] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(false);

  // ATS State
  const [resumeText, setResumeText] = useState(`Aryan Sharma - SDE
EXPERIENCE
Software Engineer at Acme Tech
• Developed backend microservices using Python, SQL, and Docker.
• Worked on database performance tuning and API endpoints.

SKILLS
Python, Java, Data Structures, Algorithms, SQL, Git, Docker, System Design

EDUCATION
B.Tech Computer Science`);
  const [atsResult, setAtsResult] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);

  // JD Matcher State
  const [jdText, setJdText] = useState(`Google Software Engineer (L4):
Key Qualifications:
- 3+ years experience with Python, Go, and Docker.
- Strong knowledge of Data Structures, Algorithms, Dynamic Programming, and Graph algorithms.
- Distributed systems and PostgreSQL query optimization.`);
  const [jdResult, setJdResult] = useState(null);
  const [jdLoading, setJdLoading] = useState(false);

  const handleRewrite = async () => {
    if (!inputBullet.trim()) return;
    setDoctorLoading(true);
    try {
      const res = await api.rewriteResumeBullet(inputBullet);
      setRewriteResult(res);
    } catch (err) {
      console.error('Bullet rewrite failed:', err);
    } finally {
      setDoctorLoading(false);
    }
  };

  const handleScoreATS = async () => {
    if (!resumeText.trim()) return;
    setAtsLoading(true);
    try {
      const res = await api.scoreResumeAts(resumeText, 'SDE');
      setAtsResult(res);
    } catch (err) {
      console.error('ATS scoring failed:', err);
    } finally {
      setAtsLoading(false);
    }
  };

  const handleMatchJD = async () => {
    if (!jdText.trim()) return;
    setJdLoading(true);
    try {
      const res = await api.matchJD(jdText, 'Software Engineer', 'Google');
      setJdResult(res);
    } catch (err) {
      console.error('JD match failed:', err);
    } finally {
      setJdLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Sub-header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText color="var(--accent-orange)" size={26} /> Placement Mentor <span style={{ color: 'var(--accent-orange)' }}>Resume Doctor & ATS</span>
          </h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Transform passive phrases into Google XYZ metrics & measure job description match percentages.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('doctor')}
            className={`btn ${activeTab === 'doctor' ? 'btn-orange' : 'btn-secondary'} btn-sm`}
          >
            <Sparkles size={14} /> Google XYZ Rewriter
          </button>
          <button
            onClick={() => setActiveTab('ats')}
            className={`btn ${activeTab === 'ats' ? 'btn-orange' : 'btn-secondary'} btn-sm`}
          >
            <Zap size={14} /> ATS Scanner (0-100)
          </button>
          <button
            onClick={() => setActiveTab('jd')}
            className={`btn ${activeTab === 'jd' ? 'btn-orange' : 'btn-secondary'} btn-sm`}
          >
            <Briefcase size={14} /> JD Skill Matcher
          </button>
        </div>
      </div>

      {/* Tab 1: Google XYZ Rewriter */}
      {activeTab === 'doctor' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>Input Weak Resume Bullet</h3>
            <textarea
              value={inputBullet}
              onChange={(e) => setInputBullet(e.target.value)}
              rows={5}
              placeholder="e.g., Worked on backend API development and fixed bugs..."
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button 
                className="btn btn-orange"
                onClick={handleRewrite}
                disabled={doctorLoading || !inputBullet.trim()}
              >
                <Sparkles size={16} /> {doctorLoading ? 'Transforming...' : 'Rewrite with Google XYZ'}
              </button>
            </div>
          </div>

          <div className="glass-card glow-border-orange" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px', color: 'var(--accent-orange)' }}>
              Google XYZ Formula Output
            </h3>

            {!rewriteResult ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '40px' }}>
                Enter a bullet point on the left and click "Rewrite with Google XYZ" to view metric-quantified transformations.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-sm)', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                    RECOMMENDED XYZ BULLET:
                  </div>
                  <div style={{ fontSize: '0.92rem', color: '#fff', lineHeight: 1.5, fontWeight: 600 }}>
                    "{rewriteResult.suggested_xyz_rewrite}"
                  </div>
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  <strong>Critique:</strong> {rewriteResult.critique_reason}
                </div>

                {rewriteResult.improved_metrics && (
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      INJECTED QUANTIFIABLE METRICS:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {rewriteResult.improved_metrics.map((m, idx) => (
                        <span key={idx} className="badge badge-orange">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: ATS Scanner */}
      {activeTab === 'ats' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>Full Resume Plaintext</h3>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={14}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                padding: '14px',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button 
                className="btn btn-orange"
                onClick={handleScoreATS}
                disabled={atsLoading || !resumeText.trim()}
              >
                <Zap size={16} /> {atsLoading ? 'Evaluating...' : 'Run ATS 0-100 Audit'}
              </button>
            </div>
          </div>

          <div className="glass-card glow-border-orange" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>ATS Breakdown Scorecard</h3>

            {!atsResult ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '60px' }}>
                Click "Run ATS 0-100 Audit" to inspect keyword density, section hierarchy, and quantification health.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255, 101, 0, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-orange)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>OVERALL ATS SCORE</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-orange)' }}>
                      {atsResult.overall_score}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </div>
                  <span className={`badge ${atsResult.overall_score >= 75 ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                    {atsResult.overall_score >= 75 ? 'Strong ATS Pass' : 'Needs Quantification'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Keyword Match:</span>
                    <strong>{atsResult.keyword_match_score}/35</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Section Hierarchy:</span>
                    <strong>{atsResult.section_hierarchy_score}/25</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Google XYZ Quantification:</span>
                    <strong>{atsResult.quantification_score}/25</strong>
                  </div>
                </div>

                {atsResult.matched_keywords && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '6px' }}>MATCHED TECH KEYWORDS:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {atsResult.matched_keywords.map((kw, i) => (
                        <span key={i} className="badge badge-emerald">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 3: JD Matcher */}
      {activeTab === 'jd' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '12px' }}>Paste Target Job Description (JD)</h3>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              rows={12}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                padding: '14px',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button 
                className="btn btn-orange"
                onClick={handleMatchJD}
                disabled={jdLoading || !jdText.trim()}
              >
                <Briefcase size={16} /> {jdLoading ? 'Comparing...' : 'Compute Skill Delta Gap'}
              </button>
            </div>
          </div>

          <div className="glass-card glow-border-orange" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Candidate Skill Delta Match</h3>

            {!jdResult ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', paddingTop: '60px' }}>
                Paste the job description on the left to extract tech requirements and cross-reference against your live DAG mastery.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role Match Alignment</div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--accent-orange)' }}>
                      {jdResult.overall_match_percentage}%
                    </div>
                  </div>
                  <span className="badge badge-orange">{jdResult.detected_skills_count} Technologies Extracted</span>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-rose)', marginBottom: '8px' }}>
                    PRIORITY GAP COMPETENCIES TO PRACTICE:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {jdResult.skill_deltas?.map((gap, i) => (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{gap.skill}</span>
                        <span style={{ color: 'var(--accent-rose)' }}>Current: {Math.round(gap.current_mastery * 100)}% (Delta: -{Math.round(gap.delta * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
