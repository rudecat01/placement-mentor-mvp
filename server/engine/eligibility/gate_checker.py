#
# Interview Readiness Gate Evaluator
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List

try:
    from schemas.mastery import GateEvaluationResult, GateStatus, LowestTopicInfo
    from schemas.skill_graph import CompetencyMap, SkillNode
    from engine.mastery.config import GATE_THRESHOLDS
except ImportError:
    from ...schemas.mastery import GateEvaluationResult, GateStatus, LowestTopicInfo
    from ...schemas.skill_graph import CompetencyMap, SkillNode
    from ..mastery.config import GATE_THRESHOLDS


class InterviewGateChecker:
    @staticmethod
    def evaluate_gate(
        competency_map: CompetencyMap,
        topic_mastery: Dict[str, float],
        practice_score: float
    ) -> GateEvaluationResult:
        core_nodes = [n for n in competency_map.nodes if n.is_core]
        nodes_to_evaluate = core_nodes if core_nodes else competency_map.nodes

        core_sum = 0.0
        min_mastery = 1.0
        lowest_node = nodes_to_evaluate[0]

        for node in nodes_to_evaluate:
            m = topic_mastery.get(node.id, 0.30)
            core_sum += m
            if m < min_mastery:
                min_mastery = m
                lowest_node = node

        role_core_average = round(core_sum / len(nodes_to_evaluate), 4)
        min_topic_mastery = round(min_mastery, 4)
        clamped_practice_score = round(max(0.0, min(1.0, practice_score)), 4)

        # Immediate gate
        passed_immediate_core = role_core_average >= GATE_THRESHOLDS["IMMEDIATE"]["ROLE_CORE_AVERAGE_MIN"]
        passed_immediate_min = min_topic_mastery >= GATE_THRESHOLDS["IMMEDIATE"]["CRITICAL_TOPIC_MIN"]
        passed_immediate_practice = clamped_practice_score >= GATE_THRESHOLDS["IMMEDIATE"]["PRACTICE_SCORE_MIN"]
        passed_immediate = passed_immediate_core and passed_immediate_min and passed_immediate_practice

        # Later gate
        passed_later_core = role_core_average >= GATE_THRESHOLDS["LATER"]["ROLE_CORE_AVERAGE_MIN"]
        passed_later_min = min_topic_mastery >= GATE_THRESHOLDS["LATER"]["CRITICAL_TOPIC_MIN"]
        passed_later_practice = clamped_practice_score >= GATE_THRESHOLDS["LATER"]["PRACTICE_SCORE_MIN"]
        passed_later = passed_later_core and passed_later_min and passed_later_practice

        missing_criteria: List[str] = []
        recommendations: List[str] = []

        if passed_immediate:
            status: GateStatus = "IMMEDIATE_UNLOCK"
            is_unlocked = True
            recommendations.append("Candidate demonstrates strong, verified readiness across all core topics.")
            recommendations.append("Full 5-stage simulated interview panel unlocked with live Shadow Critic scoring.")
        elif passed_later:
            status = "LATER_UNLOCK"
            is_unlocked = True
            recommendations.append("Candidate meets minimum readiness benchmark following completed preparation milestones.")
            recommendations.append("Interview unlocked for checkpoint assessment.")
        else:
            status = "GATED"
            is_unlocked = False

            if not passed_later_core:
                diff = round(GATE_THRESHOLDS["LATER"]["ROLE_CORE_AVERAGE_MIN"] - role_core_average, 2)
                missing_criteria.append(
                    f"Role Core Average is {role_core_average * 100:.0f}% (Requires ≥ {GATE_THRESHOLDS['LATER']['ROLE_CORE_AVERAGE_MIN'] * 100:.0f}%, deficit: -{diff * 100:.0f}%)"
                )

            if not passed_later_min:
                missing_criteria.append(
                    f'Critical topic "{lowest_node.name}" mastery is {min_topic_mastery * 100:.0f}% (Requires ≥ {GATE_THRESHOLDS["LATER"]["CRITICAL_TOPIC_MIN"] * 100:.0f}%)'
                )

            if not passed_later_practice:
                diff = round(GATE_THRESHOLDS["LATER"]["PRACTICE_SCORE_MIN"] - clamped_practice_score, 2)
                missing_criteria.append(
                    f"Practice Score is {clamped_practice_score * 100:.0f}% (Requires ≥ {GATE_THRESHOLDS['LATER']['PRACTICE_SCORE_MIN'] * 100:.0f}%, deficit: -{diff * 100:.0f}%)"
                )

            recommendations.append(f'Focus daily roadmap budget on boosting "{lowest_node.name}".')
            recommendations.append("Complete assigned daily sandbox practice problems to raise baseline Practice Score.")
            recommendations.append("Interviews remain gated to prevent noisy evaluation until foundational competency is established.")

        return GateEvaluationResult(
            status=status,
            is_unlocked=is_unlocked,
            role_core_average=role_core_average,
            min_topic_mastery=min_topic_mastery,
            lowest_topic=LowestTopicInfo(
                topic_id=lowest_node.id,
                topic_name=lowest_node.name,
                mastery=min_topic_mastery
            ),
            practice_score=clamped_practice_score,
            passed_immediate_criteria=passed_immediate,
            passed_later_criteria=passed_later,
            missing_criteria=missing_criteria,
            recommendations=recommendations,
            evaluated_at=datetime.now(timezone.utc).isoformat()
        )
