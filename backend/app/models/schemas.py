"""Placement Mentor 2.0 - Core Domain Models & Schemas.

Strictly incorporates:
1. Exact User Problem Bank schema.
2. Student Profile & Multi-Source Initial State (Resume, GitHub, LeetCode, Sliders).
3. Skill Graph Node & DAG state with BKT mastery, practice score, interview score, PTG.
4. Daily Task & Roadmap schemas with strict fixed budget invariants.
5. Telemetry & Execution Evidence models.
6. Audit Logs for explainable 'Why This Moved' decisions.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# 1. USER'S EXACT QUESTION BANK SCHEMA
# -------------------------------------------------------------

class ExpectedComplexity(BaseModel):
    time: str = "O(n)"
    space: str = "O(1)"


class TestCaseItem(BaseModel):
    input: Any
    output: Any
    explanation: Optional[str] = None


class Problem(BaseModel):
    id: str
    title: str
    topic: str
    subtopics: List[str] = Field(default_factory=list)
    difficulty: int = 2  # 1: Easy, 2: Medium, 3: Hard, 4: Advanced
    estimated_minutes: int = 30
    prerequisites: List[str] = Field(default_factory=list)
    roles: List[str] = Field(default_factory=lambda: ["SDE"])
    companies: List[str] = Field(default_factory=lambda: ["generic"])
    statement: str
    starter_code: Dict[str, str] = Field(default_factory=dict)
    visible_tests: List[TestCaseItem] = Field(default_factory=list)
    hidden_tests: List[TestCaseItem] = Field(default_factory=list)
    hints: Dict[str, str] = Field(default_factory=dict)  # "1", "2", "3"
    reference_solution: Dict[str, str] = Field(default_factory=dict)
    expected_complexity: ExpectedComplexity = Field(default_factory=ExpectedComplexity)


# -------------------------------------------------------------
# 2. STUDENT PROFILE & MULTI-SOURCE ONBOARDING
# -------------------------------------------------------------

class StudentProfile(BaseModel):
    id: str = "student_001"
    full_name: str = "Aryan Sharma"
    target_role: str = "Software Development Engineer"
    daily_time_budget_minutes: int = 120  # Strict invariant
    preparation_duration_days: int = 45
    current_day: int = 1
    resume_text: Optional[str] = None
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None
    self_assessment_sliders: Dict[str, float] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# -------------------------------------------------------------
# 3. SKILL GRAPH DAG & BKT MASTERY
# -------------------------------------------------------------

class MemoryDecayState(str, Enum):
    WEAK = "Weak"
    AT_RISK = "At Risk"
    STABLE = "Stable"
    MASTERED = "Mastered"


class SkillNode(BaseModel):
    id: str
    name: str
    category: str  # "dsa", "core_cs", "development"
    prerequisites: List[str] = Field(default_factory=list)
    mastery: float = 0.50  # BKT Mastery [0.0, 1.0]
    practice_score: float = 0.50  # [0.0, 1.0]
    interview_score: Optional[float] = None  # [0.0, 1.0]
    ptg: Optional[float] = None  # Practice Score - Interview Score
    last_practiced_at: Optional[datetime] = None
    stability_days: float = 3.0
    decay_state: MemoryDecayState = MemoryDecayState.WEAK
    is_critical_for_role: bool = False


# -------------------------------------------------------------
# 4. ROADMAP & DAILY TASKS (Strict Fixed Budget)
# -------------------------------------------------------------

class TaskType(str, Enum):
    NEW_CONCEPT = "new_concept"
    DEEP_PRACTICE = "deep_practice"
    SPACED_REVISION = "spaced_revision"
    RED_TEAM_PRESSURE = "red_team_pressure"
    BLUE_TEAM_THINK_ALOUD = "blue_team_think_aloud"
    MOCK_INTERVIEW_PREP = "mock_interview_prep"
    RESUME_OPTIMIZATION = "resume_optimization"


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class RoadmapTask(BaseModel):
    id: str
    day_number: int
    title: str
    topic: str
    task_type: TaskType
    estimated_minutes: int
    problem_id: Optional[str] = None
    why_selected: str
    status: TaskStatus = TaskStatus.PENDING
    completed_at: Optional[datetime] = None


class DailyPlan(BaseModel):
    id: str
    day_number: int
    target_budget_minutes: int  # e.g., 120
    total_allocated_minutes: int  # Must match target_budget_minutes
    tasks: List[RoadmapTask] = Field(default_factory=list)
    is_completed: bool = False
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# -------------------------------------------------------------
# 5. TELEMETRY & EXECUTION VERDICTS
# -------------------------------------------------------------

class ComplexityVerdict(BaseModel):
    passed_tests: int
    total_tests: int
    verdict: str  # "Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error"
    execution_time_ms: float
    peak_memory_mb: float
    failed_input: Optional[Any] = None
    expected_output: Optional[Any] = None
    actual_output: Optional[Any] = None
    compiler_error: Optional[str] = None


class AttemptEvidence(BaseModel):
    id: str
    problem_id: str
    topic: str
    submitted_code: str
    language: str
    verdict: str
    difficulty: int
    attempts_count: int = 1
    hints_requested: int = 0
    time_spent_seconds: float = 0.0
    estimated_seconds: float = 1800.0
    execution_time_ms: float = 0.0
    execution_memory_mb: float = 0.0
    test_cases_passed: int = 0
    test_cases_total: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


# -------------------------------------------------------------
# 6. INTERVIEW & SHADOW CRITIC SCHEMAS
# -------------------------------------------------------------

class InterviewRoundStage(str, Enum):
    CS_CORE = "cs_core"
    BEHAVIORAL = "behavioral"
    LIVE_DSA = "live_dsa"
    RESUME_DEEP_DIVE = "resume_deep_dive"
    HR_FIT = "hr_fit"


class ShadowCriticScorecard(BaseModel):
    technical_accuracy: float = 8.0  # 0 to 10
    problem_solving_depth: float = 7.5  # 0 to 10
    communication_clarity: float = 8.0  # 0 to 10
    confidence_presence: float = 8.0  # 0 to 10
    hidden_critic_notes: str
    suggested_follow_up_prompt: Optional[str] = None
    overall_normalized: float = 0.79  # 0.0 to 1.0


class SpeechDeliveryBiometrics(BaseModel):
    words_per_minute: int = 135
    filler_words_count: int = 0
    confidence_score: float = 0.90
    pacing_verdict: str = "Optimal pacing (120-160 WPM)"


class ContradictionAlert(BaseModel):
    contradiction_type: str
    spoken_snippet: str
    claimed_on_resume: str
    severity: str = "High"


class InterviewTurnResult(BaseModel):
    stage: InterviewRoundStage
    interviewer_dialogue: str
    shadow_critic_evaluation: ShadowCriticScorecard
    speech_biometrics: SpeechDeliveryBiometrics
    contradiction_flag: Optional[ContradictionAlert] = None
    is_round_complete: bool = False


# -------------------------------------------------------------
# 7. AUDIT LOG (Why This Moved)
# -------------------------------------------------------------

class AuditLog(BaseModel):
    id: str
    day_number: int
    event_type: str  # "replan", "bkt_update", "ptg_alert", "decay_drift"
    topic: str
    trigger_attempt_id: Optional[str] = None
    change_description: str
    rationale: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
