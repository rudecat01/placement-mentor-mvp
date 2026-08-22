from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.sandbox.sandbox_service import sandbox_service

router = APIRouter(prefix="/api/sandbox", tags=["Sandbox"])

class ExecutePayload(BaseModel):
    problem_id: str
    language: str
    code: str
    test_cases: List[Dict[str, Any]]

@router.get("/problem/{problem_id}")
async def get_problem(problem_id: str) -> Dict[str, Any]:
    details = sandbox_service.get_problem_details(problem_id)
    if not details:
        raise HTTPException(status_code=404, detail="Problem not found")
    return {"success": True, "data": details}

@router.post("/execute")
async def execute_code(payload: ExecutePayload) -> Dict[str, Any]:
    try:
        results = sandbox_service.execute_code(
            problem_id=payload.problem_id,
            language=payload.language,
            code=payload.code,
            test_cases=payload.test_cases
        )
        return {"success": True, "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
