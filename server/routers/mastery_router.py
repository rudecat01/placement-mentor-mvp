#
# FastAPI Mastery, Scores, PTG, and Interview Gate Router
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

from typing import List, Dict, Optional, Any
from fastapi import APIRouter, HTTPException, Query, Body  # type: ignore

try:
    from ..schemas.mastery import (
        PracticeAttemptEvidence,
        BKTParameters,
        BKTUpdateResult,
        PTGEvaluation,
        GateEvaluationResult
    )
    from ..schemas.skill_graph import RoleType
    from ..engine.mastery.bkt_formula import BKTMasteryEngine
    from ..engine.mastery.config import DEFAULT_BKT_PARAMS, GATE_THRESHOLDS, PTG_THRESHOLDS
    from ..engine.scores.practice_score import PracticeScoreCalculator
    from ..engine.scores.interview_score import InterviewScoreCalculator
    from ..engine.scores.ptg_calculator import PTGCalculator
    from ..engine.skill_graph.root_cause import RootCauseAnalyzer
    from ..engine.eligibility.gate_checker import InterviewGateChecker
    from ..engine.resources.resource_catalog import ResourceCatalogService
except (ImportError, ValueError):
    from schemas.mastery import (
        PracticeAttemptEvidence,
        BKTParameters,
        BKTUpdateResult,
        PTGEvaluation,
        GateEvaluationResult
    )
    from schemas.skill_graph import RoleType
    from engine.mastery.bkt_formula import BKTMasteryEngine
    from engine.mastery.config import DEFAULT_BKT_PARAMS, GATE_THRESHOLDS, PTG_THRESHOLDS
    from engine.scores.practice_score import PracticeScoreCalculator
    from engine.scores.interview_score import InterviewScoreCalculator
    from engine.scores.ptg_calculator import PTGCalculator
    from engine.skill_graph.root_cause import RootCauseAnalyzer
    from engine.eligibility.gate_checker import InterviewGateChecker
    from engine.resources.resource_catalog import ResourceCatalogService

router = APIRouter(prefix="/mastery", tags=["Mastery & Engine"])


@router.get("/config")
def get_config():
    """Returns active BKT parameters and system thresholds"""
    return {
        "bkt_params": DEFAULT_BKT_PARAMS,
        "gate_thresholds": GATE_THRESHOLDS,
        "ptg_thresholds": PTG_THRESHOLDS
    }


@router.post("/update", response_model=Dict[str, Any])
def update_mastery(
    current_mastery: float = Body(..., embed=True),
    evidence: PracticeAttemptEvidence = Body(..., embed=True),
    custom_params: Optional[BKTParameters] = Body(None, embed=True)
):
    """Updates topic mastery using Bayesian Knowledge Tracing"""
    try:
        result = BKTMasteryEngine.update_mastery(current_mastery, evidence, custom_params)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch-update", response_model=Dict[str, Any])
def batch_update_mastery(
    initial_mastery: float = Body(..., embed=True),
    attempts: List[PracticeAttemptEvidence] = Body(..., embed=True),
    custom_params: Optional[BKTParameters] = Body(None, embed=True)
):
    """Batch updates mastery across multiple sequential practice attempts"""
    try:
        final_m, history = BKTMasteryEngine.batch_update(initial_mastery, attempts, custom_params)
        return {"success": True, "data": {"final_mastery": final_m, "history": history}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/practice-score", response_model=Dict[str, Any])
def calculate_practice_score(
    attempts: List[PracticeAttemptEvidence] = Body(..., embed=True),
    decay_factor: float = Body(0.85, embed=True)
):
    """Calculates weighted practice score from attempt history"""
    try:
        score = PracticeScoreCalculator.calculate_topic_practice_score(attempts, decay_factor)
        return {
            "success": True,
            "data": {
                "practice_score": score,
                "attempt_count": len(attempts)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ptg", response_model=Dict[str, Any])
def calculate_ptg(
    topic_id: str = Body(..., embed=True),
    topic_name: Optional[str] = Body(None, embed=True),
    practice_score: float = Body(..., embed=True),
    interview_score: float = Body(..., embed=True)
):
    """Calculates Performance Transfer Gap and intervention strategy"""
    try:
        evaluation = PTGCalculator.evaluate_ptg(
            topic_id,
            topic_name or topic_id,
            practice_score,
            interview_score
        )
        return {"success": True, "data": evaluation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ptg/all", response_model=Dict[str, Any])
def calculate_all_ptg(topics: List[Dict[str, Any]] = Body(..., embed=True)):
    """Evaluates PTG across all topics in a profile"""
    try:
        result = PTGCalculator.evaluate_all_topics(topics)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/root-cause", response_model=Dict[str, Any])
def diagnose_root_cause(
    role: RoleType = Body(..., embed=True),
    failed_topic_id: str = Body(..., embed=True),
    mastery_map: Dict[str, float] = Body(..., embed=True),
    bottleneck_threshold: Optional[float] = Body(None, embed=True)
):
    """Backwards DAG traversal for identifying foundational skill bottlenecks"""
    try:
        competency_map = ResourceCatalogService.get_competency_map_by_role(role)
        kwargs = {}
        if bottleneck_threshold is not None:
            kwargs["bottleneck_threshold"] = bottleneck_threshold

        diagnosis = RootCauseAnalyzer.diagnose(
            competency_map,
            failed_topic_id,
            mastery_map,
            **kwargs
        )
        return {"success": True, "data": diagnosis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/gate-check", response_model=Dict[str, Any])
def evaluate_gate(
    role: RoleType = Body(..., embed=True),
    topic_mastery: Dict[str, float] = Body(..., embed=True),
    practice_score: float = Body(..., embed=True)
):
    """Evaluates interview readiness gate"""
    try:
        competency_map = ResourceCatalogService.get_competency_map_by_role(role)
        result = InterviewGateChecker.evaluate_gate(
            competency_map,
            topic_mastery,
            practice_score
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
