#
# BKT Configuration and Multiplier Constants
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

from typing import Dict

try:
    from schemas.mastery import BKTParameters, DifficultyLevel, ComplexityMatch, TimeEfficiency
except ImportError:
    from ...schemas.mastery import BKTParameters, DifficultyLevel, ComplexityMatch, TimeEfficiency

DEFAULT_BKT_PARAMS = BKTParameters(
    slip=0.10,
    guess=0.20,
    base_gain_scale=0.12,
    incorrect_multiplier_loss=0.08,
    incorrect_posterior_loss=0.02
)

DIFFICULTY_MULTIPLIERS: Dict[str, float] = {
    "EASY": 0.80,
    "MEDIUM": 1.00,
    "HARD": 1.20
}

ATTEMPT_MULTIPLIERS: Dict[int, float] = {
    1: 1.00,
    2: 0.90,
    3: 0.80,
    4: 0.70  # 4+ attempts
}

HINT_MULTIPLIERS: Dict[int, float] = {
    0: 1.00,
    1: 0.92,
    2: 0.84,
    3: 0.76  # 3+ hints
}

COMPLEXITY_MULTIPLIERS: Dict[str, float] = {
    "OPTIMAL": 1.00,
    "ACCEPTABLE": 0.90,
    "POOR": 0.75
}

TIME_MULTIPLIERS: Dict[str, float] = {
    "OPTIMAL": 1.00,
    "ACCEPTABLE": 0.90,
    "SLOW": 0.80
}

GATE_THRESHOLDS = {
    "IMMEDIATE": {
        "ROLE_CORE_AVERAGE_MIN": 0.75,
        "CRITICAL_TOPIC_MIN": 0.60,
        "PRACTICE_SCORE_MIN": 0.70
    },
    "LATER": {
        "ROLE_CORE_AVERAGE_MIN": 0.70,
        "CRITICAL_TOPIC_MIN": 0.55,
        "PRACTICE_SCORE_MIN": 0.65
    }
}

PTG_THRESHOLDS = {
    "GOOD_TRANSFER_MAX": 0.10,
    "MODERATE_GAP_MAX": 0.25
}

DAG_THRESHOLDS = {
    "PREREQUISITE_UNLOCK_MASTERY": 0.70,
    "ROOT_CAUSE_BOTTLENECK_MASTERY": 0.65
}


def clamp_mastery(value: float) -> float:
    if value is None or value != value:  # NaN check
        return 0.30
    return max(0.00, min(1.00, round(value, 4)))
