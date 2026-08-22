/**
 * Placement Mentor 2.0 - Unified Frontend API Client
 */

const BASE_URL = '/api';

export const api = {
  // Settings & Status
  getApiStatus: () => fetch(`${BASE_URL}/settings/api-status`).then(r => r.json()),
  setApiKey: (gemini_api_key) => 
    fetch(`${BASE_URL}/settings/api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gemini_api_key })
    }).then(r => r.json()),

  // Profile & Onboarding
  getProfile: () => fetch(`${BASE_URL}/profile`).then(r => r.json()),
  onboard: (data) =>
    fetch(`${BASE_URL}/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Readiness & Skills
  getReadinessScore: () => fetch(`${BASE_URL}/readiness-score`).then(r => r.json()),
  getSkills: () => fetch(`${BASE_URL}/skills`).then(r => r.json()),

  // Roadmap & Checkpoint
  getTodayRoadmap: () => fetch(`${BASE_URL}/roadmap/today`).then(r => r.json()),
  updateTaskStatus: (taskId, status) =>
    fetch(`${BASE_URL}/roadmap/task-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, status })
    }).then(r => r.json()),
  completeDay: () =>
    fetch(`${BASE_URL}/roadmap/complete-day`, { method: 'POST' }).then(r => r.json()),
  getAuditLogs: () => fetch(`${BASE_URL}/audit-logs`).then(r => r.json()),

  // Problems & Code Practice
  getProblems: () => fetch(`${BASE_URL}/problems`).then(r => r.json()),
  getProblem: (id) => fetch(`${BASE_URL}/problems/${id}`).then(r => r.json()),
  submitSolution: (data) =>
    fetch(`${BASE_URL}/practice/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  requestHint: (problem_id, requested_tier) =>
    fetch(`${BASE_URL}/practice/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem_id, requested_tier })
    }).then(r => r.json()),
  socraticDebug: (data) =>
    fetch(`${BASE_URL}/practice/socratic-debug`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Standalone Resume & ATS
  scoreResumeAts: (resume_text, target_role = 'SDE') =>
    fetch(`${BASE_URL}/resume/ats-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text, target_role })
    }).then(r => r.json()),
  rewriteResumeBullet: (bullet_text) =>
    fetch(`${BASE_URL}/resume/doctor-rewrite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bullet_text })
    }).then(r => r.json()),
  getDynamicIngestion: (mastered_topics) =>
    fetch(`${BASE_URL}/resume/dynamic-ingestion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mastered_topics })
    }).then(r => r.json()),
  matchJD: (jd_text, job_title = 'Software Engineer', company_name = 'Generic') =>
    fetch(`${BASE_URL}/resume/jd-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd_text, job_title, company_name })
    }).then(r => r.json()),

  // Mock Interview & Panel
  getInterviewEligibility: () => fetch(`${BASE_URL}/interview/eligibility`).then(r => r.json()),
  executeInterviewTurn: (data) =>
    fetch(`${BASE_URL}/interview/turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),

  // Company Hub
  getCompanyPrep: (company_id) => fetch(`${BASE_URL}/company-hub/${company_id}`).then(r => r.json())
};
