#
# Performance Transfer Gap (PTG) Calculator & Intervention Diagnostics
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
# PTG = PracticeScore - InterviewScore
#

from __future__ import annotations

from typing import List, Dict, Optional, Tuple

try:
    from schemas.mastery import PTGEvaluation, PTGSeverity, InterventionType
    from engine.mastery.config import PTG_THRESHOLDS
except ImportError:
    from ...schemas.mastery import PTGEvaluation, PTGSeverity, InterventionType
    from ..mastery.config import PTG_THRESHOLDS


class PTGCalculator:
    @staticmethod
    def evaluate_ptg(
        topic_id: str,
        topic_name: str,
        practice_score: float,
        interview_score: float
    ) -> PTGEvaluation:
        clamped_practice = max(0.00, min(1.00, practice_score))
        clamped_interview = max(0.00, min(1.00, interview_score))
        ptg = round(clamped_practice - clamped_interview, 4)

        if ptg <= PTG_THRESHOLDS["GOOD_TRANSFER_MAX"]:
            severity: PTGSeverity = "GOOD_TRANSFER"
            intervention_type: InterventionType = "STANDARD_PROGRESSION"
            recommendation = (
                f"Strong knowledge transfer in {topic_name}. The student performs reliably under both untimed practice and live interview pressure."
            )
            actionable_drill = "Escalate topic difficulty or proceed to dependent advanced graph topics."
        elif ptg <= PTG_THRESHOLDS["MODERATE_GAP_MAX"]:
            severity: PTGSeverity = "MODERATE_GAP"
            intervention_type: InterventionType = "TARGETED_PRACTICE"
            recommendation = (
                f"Moderate transfer gap in {topic_name} (PTG: {ptg * 100:.1f}%). Student understands core concepts in practice but exhibits slight hesitation or communication friction under timed evaluation."
            )
            actionable_drill = "Schedule 1 timed problem set with strict 25-minute timer and verbal think-aloud practice."
        else:
            severity: PTGSeverity = "HIGH_GAP"
            intervention_type: InterventionType = "RED_TEAM_PRESSURE"
            recommendation = (
                f"High Performance Transfer Gap in {topic_name} (PTG: {ptg * 100:.1f}%). Significant divergence between practice proficiency and interview execution."
            )
            actionable_drill = (
                "Activate Red Team adversarial pressure drill (time constraints & edge case attacks) combined with Blue Team Socratic think-aloud coaching. Reduce pure difficulty escalation."
            )

        return PTGEvaluation(
            topic_id=topic_id,
            topic_name=topic_name,
            practice_score=clamped_practice,
            interview_score=clamped_interview,
            ptg=ptg,
            severity=severity,
            intervention_type=intervention_type,
            recommendation=recommendation,
            actionable_drill=actionable_drill
        )

    @staticmethod
    def evaluate_all_topics(
        topics: List[Dict]
    ) -> Dict:
        evaluations: List[PTGEvaluation] = []

        for t in topics:
            if t.get("interview_score") is not None:
                topic_id = str(t.get("topic_id", ""))
                topic_name = str(t.get("topic_name") or topic_id)
                evaluations.append(
                    PTGCalculator.evaluate_ptg(
                        topic_id,
                        topic_name,
                        float(t["practice_score"]),
                        float(t["interview_score"])
                    )
                )

        evaluations.sort(key=lambda e: e.ptg, reverse=True)
        overall_ptg = (
            round(sum(e.ptg for e in evaluations) / len(evaluations), 4)
            if evaluations
            else 0.0
        )

        return {
            "evaluations": evaluations,
            "overall_ptg": overall_ptg,
            "highest_gap_topic": evaluations[0] if evaluations else None
        }
