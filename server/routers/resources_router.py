#
# FastAPI Competency Map, DAG, and Resource Router
# [OWNED BY MEMBER 2 - ENGINE & MATH LEAD]
#

from __future__ import annotations

from typing import List, Dict, Optional, Any
from fastapi import APIRouter, HTTPException, Query, Body  # type: ignore

try:
    from ..schemas.skill_graph import RoleType
    from ..engine.resources.resource_catalog import ResourceCatalogService
    from ..engine.skill_graph.dag_solver import DAGSolver
except (ImportError, ValueError):
    from schemas.skill_graph import RoleType
    from engine.resources.resource_catalog import ResourceCatalogService
    from engine.skill_graph.dag_solver import DAGSolver

router = APIRouter(prefix="/resources", tags=["Skill Graph & Resources"])


@router.get("/competency-map/{role}")
def get_competency_map(role: str):
    """Returns full competency DAG map for a specified role"""
    try:
        role_type = role.upper()
        competency_map = ResourceCatalogService.get_competency_map_by_role(role_type)  # type: ignore
        validation = DAGSolver.validate_graph(competency_map)
        depths = DAGSolver.calculate_node_depths(competency_map)

        return {
            "success": True,
            "data": {
                "map": competency_map,
                "validation": validation,
                "node_depths": depths
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/catalog")
def get_catalog(
    topic_id: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    type: Optional[str] = Query(None)
):
    """Returns curated verified resources with optional filtering"""
    try:
        resources = ResourceCatalogService.get_all_resources()

        if topic_id:
            resources = [r for r in resources if r.topic_id == topic_id]
        if difficulty:
            resources = [r for r in resources if r.difficulty == difficulty.upper()]
        if type:
            resources = [r for r in resources if r.type == type.upper()]

        return {
            "success": True,
            "count": len(resources),
            "data": resources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/topic/{topic_id}")
def get_topic_resources(topic_id: str):
    """Returns verified learning resources for a specific topic"""
    try:
        resources = ResourceCatalogService.get_resources_by_topic(topic_id)
        return {
            "success": True,
            "topic_id": topic_id,
            "count": len(resources),
            "data": resources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/unlocked-topics")
def get_unlocked_topics(
    role: RoleType = Body(..., embed=True),
    mastery_map: Dict[str, float] = Body(..., embed=True),
    mastery_cap: float = Body(0.85, embed=True)
):
    """Returns list of topics whose prerequisites are satisfied given current mastery"""
    try:
        competency_map = ResourceCatalogService.get_competency_map_by_role(role)
        unlocked = DAGSolver.get_unlocked_topics(competency_map, mastery_map, mastery_cap)
        return {
            "success": True,
            "count": len(unlocked),
            "data": unlocked
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
