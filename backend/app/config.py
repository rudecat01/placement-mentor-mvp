"""Placement Mentor 2.0 - Configuration & Product Policy Constants.

Encapsulates all invariants from the PRD and Workflow:
- BKT Bayesian Knowledge Tracing parameters
- Performance Transfer Gap (PTG) thresholds
- Interview Eligibility Gates
- Fixed Daily Budget limits
- Memory Decay & Spaced Repetition halflives
"""

from pydantic import BaseModel


class BKTConfig(BaseModel):
    p_slip: float = 0.10
    p_guess: float = 0.20
    base_gain: float = 0.12
    max_mastery: float = 1.00
    min_mastery: float = 0.00
    mastery_threshold: float = 0.85
    weak_threshold: float = 0.50


class PTGConfig(BaseModel):
    good_transfer_threshold: float = 0.10
    moderate_transfer_threshold: float = 0.25
    high_transfer_threshold: float = 0.25  # PTG > 0.25 triggers Red Team adversary drills


class InterviewGateConfig(BaseModel):
    immediate_core_avg_mastery: float = 0.75
    immediate_critical_min_mastery: float = 0.60
    immediate_min_practice_score: float = 0.70

    later_core_avg_mastery: float = 0.70
    later_critical_min_mastery: float = 0.55
    later_min_practice_score: float = 0.65


class RoadmapPolicyConfig(BaseModel):
    default_daily_budget_minutes: int = 120
    min_daily_budget_minutes: int = 30
    max_daily_budget_minutes: int = 300
    red_team_drill_minutes: int = 15
    spaced_revision_minutes: int = 20
    new_concept_default_minutes: int = 35


class DecayPolicyConfig(BaseModel):
    weak_halflife_days: float = 3.0
    at_risk_halflife_days: float = 7.0
    stable_halflife_days: float = 14.0
    mastered_halflife_days: float = 30.0


# Instantiate global singletons
BKT_SETTINGS = BKTConfig()
PTG_SETTINGS = PTGConfig()
GATE_SETTINGS = InterviewGateConfig()
ROADMAP_SETTINGS = RoadmapPolicyConfig()
DECAY_SETTINGS = DecayPolicyConfig()
