#
# Interview Score Calculator
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

from typing import List, Optional

try:
    from schemas.agent import ShadowCriticEvaluation
except ImportError:
    from ...schemas.agent import ShadowCriticEvaluation


class InterviewScoreCalculator:
    WEIGHTS = {
        "TECHNICAL": 0.40,
        "COMMUNICATION": 0.25,
        "SPEED": 0.20,
        "CODE_QUALITY": 0.15
    }

    @staticmethod
    def calculate_round_score(
        technical_accuracy: float,
        communication_clarity: float,
        problem_solving_speed: float,
        code_quality: float
    ) -> float:
        raw = (
            technical_accuracy * InterviewScoreCalculator.WEIGHTS["TECHNICAL"]
            + communication_clarity * InterviewScoreCalculator.WEIGHTS["COMMUNICATION"]
            + problem_solving_speed * InterviewScoreCalculator.WEIGHTS["SPEED"]
            + code_quality * InterviewScoreCalculator.WEIGHTS["CODE_QUALITY"]
        )
        return round(max(0.00, min(1.00, raw)), 4)

    @staticmethod
    def from_shadow_critic(critic_eval: ShadowCriticEvaluation) -> float:
        if critic_eval.composite_interview_score is not None and critic_eval.composite_interview_score >= 0:
            return round(max(0.00, min(1.00, critic_eval.composite_interview_score)), 4)

        return InterviewScoreCalculator.calculate_round_score(
            critic_eval.technical_accuracy,
            critic_eval.communication_clarity,
            critic_eval.problem_solving_speed,
            critic_eval.code_quality
        )

    @staticmethod
    def aggregate_topic_interview_score(scores: List[float]) -> float:
        if not scores:
            return 0.0
        return round(sum(scores) / len(scores), 4)
