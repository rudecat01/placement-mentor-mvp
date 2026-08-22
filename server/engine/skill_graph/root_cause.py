#
# Causal Root-Cause Diagnosis Engine
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

from typing import Dict, List, Optional

try:
    from schemas.skill_graph import CompetencyMap, SkillNode, RootCauseDiagnosis
    from engine.mastery.config import DAG_THRESHOLDS
except ImportError:
    from ...schemas.skill_graph import CompetencyMap, SkillNode, RootCauseDiagnosis
    from ..mastery.config import DAG_THRESHOLDS


class RootCauseAnalyzer:
    @staticmethod
    def diagnose(
        competency_map: CompetencyMap,
        failed_topic_id: str,
        mastery_map: Dict[str, float],
        bottleneck_threshold: float = DAG_THRESHOLDS["ROOT_CAUSE_BOTTLENECK_MASTERY"]
    ) -> Optional[RootCauseDiagnosis]:
        node_map = {n.id: n for n in competency_map.nodes}
        target_node = node_map.get(failed_topic_id)

        if not target_node:
            return None

        visited = set()
        candidates: List[Dict] = []

        def traverse(current_id: str, current_path: List[str], depth: int):
            if current_id in visited:
                return
            visited.add(current_id)

            node = node_map.get(current_id)
            if not node:
                return

            m = mastery_map.get(current_id, 0.30)

            if current_id != failed_topic_id and m < bottleneck_threshold:
                candidates.append({
                    "node_id": current_id,
                    "node_name": node.name,
                    "mastery": m,
                    "path": list(current_path),
                    "depth": depth
                })

            for prereq in node.prerequisites:
                traverse(prereq, [prereq] + current_path, depth + 1)

        traverse(failed_topic_id, [failed_topic_id], 0)

        # If no prerequisite bottleneck found, issue is localized
        if not candidates:
            curr_m = mastery_map.get(failed_topic_id, 0.30)
            return RootCauseDiagnosis(
                failed_topic_id=failed_topic_id,
                failed_topic_name=target_node.name,
                root_cause_node_id=failed_topic_id,
                root_cause_node_name=target_node.name,
                current_mastery=curr_m,
                required_mastery=DAG_THRESHOLDS["PREREQUISITE_UNLOCK_MASTERY"],
                causal_path=[failed_topic_id],
                explanation=f"Struggle is localized to {target_node.name} fundamentals. All prerequisite skills are satisfied.",
                remediation_plan=f"Practice targeted {target_node.name} exercises with Progressive Socratic Hint guidance."
            )

        # Sort by lowest mastery first, then greatest depth
        candidates.sort(key=lambda c: (c["mastery"], -c["depth"]))
        primary = candidates[0]

        return RootCauseDiagnosis(
            failed_topic_id=failed_topic_id,
            failed_topic_name=target_node.name,
            root_cause_node_id=primary["node_id"],
            root_cause_node_name=primary["node_name"],
            current_mastery=primary["mastery"],
            required_mastery=DAG_THRESHOLDS["PREREQUISITE_UNLOCK_MASTERY"],
            causal_path=primary["path"],
            explanation=(
                f'Failure in "{target_node.name}" stems from an unmastered foundational prerequisite: '
                f'"{primary["node_name"]}" (Current Mastery: {primary["mastery"] * 100:.0f}%, Required: {DAG_THRESHOLDS["PREREQUISITE_UNLOCK_MASTERY"] * 100:.0f}%).'
            ),
            remediation_plan=(
                f'Suspend advanced {target_node.name} challenges. Re-route the next daily budget allocation '
                f'to solidify {primary["node_name"]} via curated video resources and foundational drills.'
            )
        )
