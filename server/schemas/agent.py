"""
Pydantic Schemas for AI Agents, Socratic Hints, Red Team, and Shadow Critic
"""

from typing import Optional, List, Dict, Literal
from pydantic import BaseModel

HintLevel = Literal[1, 2, 3]


class SocraticHintRequest(BaseModel):
    problem_id: str
    topic_id: str
    current_code: str
    language: str = "python"
    hint_level: HintLevel = 1
    error_message: Optional[str] = None
    failed_test_case: Optional[str] = None


class SocraticHintResponse(BaseModel):
    hint_level: HintLevel
    title: str
    hint_content: str
    conceptual_nudge: str
    pseudo_code_snippet: Optional[str] = None
    recommended_follow_up: Optional[str] = None


class RedTeamPressureScenario(BaseModel):
    scenario_id: str
    topic_id: str
    topic_name: str
    prompt: str
    time_limit_seconds: int = 1500
    adversarial_constraint: str
    edge_cases_to_test: List[str] = []
    follow_up_questions: List[str] = []


class ShadowCriticEvaluation(BaseModel):
    round_id: str
    topic_id: str
    technical_accuracy: float
    communication_clarity: float
    problem_solving_speed: float
    code_quality: float
    composite_interview_score: float
    hidden_critique: str
    identified_weaknesses: List[str] = []
    recommended_probe_questions: List[str] = []
