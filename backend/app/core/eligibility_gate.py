"""Placement Mentor 2.0 - Interview Eligibility Gates.

Rules (Section 5 of PRD/Workflow):
- Immediate Gate: Role-core avg mastery >= 0.75 AND no critical topic < 0.60 AND practice score >= 0.70.
- Later Checkpoint Gate: Role-core avg mastery >= 0.70 AND no critical topic < 0.55 AND practice score >= 0.65.
"""

from enum import Enum
from typing import Dict, List
from backend.app.config import GATE_SETTINGS
from backend.app.models.schemas import SkillNode


class GateStatus(str, Enum):
    UNLOCKED_IMMEDIATE = "unlocked_immediate"
    UNLOCKED_LATER = "unlocked_later"
    GATED = "gated"


class EligibilityGate:
    def __init__(self, settings=GATE_SETTINGS):
        self.settings = settings

    def evaluate_readiness(self, skills: List[SkillNode]) -> Dict[str, any]:
        if not skills:
            return {
                "status": GateStatus.GATED,
                "is_eligible": False,
                "reason": "No skill data found in DAG.",
                "core_avg_mastery": 0.0,
                "critical_min_mastery": 0.0,
                "avg_practice_score": 0.0
            }

        critical_skills = [s for s in skills if s.is_critical_for_role]
        eval_skills = critical_skills if critical_skills else skills

        core_avg_mastery = sum(s.mastery for s in eval_skills) / len(eval_skills)
        critical_min_mastery = min(s.mastery for s in eval_skills)
        avg_practice_score = sum(s.practice_score for s in eval_skills) / len(eval_skills)

        # 1. Immediate Gate
        if (
            core_avg_mastery >= self.settings.immediate_core_avg_mastery and
            critical_min_mastery >= self.settings.immediate_critical_min_mastery and
            avg_practice_score >= self.settings.immediate_min_practice_score
        ):
            return {
                "status": GateStatus.UNLOCKED_IMMEDIATE,
                "is_eligible": True,
                "gate_type": "Immediate Gate Cleared",
                "core_avg_mastery": round(core_avg_mastery, 3),
                "critical_min_mastery": round(critical_min_mastery, 3),
                "avg_practice_score": round(avg_practice_score, 3),
                "message": "Candidate is fully primed for mock interviews across core topics."
            }

        # 2. Later Checkpoint Gate
        if (
            core_avg_mastery >= self.settings.later_core_avg_mastery and
            critical_min_mastery >= self.settings.later_critical_min_mastery and
            avg_practice_score >= self.settings.later_min_practice_score
        ):
            return {
                "status": GateStatus.UNLOCKED_LATER,
                "is_eligible": True,
                "gate_type": "Later Checkpoint Cleared",
                "core_avg_mastery": round(core_avg_mastery, 3),
                "critical_min_mastery": round(critical_min_mastery, 3),
                "avg_practice_score": round(avg_practice_score, 3),
                "message": "Qualified at secondary checkpoint. Recommend focusing on lowest mastery topics."
            }

        # 3. Gated
        reasons = []
        if core_avg_mastery < self.settings.later_core_avg_mastery:
            reasons.append(f"Core average mastery ({core_avg_mastery:.2f}) is below required {self.settings.later_core_avg_mastery:.2f}.")
        if critical_min_mastery < self.settings.later_critical_min_mastery:
            weakest = min(eval_skills, key=lambda s: s.mastery)
            reasons.append(f"Critical topic '{weakest.name}' mastery ({critical_min_mastery:.2f}) is below minimum {self.settings.later_critical_min_mastery:.2f}.")
        if avg_practice_score < self.settings.later_min_practice_score:
            reasons.append(f"Practice score ({avg_practice_score:.2f}) is below required {self.settings.later_min_practice_score:.2f}.")

        return {
            "status": GateStatus.GATED,
            "is_eligible": False,
            "gate_type": "Interview Room Locked",
            "core_avg_mastery": round(core_avg_mastery, 3),
            "critical_min_mastery": round(critical_min_mastery, 3),
            "avg_practice_score": round(avg_practice_score, 3),
            "reasons": reasons,
            "message": "Interview simulation is locked to prevent premature mock burn. Complete targeted practice tasks to unlock."
        }
