#
# FastAPI Application Entry Point — Placement Mentor 2.0 Backend
# [ROOT - server/main.py]
#
# Registers all domain routers:
# Member 1: auth_router, settings_router, onboarding_router, student_router
# Member 2: mastery_router, resources_router
# Member 3: roadmap_router, agents_router, interview_router
# Member 4: sandbox_router
#

import sys
import os

# Ensure project root and server directory are in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore

# Member Routers
try:
    from .routers.auth_router import router as auth_router, settings_router
    from .routers.onboarding_router import router as onboarding_router, onboarding_compat_router
    from .routers.student_router import router as student_router
    from .routers.mastery_router import router as mastery_router
    from .routers.resources_router import router as resources_router
    from .routers.roadmap_router import router as roadmap_router
    from .routers.agents_router import router as agents_router
    from .routers.interview_router import router as interview_router, interview_compat_router
    from .routers.resume_doctor_router import router as resume_doctor_router, resume_compat_router
    from .routers.sandbox_router import router as sandbox_router
    from .routers.review_router import router as review_router
except (ImportError, ValueError):
    from routers.auth_router import router as auth_router, settings_router
    from routers.onboarding_router import router as onboarding_router, onboarding_compat_router
    from routers.student_router import router as student_router
    from routers.mastery_router import router as mastery_router
    from routers.resources_router import router as resources_router
    from routers.roadmap_router import router as roadmap_router
    from routers.agents_router import router as agents_router
    from routers.interview_router import router as interview_router, interview_compat_router
    from routers.resume_doctor_router import router as resume_doctor_router, resume_compat_router
    from routers.sandbox_router import router as sandbox_router
    from routers.review_router import router as review_router

app = FastAPI(
    title="placeMate API",
    description="Autonomous Multi-Agent Placement & Career Acceleration Platform",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all domain routers
app.include_router(auth_router)
app.include_router(settings_router)
app.include_router(onboarding_router)
app.include_router(onboarding_compat_router)
app.include_router(student_router)
app.include_router(mastery_router)
app.include_router(resources_router)
app.include_router(roadmap_router)
app.include_router(agents_router)
app.include_router(interview_router)
app.include_router(interview_compat_router)
app.include_router(resume_doctor_router)
app.include_router(resume_compat_router)
app.include_router(sandbox_router)
app.include_router(review_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "placeMate FastAPI Backend",
        "version": "2.0.0"
    }


if __name__ == "__main__":
    import uvicorn  # type: ignore
    port = int(os.environ.get("PORT", 4000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
