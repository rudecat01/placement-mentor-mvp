"""
Placement Mentor 2.0 - Auth & System Settings Router
[OWNED BY MEMBER 1 - DB & USER STATE ARCHITECT]
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from ..db.database import db
from ..db.models import UserRecord
from ..schemas.student import (
    UserRegisterPayload,
    UserLoginPayload,
    AuthTokenResponse,
)
from ..services.auth.auth_middleware import (
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthTokenResponse)
def register(payload: UserRegisterPayload):
    """Registers a new user and generates a bearer token."""
    try:
        user = db.create_user(
            email=payload.email,
            password=payload.password,
            name=payload.name
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    token = create_access_token(user.id, user.email)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        name=user.name
    )


@router.post("/login", response_model=AuthTokenResponse)
def login(payload: UserLoginPayload):
    """Verifies user credentials and returns a bearer token."""
    user = db.verify_password(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user.id, user.email)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        name=user.name
    )


@router.get("/me")
def get_current_user_profile(user: UserRecord = Depends(get_current_user)):
    """Returns the authenticated user details."""
    return {
        "user_id": user.id,
        "email": user.email,
        "name": user.name,
        "is_active": user.is_active,
        "created_at": user.created_at
    }


@router.post("/logout")
def logout():
    """Logs out user (stateless token clearance)."""
    return {"status": "success", "message": "Successfully logged out."}


# ---------------- API SETTINGS & LLM KEY CONFIG ----------------

settings_router = APIRouter(prefix="/api/settings", tags=["Settings"])


class APIKeyUpdatePayload(BaseModel):
    gemini_api_key: str


@settings_router.get("/api-status")
def get_api_status():
    api_key = db.get_api_key()
    return {
        "gemini_connected": bool(api_key),
        "model": "gemini-2.0-flash",
        "has_key": bool(api_key)
    }


@settings_router.post("/api-key")
def update_api_key(payload: APIKeyUpdatePayload):
    db.set_api_key(payload.gemini_api_key)
    return {
        "status": "success",
        "gemini_connected": bool(payload.gemini_api_key.strip()),
        "message": "Gemini API key updated successfully."
    }
