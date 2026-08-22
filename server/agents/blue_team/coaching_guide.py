#
# Blue Team Coaching Guide & Concept Explainer
# [OWNED BY MEMBER 3 - AI & AGENTS]
#
# Generates refresher explanations for weak prerequisite topics
# and Socratic debugging analysis for failed/inefficient submissions.
#

from __future__ import annotations

from typing import Any, Dict

from ...engine.skill_graph.root_cause import RootCauseAnalyzer
from ...engine.resources.sde_map import SDE_COMPETENCY_MAP
from ...engine.resources.web_dev_map import WEB_DEV_COMPETENCY_MAP

def get_prerequisite_alert(
    topic_id: str, 
    mastery_map: Dict[str, float],
    role: str = "SDE"
) -> Dict[str, Any] | None:
    """Finds the root cause prerequisite weakness using the DAG, without LLMs."""
    comp_map = WEB_DEV_COMPETENCY_MAP if "web" in role.lower() else SDE_COMPETENCY_MAP
    
    diagnosis = RootCauseAnalyzer.diagnose(comp_map, topic_id, mastery_map)
    if diagnosis and diagnosis.root_cause_node_id != topic_id:
        return {
            "alert_type": "PREREQUISITE_WEAKNESS",
            "message": diagnosis.explanation,
            "remediation": diagnosis.remediation_plan,
            "prerequisite_topic": diagnosis.root_cause_node_name,
            "prerequisite_id": diagnosis.root_cause_node_id
        }
    return None
