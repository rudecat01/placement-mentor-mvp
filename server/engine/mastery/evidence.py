#
# Evidence Multiplier Calculator
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

try:
    from schemas.mastery import PracticeAttemptEvidence, MultiplierFactors
    from engine.mastery.config import (
        DIFFICULTY_MULTIPLIERS,
        ATTEMPT_MULTIPLIERS,
        HINT_MULTIPLIERS,
        COMPLEXITY_MULTIPLIERS,
        TIME_MULTIPLIERS
    )
except ImportError:
    from ...schemas.mastery import PracticeAttemptEvidence, MultiplierFactors
    from .config import (
        DIFFICULTY_MULTIPLIERS,
        ATTEMPT_MULTIPLIERS,
        HINT_MULTIPLIERS,
        COMPLEXITY_MULTIPLIERS,
        TIME_MULTIPLIERS
    )


class EvidenceCalculator:
    @staticmethod
    def calculate_factors(evidence: PracticeAttemptEvidence) -> MultiplierFactors:
        # 1. Difficulty
        diff_mult = DIFFICULTY_MULTIPLIERS.get(evidence.difficulty, 1.00)

        # 2. Attempts (1 -> 1.00, 2 -> 0.90, 3 -> 0.80, 4+ -> 0.70)
        if evidence.attempt_count <= 1:
            att_mult = ATTEMPT_MULTIPLIERS[1]
        elif evidence.attempt_count == 2:
            att_mult = ATTEMPT_MULTIPLIERS[2]
        elif evidence.attempt_count == 3:
            att_mult = ATTEMPT_MULTIPLIERS[3]
        else:
            att_mult = ATTEMPT_MULTIPLIERS[4]

        # 3. Hints (0 -> 1.00, 1 -> 0.92, 2 -> 0.84, 3+ -> 0.76)
        if evidence.hints_used <= 0:
            hints_mult = HINT_MULTIPLIERS[0]
        elif evidence.hints_used == 1:
            hints_mult = HINT_MULTIPLIERS[1]
        elif evidence.hints_used == 2:
            hints_mult = HINT_MULTIPLIERS[2]
        else:
            hints_mult = HINT_MULTIPLIERS[3]

        # 4. Complexity
        comp_mult = COMPLEXITY_MULTIPLIERS.get(evidence.complexity_match or "OPTIMAL", 1.00)

        # 5. Time
        time_mult = 1.00
        if evidence.time_efficiency:
            time_mult = TIME_MULTIPLIERS.get(evidence.time_efficiency, 1.00)
        elif evidence.execution_time_ms and evidence.target_time_ms and evidence.target_time_ms > 0:
            ratio = evidence.execution_time_ms / evidence.target_time_ms
            if ratio <= 1.00:
                time_mult = TIME_MULTIPLIERS["OPTIMAL"]
            elif ratio <= 1.50:
                time_mult = TIME_MULTIPLIERS["ACCEPTABLE"]
            else:
                time_mult = TIME_MULTIPLIERS["SLOW"]

        return MultiplierFactors(
            difficulty=diff_mult,
            attempts=att_mult,
            hints=hints_mult,
            complexity=comp_mult,
            time=time_mult
        )

    @staticmethod
    def calculate_composite_multiplier(factors: MultiplierFactors) -> float:
        raw = factors.difficulty * factors.attempts * factors.hints * factors.complexity * factors.time
        return round(raw, 4)
