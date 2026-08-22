"""
Review Router — Load & Capacity Panel
Exposes GET /api/review/load-summary and PATCH /api/review/update-budget
"""

from fastapi import APIRouter  # type: ignore

try:
    from ..db.database import db
    from ..engine.scores.load_calculator import compute_load_summary
except ImportError:
    from db.database import db
    from engine.scores.load_calculator import compute_load_summary

router = APIRouter(prefix="/api/review", tags=["Load & Capacity"])


@router.get("/load-summary")
async def get_load_capacity_summary(user_id: str = "usr_demo123"):
    """
    Returns a full load/capacity breakdown for the Review Panel.
    Computes Preparation Load Index (PLI) per topic and overall.
    """
    state = db.get_student_state(user_id)
    if state is None:
        return {"error": "Student not found", "user_id": user_id}
    return compute_load_summary(state)


@router.patch("/update-budget")
async def update_daily_budget(user_id: str = "usr_demo123", daily_budget_minutes: int = 120):
    """
    Persists a new daily_time_budget_minutes to the student profile.
    Used by the Budget Rebalance form on the Review Panel.
    """
    state = db.get_student_state(user_id)
    if state is None:
        return {"error": "Student not found", "user_id": user_id}

    # Persist the new budget using the existing update_profile method
    db.update_profile(user_id, {"daily_time_budget_minutes": daily_budget_minutes})

    # Re-compute with the updated value and return fresh summary
    state.profile.daily_time_budget_minutes = daily_budget_minutes
    return compute_load_summary(state)
