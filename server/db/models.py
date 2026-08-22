"""
Database Record Models for Placement Mentor 2.0
[OWNED BY MEMBER 1 - DB & USER STATE ARCHITECT]
"""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
import time
import uuid


class UserRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"usr_{uuid.uuid4().hex[:10]}")
    email: str
    password_hash: str
    name: str
    is_active: bool = True
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)


class AuditLogRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"aud_{uuid.uuid4().hex[:10]}")
    user_id: str
    day_number: int
    event_type: str  # "mastery_update", "replan", "ptg_alert", "gate_unlock", "onboarding"
    topic: Optional[str] = None
    change_description: str
    rationale: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    timestamp: float = Field(default_factory=time.time)


class PracticeAttemptRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"att_{uuid.uuid4().hex[:10]}")
    user_id: str
    topic_id: str
    topic_name: str
    problem_id: Optional[str] = None
    submitted_code: str
    language: str = "python"
    is_correct: bool
    verdict: str  # "ACCEPTED", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "RUNTIME_ERROR"
    difficulty: str = "MEDIUM"
    attempt_count: int = 1
    hints_used: int = 0
    execution_time_ms: Optional[int] = None
    peak_memory_mb: Optional[float] = None
    test_cases_passed: int = 0
    test_cases_total: int = 0
    created_at: float = Field(default_factory=time.time)


class InterviewSessionRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"intv_{uuid.uuid4().hex[:10]}")
    user_id: str
    stage: str  # "CS_CORE", "SYSTEM_DESIGN", "BEHAVIORAL", "DSA_THINK_ALOUD"
    topic: str
    turns: List[Dict[str, Any]] = []
    final_score: Optional[float] = None
    shadow_critic_summary: Optional[Dict[str, Any]] = None
    contradiction_detected: bool = False
    is_completed: bool = False
    created_at: float = Field(default_factory=time.time)
    completed_at: Optional[float] = None
