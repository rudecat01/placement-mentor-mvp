#
# Practice Score Calculator
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

from typing import List, Dict

try:
    from schemas.mastery import PracticeAttemptEvidence
    from engine.mastery.evidence import EvidenceCalculator
except ImportError:
    from ...schemas.mastery import PracticeAttemptEvidence
    from ..mastery.evidence import EvidenceCalculator


class PracticeScoreCalculator:
    @staticmethod
    def score_single_attempt(evidence: PracticeAttemptEvidence) -> float:
        if not evidence.is_correct:
            factors = EvidenceCalculator.calculate_factors(evidence)
            partial = factors.complexity * 0.15 + factors.time * 0.10
            return round(min(0.35, partial), 4)

        score = 1.00

        # Hint penalty
        hint_penalty = min(evidence.hints_used, 3) * 0.08
        score -= hint_penalty

        # Attempt penalty
        attempt_penalty = max(0, min(evidence.attempt_count - 1, 3)) * 0.07
        score -= attempt_penalty

        # Difficulty adjustment
        if evidence.difficulty == "HARD":
            score += 0.08
        elif evidence.difficulty == "EASY":
            score -= 0.05

        # Complexity adjustment
        if evidence.complexity_match == "POOR":
            score -= 0.10
        elif evidence.complexity_match == "OPTIMAL":
            score += 0.05

        # Time adjustment
        if evidence.time_efficiency == "SLOW":
            score -= 0.08

        return round(max(0.10, min(1.00, score)), 4)

    @staticmethod
    def calculate_topic_practice_score(
        attempts: List[PracticeAttemptEvidence],
        decay_factor: float = 0.85
    ) -> float:
        if not attempts:
            return 0.50

        total_weighted_score = 0.0
        total_weight = 0.0
        current_weight = 1.0

        for attempt in reversed(attempts):
            score = PracticeScoreCalculator.score_single_attempt(attempt)
            total_weighted_score += score * current_weight
            total_weight += current_weight
            current_weight *= decay_factor

        agg = total_weighted_score / total_weight if total_weight > 0 else 0.50
        return round(max(0.00, min(1.00, agg)), 4)

    @staticmethod
    def calculate_overall_practice_score(topic_scores: Dict[str, float]) -> float:
        scores = list(topic_scores.values())
        if not scores:
            return 0.50
        return round(sum(scores) / len(scores), 4)
