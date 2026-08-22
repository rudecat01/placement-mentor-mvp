#
# FastAPI Roadmap Router — Member 3's API Gateway
# [OWNED BY MEMBER 3 - AI & AGENTS]
#

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException

from pydantic import BaseModel
from ..services.student_state.student_state_service import student_state_service
from ..agents.planner.roadmap_planner import generate_daily_roadmap
from ..agents.planner.replan_checkpoint import process_end_of_day_replan

router = APIRouter(prefix="/api/roadmap", tags=["Roadmap"])

class TaskCompletePayload(BaseModel):
    user_id: str = "usr_demo123"
    topic_id: str
    difficulty: str = "MEDIUM"

@router.post("/task/complete")
async def complete_task(payload: TaskCompletePayload) -> dict[str, Any]:
    """
    Marks a roadmap task as complete and boosts topic mastery dynamically.
    """
    try:
        student_state_service.mark_topic_completed(payload.user_id, payload.topic_id, payload.difficulty)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate")
async def generate_roadmap(body: dict[str, Any]) -> dict[str, Any]:
    """
    Generate a time-budgeted daily roadmap plan.
    """
    try:
        plan = await generate_daily_roadmap(
            student_state=body["student_state"],
            skill_graph=body["skill_graph"],
            day_number=body["day_number"],
            daily_budget_minutes=body["daily_budget_minutes"],
            target_role=body["target_role"],
            target_companies=body.get("target_companies"),
        )
        return {"success": True, "data": plan}
    except KeyError as e:
        raise HTTPException(status_code=422, detail=f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/replan")
async def replan_checkpoint(body: dict[str, Any]) -> dict[str, Any]:
    """
    Trigger an end-of-day re-plan for the next 3 days.
    """
    try:
        replan = await process_end_of_day_replan(
            completed_day=body["completed_day"],
            updated_mastery=body["updated_mastery"],
            updated_ptg=body["updated_ptg"],
            remaining_days=body["remaining_days"],
            daily_budget_minutes=body["daily_budget_minutes"],
            target_role=body["target_role"],
        )
        return {"success": True, "data": replan}
    except KeyError as e:
        raise HTTPException(status_code=422, detail=f"Missing required field: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
