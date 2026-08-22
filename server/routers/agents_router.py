#
# FastAPI Agents Router — Member 3's AI Agent Gateway
# [OWNED BY MEMBER 3 - AI & AGENTS]
#

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from ..agents.supervisor.supervisor import classify_and_route
from ..agents.blue_team.coaching_guide import get_prerequisite_alert
from ..agents.red_team.pressure_engine import generate_adversarial_challenge
from ..agents.interview.panel_interviewer import conduct_interview_turn
from ..agents.interview.shadow_critic import (
    score_interview_turn,
    check_story_consistency,
)
from ..agents.company_prep.company_filter import (
    generate_company_prep_overlay,
    check_freemium_access,
)

router = APIRouter(prefix="/api/agents", tags=["Agents"])


# ─── Supervisor ──────────────────────────────────────────────────────────────

@router.post("/route")
async def route_request(body: dict[str, Any]) -> dict[str, Any]:
    """Classify intent and route to the correct agent."""
    try:
        result = await classify_and_route(
            user_message=body["message"],
            session_context=body.get("session_context", {}),
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Blue Team ────────────────────────────────────────────────────────────────

@router.post("/notifications/alerts")
async def get_alerts(body: dict[str, Any]) -> dict[str, Any]:
    """Fetch DAG-based prerequisite alerts for a failed topic."""
    try:
        alert = get_prerequisite_alert(
            topic_id=body["topic_id"],
            mastery_map=body.get("mastery_map", {}),
            role=body.get("role", "SDE")
        )
        return {"success": True, "data": alert}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Red Team ─────────────────────────────────────────────────────────────────

@router.post("/challenge")
async def generate_challenge(body: dict[str, Any]) -> dict[str, Any]:
    """Generate an adversarial Red Team pressure challenge."""
    try:
        challenge = await generate_adversarial_challenge(
            problem_statement=body["problem_statement"],
            student_solution_code=body.get("student_solution_code", ""),
            language=body.get("language", "python"),
            current_complexity=body.get("current_complexity", "unknown"),
            topic_id=body.get("topic_id", ""),
            challenge_type=body.get("challenge_type"),
        )
        return {"success": True, "data": challenge}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Interview Panel ──────────────────────────────────────────────────────────

@router.post("/interview/turn")
async def stream_interview_turn(body: dict[str, Any]) -> StreamingResponse:
    """
    Stream one interviewer turn as Server-Sent Events (SSE).
    """
    async def token_generator():
        async for token in conduct_interview_turn(
            stage=body.get("stage", "BEHAVIORAL_LP"),
            conversation_history=body.get("conversation_history", []),
            student_resume_summary=body.get("student_resume_summary", ""),
            dsa_problem=body.get("dsa_problem"),
            target_company=body.get("target_company", "a top tech company"),
            prep_type=body.get("prep_type", "COMPANY"),
            session_id=body.get("session_id", "session_1"),
            success_rate=body.get("success_rate", 0.0),
        ):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(token_generator(), media_type="text/event-stream")


@router.post("/interview/score")
async def score_turn(body: dict[str, Any]) -> dict[str, Any]:
    """
    Shadow Critic silently scores one interview turn.
    """
    try:
        score = await score_interview_turn(
            stage=body["stage"],
            candidate_response=body["candidate_response"],
            interviewer_question=body["interviewer_question"],
            submitted_code=body.get("submitted_code"),
            speech_metrics=body.get("speech_metrics"),
        )
        return {"success": True, "data": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interview/story-check")
async def story_check(body: dict[str, Any]) -> dict[str, Any]:
    """Cross-examine a verbal claim against the student's resume."""
    try:
        result = await check_story_consistency(
            spoken_statement=body["spoken_statement"],
            resume_summary=body["resume_summary"],
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Company Prep ─────────────────────────────────────────────────────────────

@router.post("/company/overlay")
async def company_overlay(body: dict[str, Any]) -> dict[str, Any]:
    """Generate company-specific prep overlay with topic weights and tips."""
    try:
        overlay = await generate_company_prep_overlay(
            company_name=body["company_name"],
            target_role=body.get("target_role", "SDE"),
            skill_graph_topics=body.get("skill_graph_topics", []),
        )
        return {"success": True, "data": overlay}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/company/access")
async def check_access(
    company: str,
    user_tier: str = "free",
    questions_today: int = 0,
    mocks_today: int = 0,
) -> dict[str, Any]:
    """Check freemium access for a company track."""
    result = check_freemium_access(
        user_tier=user_tier,
        company_name=company,
        questions_accessed_today=questions_today,
        mocks_accessed_today=mocks_today,
    )
    return {"success": True, "data": result}
