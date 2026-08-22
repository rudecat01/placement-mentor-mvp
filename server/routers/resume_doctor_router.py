"""
Placement Mentor 2.0 - Resume Doctor Router
[OWNED BY MEMBER 1 & MEMBER 3 - AI & INGESTION ARCHITECTURE]

Endpoints:
- POST /api/resume/diagnose -> Deep ATS, Company Track & JD Match Diagnostic with Google X-Y-Z rewrites
- POST /api/resume/rewrite-bullet -> Dynamic 3-style AI bullet optimizer with validation placeholders
- POST /api/resume/parse-jd -> Job Description structured requirements extractor
- POST /api/resume/resource-completed-suggestions -> Generates resume bullets from completed resource/topic
- GET  /api/resume/completed-resource-suggestions -> Retrieves all pending bullet suggestions from mastered topics
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query  # type: ignore
from pydantic import BaseModel  # type: ignore

try:
    from ..agents.resume_doctor.resume_doctor_agent import resume_doctor_agent
    from ..services.student_state.student_state_service import student_state_service
    from ..db.database import db
except (ImportError, ValueError):
    from agents.resume_doctor.resume_doctor_agent import resume_doctor_agent
    from services.student_state.student_state_service import student_state_service
    from db.database import db

router = APIRouter(prefix="/api/resume", tags=["Resume Doctor"])
resume_compat_router = APIRouter(prefix="/resume", tags=["Resume Doctor Compat"])


class ResumeDiagnosePayload(BaseModel):
    resume_content: Optional[str] = ""
    job_description: Optional[str] = ""
    target_role: Optional[str] = "SDE"
    target_company: Optional[str] = "Google"
    user_id: Optional[str] = "usr_demo123"


class BulletRewritePayload(BaseModel):
    bullet_text: str
    target_role: Optional[str] = "SDE"
    style: Optional[str] = "METRIC_HEAVY"


class JDParsingPayload(BaseModel):
    jd_text: str


class ResourceCompletionPayload(BaseModel):
    topic_id: str
    resource_id: Optional[str] = None
    target_role: Optional[str] = "SDE"
    user_id: Optional[str] = "usr_demo123"


@router.post("/diagnose")
async def diagnose_resume(payload: ResumeDiagnosePayload) -> Dict[str, Any]:
    """
    Executes full Resume Doctor diagnostic pipeline with Company-Specific Bar calibration
    and dynamic suggestions from completed competencies.
    """
    resume_content = payload.resume_content or ""
    user_id = payload.user_id or "usr_demo123"

    # If no resume content provided in payload, fetch from student state telemetry
    if not resume_content.strip():
        state = student_state_service.get_state(user_id)
        if state and state.telemetry and state.telemetry.resume_signals:
            resume_content = state.telemetry.resume_signals.full_text or state.telemetry.resume_signals.raw_summary or ""

    if not resume_content.strip():
        resume_content = "Skills: Python, TypeScript, React, Docker, SQL. Project: Distributed Rate Limiter with Redis."

    # Run AI Diagnostic with Company Track
    diagnosis = await resume_doctor_agent.diagnose_resume(
        resume_content=resume_content,
        job_description=payload.job_description,
        target_role=payload.target_role or "SDE",
        target_company=payload.target_company or "Google"
    )

    # Check for mastered topics to augment dynamic resource suggestions
    try:
        state = student_state_service.get_state(user_id)
        if state:
            # Look at topics with mastery >= 0.50
            mastered = [tid for tid, tstate in state.topic_states.items() if (tstate.mastery or 0) >= 0.50]
            existing_suggs = diagnosis.get("resource_bullet_suggestions", [])
            for top in mastered[:3]:
                more_suggs = resume_doctor_agent.generate_resource_bullet_suggestions(top, payload.target_role or "SDE")
                for s in more_suggs:
                    if not any(e.get("suggested_bullet") == s.get("suggested_bullet") for e in existing_suggs):
                        existing_suggs.append(s)
            diagnosis["resource_bullet_suggestions"] = existing_suggs

            # Persist updated ATS score to student state
            if state.telemetry and state.telemetry.resume_signals:
                ats = diagnosis.get("scores", {}).get("ats_score", 85)
                state.telemetry.resume_signals.ats_score = ats
                db.save_student_state(state)
    except Exception:
        pass

    return diagnosis


@router.post("/rewrite-bullet")
async def rewrite_bullet(payload: BulletRewritePayload) -> Dict[str, Any]:
    """
    Transforms a weak bullet point into 3 high-impact Google X-Y-Z formula variations
    with strict metric anti-hallucination validation placeholders.
    """
    if not payload.bullet_text.strip():
        raise HTTPException(status_code=400, detail="Bullet text cannot be empty.")

    rewrites = await resume_doctor_agent.rewrite_bullet_custom(
        bullet_text=payload.bullet_text,
        target_role=payload.target_role or "SDE",
        style=payload.style or "METRIC_HEAVY"
    )
    return {"success": True, "data": rewrites}


@router.post("/parse-jd")
async def parse_job_description(payload: JDParsingPayload) -> Dict[str, Any]:
    """
    Extracts structured technical requirements and keywords from a target Job Description.
    """
    if not payload.jd_text.strip():
        raise HTTPException(status_code=400, detail="Job description text cannot be empty.")

    structured_jd = await resume_doctor_agent.parse_job_description(payload.jd_text)
    return {"success": True, "data": structured_jd}


@router.post("/resource-completed-suggestions")
def generate_completed_resource_suggestions(payload: ResourceCompletionPayload) -> Dict[str, Any]:
    """
    Dynamically generates resume-ready Google X-Y-Z bullet suggestions upon completion of a resource/topic.
    """
    if not payload.topic_id.strip():
        raise HTTPException(status_code=400, detail="Topic ID cannot be empty.")

    suggestions = resume_doctor_agent.generate_resource_bullet_suggestions(
        topic_or_resource_id=payload.resource_id or payload.topic_id,
        target_role=payload.target_role or "SDE"
    )
    return {
        "success": True,
        "topic_id": payload.topic_id,
        "count": len(suggestions),
        "suggestions": suggestions
    }


@router.get("/completed-resource-suggestions")
def get_user_completed_resource_suggestions(
    user_id: str = Query("usr_demo123"),
    target_role: str = Query("SDE")
) -> Dict[str, Any]:
    """
    Fetches dynamic resume bullet suggestions based on the user's completed tasks and mastered topics.
    """
    state = student_state_service.get_state(user_id)
    all_suggestions = []

    if state and state.topic_states:
        for tid, tstate in state.topic_states.items():
            if (tstate.mastery or 0) >= 0.50:
                suggs = resume_doctor_agent.generate_resource_bullet_suggestions(tid, target_role)
                for s in suggs:
                    if not any(e.get("suggested_bullet") == s.get("suggested_bullet") for e in all_suggestions):
                        all_suggestions.append(s)

    # If no topics mastered yet, provide foundational suggestions for target role
    if not all_suggestions:
        all_suggestions = resume_doctor_agent.generate_resource_bullet_suggestions(target_role, target_role)

    return {
        "success": True,
        "user_id": user_id,
        "count": len(all_suggestions),
        "suggestions": all_suggestions
    }


# Register routes for both /api/resume and /resume prefixes
resume_compat_router.add_api_route("/diagnose", diagnose_resume, methods=["POST"])
resume_compat_router.add_api_route("/rewrite-bullet", rewrite_bullet, methods=["POST"])
resume_compat_router.add_api_route("/parse-jd", parse_job_description, methods=["POST"])
resume_compat_router.add_api_route("/resource-completed-suggestions", generate_completed_resource_suggestions, methods=["POST"])
resume_compat_router.add_api_route("/completed-resource-suggestions", get_user_completed_resource_suggestions, methods=["GET"])
