from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.timetable import router as timetable_router
from app.routers.sessions import router as sessions_router
from app.routers.notifications import router as notifications_router
from app.routers.questions import router as questions_router


__all__ = [
    "auth_router",
    "admin_router",
    "timetable_router",
    "sessions_router",
    "notifications_router",
    "questions_router",
]