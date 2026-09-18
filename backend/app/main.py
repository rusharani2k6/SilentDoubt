from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base

import app.models  # Ensure all models are registered


# ============================================================
# Create Database Tables
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# Initialize FastAPI Application
# ============================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "SilentDoubt — Real-time silent classroom "
        "doubt resolution and polling system"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ============================================================
# CORS Configuration
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Import Routers
# ============================================================

from app.routers import (
    auth_router,
    admin_router,
    timetable_router,
    sessions_router,
    notifications_router,
    questions_router,
)

from app.ws import ws_router


# ============================================================
# Register Routers
# ============================================================

app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(timetable_router)
app.include_router(sessions_router)
app.include_router(notifications_router)
app.include_router(questions_router)
app.include_router(ws_router)


# ============================================================
# Root Endpoint
# ============================================================

@app.get("/")
def root():
    return {
        "app": "SilentDoubt API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "online",
    }


# ============================================================
# Health Check
# ============================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }