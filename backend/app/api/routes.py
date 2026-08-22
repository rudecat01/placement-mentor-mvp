"""Placement Mentor 2.0 - FastAPI REST API Router.

Exposes endpoints for:
- Profile & Onboarding Multi-Source Signal Ingestion
- Skill Graph DAG & Placement Readiness Score
- Daily Fixed Budget Roadmaps & End-of-Day Checkpoints
- Code Practice, Isolated Sandbox, 3-Tier Hints & Socratic Debugging
- Standalone Resume Doctor, ATS Scoring & JD Matcher
- Dual-Agent Mock Interview Panel & Freemium Company Prep Tracks
"""

from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.core.adversarial_coach import AdversarialCoachEngine
from backend.app.core.ats_scorer import ATSScorer
from backend.app.core.bkt_engine import BKTEngine
from backend.app.core.decay_engine import MemoryDecayEngine
from backend.app.core.eligibility_gate import EligibilityGate
from backend.app.core.interview_panel import InterviewPanelEngine
from backend.app.core.jd_matcher import JDMatcher
from backend.app.core.llm import gemini_engine
from backend.app.core.ptg_engine import PTGEngine
from backend.app.core.resume_doctor import ResumeDoctor
from backend.app.core.roadmap_planner import RoadmapPlanner
from backend.app.core.sandbox import CodeSandbox
from backend.app.core.socratic_agent import SocraticAgent
from backend.app.models.schemas import (
    AttemptEvidence,
    AuditLog,
    ComplexityVerdict,
    DailyPlan,
    InterviewRoundStage,
    Problem,
    RoadmapTask,
    SkillNode,
    StudentProfile,
    TaskStatus,
)
from backend.app.storage.db import PlacementDatabase

router = APIRouter()
db = PlacementDatabase()

# Core engines
bkt_engine = BKTEngine()
ptg_engine = PTGEngine()
gate_evaluator = EligibilityGate()
decay_engine = MemoryDecayEngine()
sandbox = CodeSandbox()
socratic_agent = SocraticAgent()
ats_scorer = ATSScorer()
resume_doctor = ResumeDoctor()
jd_matcher = JDMatcher()
interview_panel = InterviewPanelEngine()
adversarial_coach = AdversarialCoachEngine()
roadmap_planner = RoadmapPlanner()


# ==========================================
# 0. API KEY & AI STATUS
# ==========================================

class APIKeyPayload(BaseModel):
    gemini_api_key: str


@router.get("/settings/api-status")
def get_api_connection_status():
    return {
        "gemini_connected": gemini_engine.is_connected(),
        "model": "gemini-1.5-flash",
        "has_key": bool(gemini_engine.api_key)
    }


@router.post("/settings/api-key")
def update_gemini_api_key(payload: APIKeyPayload):
    gemini_engine.set_api_key(payload.gemini_api_key)
    return {
        "status": "success",
        "gemini_connected": gemini_engine.is_connected(),
        "message": "Gemini API key updated and initialized." if gemini_engine.is_connected() else "Key set. Verify network or key validity."
    }


# ==========================================
# 1. PROFILE & ONBOARDING ROUTES
# ==========================================

class OnboardingPayload(BaseModel):
    full_name: str = "Aryan Sharma"
    target_role: str = "Software Development Engineer"
    daily_time_budget_minutes: int = 120
    preparation_duration_days: int = 45
    resume_text: Optional[str] = None
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None
    self_assessment_sliders: Dict[str, float] = {}


@router.get("/profile")
def get_profile():
    return db.get_profile()


@router.post("/onboard")
def onboard_student(payload: OnboardingPayload):
    profile = db.get_profile()
    profile.full_name = payload.full_name
    profile.target_role = payload.target_role
    profile.daily_time_budget_minutes = payload.daily_time_budget_minutes
    profile.preparation_duration_days = payload.preparation_duration_days
    profile.resume_text = payload.resume_text
    profile.github_username = payload.github_username
    profile.leetcode_username = payload.leetcode_username
    profile.self_assessment_sliders = payload.self_assessment_sliders
    db.save_profile(profile)

    # Ingest baseline skill priors
    skills = db.get_skill_nodes()
    for s in skills:
        if s.id in payload.self_assessment_sliders:
            slider_val = payload.self_assessment_sliders[s.id]
            s.mastery = round(max(0.10, min(0.95, slider_val)), 2)
            s.practice_score = s.mastery
    db.save_skill_nodes(skills)

    # Generate initial Day 1 roadmap plan
    problems = db.get_all_problems()
    day_1_plan, audits = roadmap_planner.generate_daily_plan(profile, skills, problems, day_number=1)
    db.save_roadmap_for_day(day_1_plan)
    for a in audits:
        db.record_audit_log(a)

    return {
        "status": "success",
        "profile": profile,
        "day_1_plan": day_1_plan,
        "message": f"Profile calibrated. Day 1 roadmap generated strictly with {profile.daily_time_budget_minutes}m budget."
    }


# ==========================================
# 2. SKILL GRAPH & READINESS SCORE
# ==========================================

@router.get("/skills")
def get_skill_graph():
    return db.get_skill_nodes()


@router.get("/readiness-score")
def calculate_readiness_score():
    skills = db.get_skill_nodes()
    if not skills:
        return {"readiness_score": 50, "breakdown": {}}

    dsa_nodes = [s for s in skills if s.category == "dsa"]
    dev_nodes = [s for s in skills if s.category == "development"]
    cs_nodes = [s for s in skills if s.category == "core_cs"]

    dsa_avg = sum(s.mastery for s in dsa_nodes) / max(1, len(dsa_nodes))
    dev_avg = sum(s.mastery for s in dev_nodes) / max(1, len(dev_nodes))
    cs_avg = sum(s.mastery for s in cs_nodes) / max(1, len(cs_nodes))

    # Calculate average PTG (Performance Transfer Gap)
    ptg_vals = [s.ptg for s in skills if s.ptg is not None]
    avg_ptg = sum(ptg_vals) / len(ptg_vals) if ptg_vals else 0.15
    transfer_factor = max(0.50, 1.0 - avg_ptg)

    # Composite weighted Readiness Score (0-100)
    raw_readiness = (dsa_avg * 0.50 + dev_avg * 0.25 + cs_avg * 0.25) * transfer_factor * 100.0
    overall_readiness = round(max(20.0, min(99.0, raw_readiness)))

    return {
        "readiness_score": overall_readiness,
        "categorical_readiness": {
            "dsa": round(dsa_avg * 100),
            "development": round(dev_avg * 100),
            "core_cs": round(cs_avg * 100)
        },
        "composite_metrics": {
            "average_mastery": round((dsa_avg + dev_avg + cs_avg) / 3.0, 2),
            "average_practice_score": round(sum(s.practice_score for s in skills) / len(skills), 2),
            "average_ptg": round(avg_ptg, 2),
            "transfer_health": round(transfer_factor, 2)
        }
    }


# ==========================================
# 3. ROADMAP & AUDIT LOGS
# ==========================================

@router.get("/roadmap/today")
def get_today_roadmap():
    profile = db.get_profile()
    plan = db.get_roadmap_for_day(profile.current_day)
    if not plan:
        skills = db.get_skill_nodes()
        problems = db.get_all_problems()
        plan, audits = roadmap_planner.generate_daily_plan(profile, skills, problems, profile.current_day)
        db.save_roadmap_for_day(plan)
        for a in audits:
            db.record_audit_log(a)
    return plan


class TaskStatusUpdatePayload(BaseModel):
    task_id: str
    status: TaskStatus


@router.post("/roadmap/task-status")
def update_task_status(payload: TaskStatusUpdatePayload):
    profile = db.get_profile()
    plan = db.get_roadmap_for_day(profile.current_day)
    if not plan:
        raise HTTPException(status_code=404, detail="No active daily plan found.")

    for t in plan.tasks:
        if t.id == payload.task_id:
            t.status = payload.status
            break

    db.save_roadmap_for_day(plan)
    return {"status": "success", "task_id": payload.task_id, "new_status": payload.status}


@router.post("/roadmap/complete-day")
def complete_day_checkpoint():
    profile = db.get_profile()
    curr_day = profile.current_day
    skills = db.get_skill_nodes()
    problems = db.get_all_problems()

    # Mark day complete
    curr_plan = db.get_roadmap_for_day(curr_day)
    if curr_plan:
        curr_plan.is_completed = True
        db.save_roadmap_for_day(curr_plan)

    # Advance day
    profile.current_day += 1
    db.save_profile(profile)

    # Plan Day N+1
    next_plan, audits = roadmap_planner.generate_daily_plan(profile, skills, problems, profile.current_day)
    db.save_roadmap_for_day(next_plan)
    for a in audits:
        db.record_audit_log(a)

    return {
        "status": "success",
        "completed_day": curr_day,
        "new_day": profile.current_day,
        "next_plan": next_plan
    }


