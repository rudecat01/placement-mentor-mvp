"""Placement Mentor 2.0 - Performance Transfer Gap (PTG) Engine.

Formulation (Section 4 of PRD/Workflow):
- PTG = Practice Score - Interview Score
- PTG <= 0.10: Good Transfer (Strong interview fluency)
- 0.10 < PTG <= 0.25: Moderate Transfer Weakness (Blue Team scaffolding)
- PTG > 0.25: High Transfer Gap -> Triggers Red Team Adversary (15m tight countdowns, live curveballs)
"""

from enum import Enum
from typing import Dict, Optional
from backend.app.config import PTG_SETTINGS


class PTGTransferCategory(str, Enum):
    GOOD_TRANSFER = "good_transfer"
    MODERATE_WEAKNESS = "moderate_weakness"
    HIGH_TRANSFER_GAP = "high_transfer_gap"


class PTGEngine:
    def __init__(
        self,
        good_threshold: float = PTG_SETTINGS.good_transfer_threshold,
        high_threshold: float = PTG_SETTINGS.high_transfer_threshold
    ):
        self.good_threshold = good_threshold
        self.high_threshold = high_threshold

    def calculate_ptg(self, practice_score: float, interview_score: Optional[float]) -> Optional[float]:
        if interview_score is None:
            return None
        return max(0.0, round(practice_score - interview_score, 4))

    def categorize_transfer(self, ptg: Optional[float]) -> PTGTransferCategory:
        if ptg is None:
            return PTGTransferCategory.GOOD_TRANSFER
        if ptg <= self.good_threshold:
            return PTGTransferCategory.GOOD_TRANSFER
        elif ptg <= self.high_threshold:
            return PTGTransferCategory.MODERATE_WEAKNESS
        else:
            return PTGTransferCategory.HIGH_TRANSFER_GAP

    def recommend_coaching_strategy(self, ptg: Optional[float], topic: str) -> Dict[str, str]:
        category = self.categorize_transfer(ptg)

        if category == PTGTransferCategory.HIGH_TRANSFER_GAP:
            return {
                "strategy": "red_team_adversary",
                "headline": f"Red Team Adversary Drill Triggered: {topic}",
                "description": f"PTG of {ptg:.2f} indicates high cognitive friction when verbalizing solutions under pressure. Scheduling 15-minute speed drill with live constraint shifts.",
                "action_item": "15-minute adversarial mock interview with tight countdown."
            }
        elif category == PTGTransferCategory.MODERATE_WEAKNESS:
            return {
                "strategy": "blue_team_think_aloud",
                "headline": f"Blue Team Think-Aloud Scaffolding: {topic}",
                "description": f"PTG of {ptg:.2f} shows slight verbalization lag despite solid practice code. Scheduling structured think-aloud practice.",
                "action_item": "10-minute Blue Team think-aloud practice session."
            }
        else:
            return {
                "strategy": "standard_progression",
                "headline": f"Strong Performance Transfer: {topic}",
                "description": "Candidate demonstrates consistent coding fluency and verbal communication.",
                "action_item": "Continue standard roadmap progression."
            }
