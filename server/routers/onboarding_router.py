"""
Placement Mentor 2.0 - Multi-Source Onboarding Ingestion Router
[OWNED BY MEMBER 1 - DB & USER STATE ARCHITECT]
"""

from typing import Optional, Dict
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..db.models import UserRecord
from ..schemas.student import (
    OnboardingSubmissionPayload,
    StudentState,
    ResumeSignals,
    GitHubSignals,
    LeetCodeSignals,
)
from ..services.auth.auth_middleware import get_current_user
from ..services.student_state.student_state_service import student_state_service
from ..services.ingestion.resume_parser import resume_parser
from ..services.ingestion.github_fetcher import github_fetcher
from ..services.ingestion.leetcode_fetcher import leetcode_fetcher

router = APIRouter(prefix="/api/onboarding", tags=["Onboarding"])
onboarding_compat_router = APIRouter(prefix="/onboarding", tags=["Onboarding Compat"])


@router.post("/submit", response_model=StudentState)
async def submit_onboarding(
    payload: OnboardingSubmissionPayload,
    user: UserRecord = Depends(get_current_user)
):
    """
    Primary Onboarding Endpoint:
    Consumes Resume, GitHub, LeetCode, and Self-Assessment signals,
    initializes DAG topic masteries, computes initial Practice Score,
    and returns initialized StudentState.
    """
    try:
        state = await student_state_service.process_onboarding(payload, user_id=user.id)
        return state
    except Exception as e:
        print(f"[OnboardingRouter] Error in submit_onboarding: {e}")
        raise HTTPException(status_code=500, detail=f"Onboarding pipeline failed: {str(e)}")


class ResumeParsePayload(BaseModel):
    resume_text: str
    target_role: str = "SDE"


@router.post("/parse-resume", response_model=ResumeSignals)
async def parse_resume_standalone(payload: ResumeParsePayload):
    """Standalone resume parsing endpoint for instant UI preview and ATS analysis."""
    if not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    return await resume_parser.parse_text(payload.resume_text, payload.target_role)


class GitHubFetchPayload(BaseModel):
    github_username: str


@router.post("/fetch-github", response_model=GitHubSignals)
@onboarding_compat_router.post("/fetch-github", response_model=GitHubSignals)
def fetch_github_standalone(payload: GitHubFetchPayload):
    """Standalone GitHub telemetry extractor."""
    if not payload.github_username.strip():
        raise HTTPException(status_code=400, detail="GitHub username cannot be empty.")
    return github_fetcher.fetch_signals(payload.github_username)


class LeetCodeFetchPayload(BaseModel):
    leetcode_username: str


@router.post("/fetch-leetcode", response_model=LeetCodeSignals)
@onboarding_compat_router.post("/fetch-leetcode", response_model=LeetCodeSignals)
def fetch_leetcode_standalone(payload: LeetCodeFetchPayload):
    """Standalone LeetCode statistics collector."""
    if not payload.leetcode_username.strip():
        raise HTTPException(status_code=400, detail="LeetCode username cannot be empty.")
    return leetcode_fetcher.fetch_signals(payload.leetcode_username)