@router.get("/audit-logs")
def get_audit_logs():
    return db.get_audit_logs()


# ==========================================
# 4. PRACTICE & CODE SANDBOX
# ==========================================

@router.get("/problems")
def get_problems():
    return db.get_all_problems()


@router.get("/problems/{problem_id}")
def get_problem(problem_id: str):
    problem = db.get_problem_by_id(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem


class SubmissionPayload(BaseModel):
    problem_id: str
    language: str = "python"
    submitted_code: str
    time_spent_seconds: float = 0.0
    hints_requested_count: int = 0


@router.post("/practice/submit")
def submit_solution(payload: SubmissionPayload):
    problem = db.get_problem_by_id(payload.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # Run in isolated sandbox
    verdict = sandbox.execute(problem, payload.submitted_code, payload.language)

    # Record Attempt
    evidence = AttemptEvidence(
        id=f"att_{payload.problem_id}_{len(db.get_all_attempts()) + 1}",
        problem_id=problem.id,
        topic=problem.topic,
        submitted_code=payload.submitted_code,
        language=payload.language,
        verdict=verdict.verdict,
        difficulty=problem.difficulty,
        hints_requested=payload.hints_requested_count,
        time_spent_seconds=payload.time_spent_seconds,
        estimated_seconds=problem.estimated_minutes * 60.0,
        execution_time_ms=verdict.execution_time_ms,
        execution_memory_mb=verdict.peak_memory_mb,
        test_cases_passed=verdict.passed_tests,
        test_cases_total=verdict.total_tests
    )
    db.record_attempt(evidence)

    # Update Topic Mastery in DAG
    skills = db.get_skill_nodes()
    matched_skill = next((s for s in skills if s.name.lower() in problem.topic.lower() or problem.topic.lower() in s.name.lower()), None)

    mastery_info = {}
    if matched_skill:
        new_mastery, posterior, multiplier = bkt_engine.update_mastery(matched_skill.mastery, evidence)
        new_practice = bkt_engine.update_practice_score(matched_skill.practice_score, evidence)

        # Log mastery update audit
        db.record_audit_log(AuditLog(
            id=f"audit_mast_{evidence.id}",
            day_number=db.get_profile().current_day,
            event_type="mastery_update",
            topic=matched_skill.name,
            trigger_attempt_id=evidence.id,
            change_description=f"Mastery updated from {matched_skill.mastery:.2f} to {new_mastery:.2f}",
            rationale=f"Attempt verdict: {verdict.verdict}, Multiplier: {multiplier:.3f}, Posterior: {posterior:.3f}",
            previous_value=f"{matched_skill.mastery:.2f}",
            new_value=f"{new_mastery:.2f}"
        ))

        matched_skill.mastery = new_mastery
        matched_skill.practice_score = new_practice
        db.save_skill_nodes(skills)

        mastery_info = {
            "topic": matched_skill.name,
            "new_mastery": new_mastery,
            "new_practice_score": new_practice,
            "evidence_multiplier": multiplier
        }

    return {
        "verdict": verdict,
        "mastery_update": mastery_info
    }


class HintRequestPayload(BaseModel):
    problem_id: str
    requested_tier: int = 1


@router.post("/practice/hint")
def request_hint(payload: HintRequestPayload):
    problem = db.get_problem_by_id(payload.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return socratic_agent.get_tiered_hint(problem, payload.requested_tier)


class SocraticDebugPayload(BaseModel):
    problem_id: str
    user_code: str
    failed_test_input: Optional[str] = None
    expected_output: Optional[str] = None
    actual_output: Optional[str] = None
    compiler_error: Optional[str] = None


@router.post("/practice/socratic-debug")
def socratic_debug(payload: SocraticDebugPayload):
    problem = db.get_problem_by_id(payload.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    if gemini_engine.is_connected():
        llm_res = gemini_engine.generate_socratic_debug(
            problem_title=problem.title,
            problem_topic=problem.topic,
            problem_statement=problem.statement,
            user_code=payload.user_code,
            failed_test_input=payload.failed_test_input,
            expected_output=payload.expected_output,
            actual_output=payload.actual_output,
            compiler_error=payload.compiler_error
        )
        if llm_res:
            return llm_res

    return socratic_agent.generate_socratic_debug_guidance(
        problem=problem,
        user_code=payload.user_code,
        failed_test_input=payload.failed_test_input,
        expected_output=payload.expected_output,
        actual_output=payload.actual_output,
        compiler_error=payload.compiler_error
    )


# ==========================================
# 5. STANDALONE RESUME & ATS TOOLS
# ==========================================

class ATSPayload(BaseModel):
    resume_text: str
    target_role: str = "SDE"


@router.post("/resume/ats-score")
def score_resume_ats(payload: ATSPayload):
    return ats_scorer.score_resume(payload.resume_text, payload.target_role)


class BulletPayload(BaseModel):
    bullet_text: str


@router.post("/resume/doctor-rewrite")
def rewrite_resume_bullet(payload: BulletPayload):
    if gemini_engine.is_connected():
        llm_res = gemini_engine.generate_xyz_rewrite(payload.bullet_text)
        if llm_res:
            return llm_res
    return resume_doctor.analyze_and_rewrite_bullet(payload.bullet_text)


class DynamicIngestionPayload(BaseModel):
    mastered_topics: List[str]


@router.post("/resume/dynamic-ingestion")
def get_dynamic_resume_suggestions(payload: DynamicIngestionPayload):
    return resume_doctor.generate_dynamic_skill_ingestion(payload.mastered_topics)


class JDPayload(BaseModel):
    jd_text: str
    job_title: str = "Software Engineer"
    company_name: str = "Generic"


@router.post("/resume/jd-match")
def match_job_description(payload: JDPayload):
    skills = db.get_skill_nodes()
    return jd_matcher.decompose_and_match(
        jd_text=payload.jd_text,
        candidate_skills=skills,
        job_title=payload.job_title,
        company=payload.company_name
    )


# ==========================================
# 6. MOCK INTERVIEW & ADVERSARIAL COACH
# ==========================================

@router.get("/interview/eligibility")
def check_interview_eligibility():
    skills = db.get_skill_nodes()
    return gate_evaluator.evaluate_readiness(skills)


class InterviewTurnPayload(BaseModel):
    stage: InterviewRoundStage = InterviewRoundStage.CS_CORE
    question: str
    candidate_answer: str
    resume_text: Optional[str] = None
    duration_seconds: float = 30.0
    turn_number: int = 1
    topic: str = "General"


@router.post("/interview/turn")
def execute_interview_turn(payload: InterviewTurnPayload):
    turn_res = interview_panel.process_turn(
        stage=payload.stage,
        current_question=payload.question,
        candidate_answer=payload.candidate_answer,
        resume_text=payload.resume_text,
        duration_seconds=payload.duration_seconds,
        turn_number=payload.turn_number,
        topic=payload.topic
    )

    # If round completes, update Interview Score and compute PTG for the topic
    if turn_res.is_round_complete:
        skills = db.get_skill_nodes()
        matched = next((s for s in skills if s.name.lower() in payload.topic.lower() or payload.topic.lower() in s.name.lower()), None)
        if matched:
            matched.interview_score = turn_res.shadow_critic_evaluation.overall_normalized
            matched.ptg = ptg_engine.calculate_ptg(matched.practice_score, matched.interview_score)
            db.save_skill_nodes(skills)

            # Record PTG Audit Log if gap detected
            if matched.ptg and matched.ptg > 0.25:
                db.record_audit_log(AuditLog(
                    id=f"audit_ptg_{matched.id}",
                    day_number=db.get_profile().current_day,
                    event_type="ptg_alert",
                    topic=matched.name,
                    change_description=f"High PTG Alert: {matched.ptg:.2f} detected after Mock Interview",
                    rationale=f"Practice Score is {matched.practice_score:.2f} vs Interview Score {matched.interview_score:.2f}. Scheduled Red Team adversary training.",
                    new_value=f"PTG {matched.ptg:.2f}"
                ))

    return turn_res


# ==========================================
# 7. FREEMIUM COMPANY HUB
# ==========================================

@router.get("/company-hub/{company_id}")
def get_company_prep_track(company_id: str):
    problems = db.get_all_problems()
    comp_lower = company_id.lower()

    # Filter matching company problems
    matched = [p for p in problems if comp_lower in [c.lower() for c in p.companies] or "generic" in [c.lower() for c in p.companies]]
    unlocked_problems = matched[:2]  # Freemium: first 2 problems unlocked

    return {
        "company": company_id.capitalize(),
        "unlocked_preview_problems": unlocked_problems,
        "total_curated_problems_count": 24,
        "gated_premium_tier": {
            "locked_problems_count": 22,
            "bar_raiser_simulation_included": True,
            "leadership_principles_breakdown": True,
            "system_design_deep_dive": True
        },
        "unlocked_mock_interview_rounds": [
            f"15-minute {company_id.capitalize()} Technical Screening Round"
        ]
    }
