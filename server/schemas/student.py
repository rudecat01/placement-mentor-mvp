"""
Pydantic Schemas for Student Profile and Telemetry State
"""

from typing import Optional, List, Dict, Literal, Any
from pydantic import BaseModel, Field
from .skill_graph import RoleType
from .mastery import TopicMasteryState

ExperienceLevel = Literal["FRESHER", "INTERMEDIATE", "EXPERIENCED"]


class StudentProfile(BaseModel):
    id: str
    email: str
    name: str
    target_role: RoleType = "SDE"
    target_companies: List[str] = []
    target_deadline_days: int = 45
    daily_time_budget_minutes: int = 120
    experience_level: ExperienceLevel = "FRESHER"
    preferred_language: Literal["python", "javascript", "typescript", "cpp", "java"] = "python"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ResumeSignals(BaseModel):
    extracted_skills: List[str] = []
    extracted_projects: List[str] = []
    ats_score: Optional[float] = None
    experience_years: float = 0.0
    education: Optional[str] = None
    detected_keywords: List[str] = []
    missing_keywords: List[str] = []
    raw_summary: Optional[str] = None
    full_text: Optional[str] = ""


class GitHubSignals(BaseModel):
    username: str
    top_languages: Dict[str, int] = {}
    public_repos_count: int = 0
    recent_commit_velocity: float = 0.0
    primary_stack: Optional[str] = None
    total_stars: int = 0


class LeetCodeSignals(BaseModel):
    username: str
    total_solved: int = 0
    easy_solved: int = 0
    medium_solved: int = 0
    hard_solved: int = 0
    contest_rating: Optional[float] = None
    ranking: Optional[int] = None
    acceptance_rate: Optional[float] = None


class MultiSourceTelemetry(BaseModel):
    resume_signals: Optional[ResumeSignals] = None
    github_signals: Optional[GitHubSignals] = None
    leetcode_signals: Optional[LeetCodeSignals] = None
    self_assessment: Optional[Dict[str, float]] = None


class StudentState(BaseModel):
    profile: StudentProfile
    telemetry: MultiSourceTelemetry
    topic_states: Dict[str, TopicMasteryState] = {}
    overall_practice_score: float = 0.50
    overall_interview_score: Optional[float] = None
    overall_ptg: Optional[float] = None
    completed_days: int = 0
    remaining_days: int = 45
    is_interview_eligible: bool = False
    active_roadmap_id: Optional[str] = None
    last_checkpoint_at: Optional[str] = None


# Onboarding & Auth payload schemas for Member 1
class OnboardingSubmissionPayload(BaseModel):
    full_name: str
    email: str
    target_role: RoleType = "SDE"
    target_companies: List[str] = []
    daily_time_budget_minutes: int = 120
    target_deadline_days: int = 45
    preferred_language: Literal["python", "javascript", "typescript", "cpp", "java"] = "python"
    resume_text: Optional[str] = None
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None
    self_assessment_sliders: Dict[str, float] = {}


class UserRegisterPayload(BaseModel):
    email: str
    password: str
    name: str


class UserLoginPayload(BaseModel):
    email: str
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    name: str
