"""
Placement Mentor 2.0 - Student Profile & Persistent State Router
[OWNED BY MEMBER 1 - DB & USER STATE ARCHITECT]
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..db.database import db
from ..db.models import UserRecord
from ..schemas.student import (
    StudentProfile,
    StudentState,
    MultiSourceTelemetry,
)
from ..services.auth.auth_middleware import get_current_user
from ..services.student_state.student_state_service import student_state_service

router = APIRouter(prefix="/api/student", tags=["Student State"])


@router.get("/profile", response_model=StudentProfile)
def get_student_profile(user: UserRecord = Depends(get_current_user)):
    """Retrieves the current student profile."""
    profile = student_state_service.get_profile(user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    return profile


class ProfileUpdatePayload(BaseModel):
    name: Optional[str] = None
    target_role: Optional[str] = None
    target_companies: Optional[List[str]] = None
    daily_time_budget_minutes: Optional[int] = None
    target_deadline_days: Optional[int] = None
    preferred_language: Optional[str] = None


@router.put("/profile", response_model=StudentProfile)
def update_student_profile(
    payload: ProfileUpdatePayload,
    user: UserRecord = Depends(get_current_user)
):
    """Updates student preferences, daily time budget, or target role."""
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = student_state_service.update_profile(user.id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    return updated


@router.get("/state", response_model=StudentState)
def get_full_student_state(user: UserRecord = Depends(get_current_user)):
    """Retrieves full persistent state: profile, telemetry, topic masteries, and scores."""
    state = student_state_service.get_state(user.id)
    if not state:
        raise HTTPException(status_code=404, detail="Student state not initialized. Please complete onboarding.")
    return state


@router.get("/telemetry", response_model=MultiSourceTelemetry)
def get_student_telemetry(user: UserRecord = Depends(get_current_user)):
    """Retrieves raw multi-source telemetry signals."""
    telemetry = student_state_service.get_telemetry(user.id)
    if not telemetry:
        raise HTTPException(status_code=404, detail="Telemetry not found.")
    return telemetry


@router.get("/audit-logs")
def get_student_audit_logs(user: UserRecord = Depends(get_current_user)):
    """Retrieves the explainability and audit trail logs for the student."""
    return db.get_audit_logs(user.id)


@router.get("/attempts")
def get_student_practice_attempts(user: UserRecord = Depends(get_current_user)):
    """Retrieves practice submission history and evidence logs."""
    return db.get_attempts(user.id)
