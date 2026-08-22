"""Placement Mentor 2.0 - Memory Decay & Spaced Repetition Engine.

Formulation (Section 6 of PRD/Workflow):
- Exponential Forgetting Curve: R(t) = exp(-t / S)
- Stability thresholds:
  - Weak (S = 3 days)
  - At Risk (S = 7 days)
  - Stable (S = 14 days)
  - Mastered (S = 30 days)
- Triggers spaced revision task when retention drops below 0.70.
"""

from datetime import datetime
import math
from typing import Tuple
from backend.app.config import DECAY_SETTINGS
from backend.app.models.schemas import MemoryDecayState, SkillNode


class MemoryDecayEngine:
    def __init__(self, settings=DECAY_SETTINGS):
        self.settings = settings

    def calculate_decayed_mastery(self, node: SkillNode, current_time: datetime) -> Tuple[float, MemoryDecayState, bool]:
        if not node.last_practiced_at:
            return node.mastery, node.decay_state, False

        days_elapsed = max(0.0, (current_time - node.last_practiced_at).total_seconds() / 86400.0)
        stability = max(1.0, node.stability_days)

        # Retention R(t) = exp(-t / S)
        retention = math.exp(-days_elapsed / stability)
        effective_mastery = node.mastery * retention

        # Categorize decay state
        if effective_mastery >= 0.75 or (node.mastery >= 0.80 and retention >= 0.90):
            decay_state = MemoryDecayState.MASTERED
        elif effective_mastery >= 0.60:
            decay_state = MemoryDecayState.STABLE
        elif effective_mastery >= 0.40:
            decay_state = MemoryDecayState.AT_RISK
        else:
            decay_state = MemoryDecayState.WEAK


        needs_revision = (retention < 0.70 and node.mastery >= 0.60)
        return max(0.10, min(1.0, effective_mastery)), decay_state, needs_revision
