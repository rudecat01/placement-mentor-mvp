"""
Pydantic Schemas for Daily Roadmap, Tasks, and Explainability Logs
"""

from typing import Optional, List, Dict, Literal
from pydantic import BaseModel
from .mastery import DifficultyLevel

TaskType = Literal[
    "DSA_SANDBOX",
    "ROLE_RESOURCE",
    "REVISION_DRILL",
    "SOCRATIC_PRACTICE",
    "RED_TEAM_PRESSURE",
    "MOCK_INTERVIEW"
]


class DailyTask(BaseModel):
    id: str
    day_number: int
    topic_id: str
    topic_name: str
    title: str
    description: str
    task_type: TaskType
    estimated_minutes: int
    difficulty: DifficultyLevel
    is_completed: bool = False
    resource_id: Optional[str] = None
    resource_url: Optional[str] = None
    problem_id: Optional[str] = None
    order: int = 1


class ExplainabilityLog(BaseModel):
    topic_id: str
    topic_name: str
    reason: str
    action_taken: str
    trigger_event: str
    timestamp: str


class DailyRoadmap(BaseModel):
    id: str
    user_id: str
    day_number: int
    date: str
    daily_budget_minutes: int = 120
    total_allocated_minutes: int
    tasks: List[DailyTask]
    is_day_completed: bool = False
    explainability_logs: List[ExplainabilityLog] = []
    created_at: str
    completed_at: Optional[str] = None
