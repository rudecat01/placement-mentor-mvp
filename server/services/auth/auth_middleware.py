"""
Placement Mentor 2.0 - Authentication Service & Security Middleware
[OWNED BY MEMBER 1 - DB & USER STATE ARCHITECT]

Provides:
- Token creation, decoding, and validation
- FastAPI Security Header Dependencies (Bearer Token / Demo fallback)
- User session authentication
"""

import base64
import hashlib
import hmac
import json
import time
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ...db.database import db
from ...db.models import UserRecord

SECRET_KEY = "placement_mentor_2_0_jwt_secret_key_change_in_production"
security_scheme = HTTPBearer(auto_error=False)


def create_access_token(user_id: str, email: str, expires_delta_seconds: int = 86400 * 7) -> str:
    """Creates a signed JWT-compatible token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(time.time()),
        "exp": int(time.time() + expires_delta_seconds)
    }

    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")

    return f"{header_b64}.{payload_b64}.{sig_b64}"


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates token signature and expiry."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts

        # Verify signature
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")

        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None

        # Pad base64 if needed
        padding = 4 - (len(payload_b64) % 4)
        if padding != 4:
            payload_b64 += "=" * padding

        payload_json = base64.urlsafe_b64decode(payload_b64.encode()).decode()
        payload = json.loads(payload_json)

        # Check expiration
        if payload.get("exp", 0) < time.time():
            return None

        return payload
    except Exception:
        return None


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> UserRecord:
    """
    Dependency that extracts current user from Bearer token.
    Falls back to default demo user for frictionless frontend / local development.
    """
    if credentials and credentials.credentials:
        token = credentials.credentials
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user = db.get_user_by_id(payload["sub"])
            if user:
                return user

    # Fallback to demo user
    demo_user = db.get_user_by_id("usr_demo123")
    if demo_user:
        return demo_user

    # If demo user missing, return fresh mock user
    return UserRecord(
        id="usr_demo123",
        email="student@placement.ai",
        password_hash="",
        name="Aryan Sharma"
    )


def require_authenticated_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme)) -> UserRecord:
    """Strict authentication dependency requiring valid token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Authentication token required")

    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")

    user = db.get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    return user
