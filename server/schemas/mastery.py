"""
Pydantic Schemas for Mastery, BKT, Scores, PTG, and Gate Evaluation
"""

from typing import Optional, List, Dict, Literal
from pydantic import BaseModel, Field

DifficultyLevel = Literal["EASY", "MEDIUM", "HARD"]
ComplexityMatch = Literal["OPTIMAL", "ACCEPTABLE", "POOR"]
TimeEfficiency = Literal["OPTIMAL", "ACCEPTABLE", "SLOW"]
PTGSeverity = Literal["GOOD_TRANSFER", "MODERATE_GAP", "HIGH_GAP"]
InterventionType = Literal[
    "STANDARD_PROGRESSION",
    "TARGETED_PRACTICE",
    "RED_TEAM_PRESSURE",
    "BLUE_TEAM_SOCRATIC",
    "FOUNDATIONAL_REPAIR"
]
GateStatus = Literal["IMMEDIATE_UNLOCK", "LATER_UNLOCK", "GATED"]


class MultiplierFactors(BaseModel):
    difficulty: float
    attempts: float
    hints: float
    complexity: float
    time: float


class PracticeAttemptEvidence(BaseModel):
    topic_id: str
    is_correct: bool
    difficulty: DifficultyLevel = "MEDIUM"
    attempt_count: int = 1
    hints_used: int = 0
    complexity_match: Optional[ComplexityMatch] = "OPTIMAL"
    time_efficiency: Optional[TimeEfficiency] = "OPTIMAL"
    execution_time_ms: Optional[int] = None
    target_time_ms: Optional[int] = None
    notes: Optional[str] = None


class BKTParameters(BaseModel):
    slip: float = 0.10
    guess: float = 0.20
    base_gain_scale: float = 0.12
    incorrect_multiplier_loss: float = 0.08
    incorrect_posterior_loss: float = 0.02


class BKTUpdateResult(BaseModel):
    topic_id: str
    previous_mastery: float
    p_correct: float
    posterior: float
    multipliers: MultiplierFactors
    evidence_multiplier: float
    base_gain: float
    new_mastery: float
    delta: float
    is_correct: bool
    calculated_at: str


class PTGEvaluation(BaseModel):
    topic_id: str
    topic_name: str
    practice_score: float
    interview_score: float
    ptg: float
    severity: PTGSeverity
    intervention_type: InterventionType
    recommendation: str
    actionable_drill: str


class LowestTopicInfo(BaseModel):
    topic_id: str
    topic_name: str
    mastery: float


class GateEvaluationResult(BaseModel):
    status: GateStatus
    is_unlocked: bool
    role_core_average: float
    min_topic_mastery: float
    lowest_topic: LowestTopicInfo
    practice_score: float
    passed_immediate_criteria: bool
    passed_later_criteria: bool
    missing_criteria: List[str]
    recommendations: List[str]
    evaluated_at: str


class TopicMasteryState(BaseModel):
    topic_id: str
    topic_name: str
    mastery: float = 0.30
    practice_score: float = 0.50
    interview_score: Optional[float] = None
    ptg: Optional[float] = None
    attempts_count: int = 0
    success_count: int = 0
    last_attempt_at: Optional[str] = None
