"""Placement Mentor 2.0 - FastAPI Main Application Entrypoint.

Starts the REST API server with CORS enabled.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes import router

app = FastAPI(
    title="Placement Mentor 2.0 API",
    description="Autonomous Multi-Agent Placement & Career Acceleration Platform",
    version="2.0.0"
)

# Configure CORS for local development (Vite/Next.js frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Placement Mentor 2.0 API",
        "docs": "/docs",
        "version": "2.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
