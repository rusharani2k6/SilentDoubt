from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.user import UserResponse


# ============================================================
# BASE
# ============================================================

class TimetableEntryBase(BaseModel):
    section: str
    subject: str
    day_of_week: str
    start_time: str
    end_time: str

    class_date: Optional[date] = None

    assigned_faculty_name: Optional[str] = None


# ============================================================
# CREATE
# ============================================================

class TimetableEntryCreate(TimetableEntryBase):
    """
    Used by both:

    Faculty:
        faculty_id comes from logged-in user.

    Admin:
        faculty_id can be supplied explicitly.
    """

    faculty_id: Optional[int] = None


# ============================================================
# UPDATE
# ============================================================

class TimetableEntryUpdate(BaseModel):
    faculty_id: Optional[int] = None

    section: Optional[str] = None
    subject: Optional[str] = None
    day_of_week: Optional[str] = None

    start_time: Optional[str] = None
    end_time: Optional[str] = None

    class_date: Optional[date] = None

    assigned_faculty_name: Optional[str] = None


# ============================================================
# RESPONSE
# ============================================================

class TimetableEntryResponse(BaseModel):
    id: int

    faculty_id: int

    section: str
    subject: str
    day_of_week: str

    start_time: str
    end_time: str

    class_date: Optional[date] = None

    assigned_faculty_name: Optional[str] = None

    faculty: Optional[UserResponse] = None

    model_config = ConfigDict(
        from_attributes=True
    )