"""
Placement Mentor 2.0 - FastAPI Routers
"""

from .auth_router import router as auth_router, settings_router
from .onboarding_router import router as onboarding_router
from .student_router import router as student_router
from .mastery_router import router as mastery_router
from .resources_router import router as resources_router
from .roadmap_router import router as roadmap_router
from .agents_router import router as agents_router
from .sandbox_router import router as sandbox_router

__all__ = [
    "auth_router",
    "settings_router",
    "onboarding_router",
    "student_router",
    "mastery_router",
    "resources_router",
    "roadmap_router",
    "agents_router",
    "sandbox_router",
]
