from typing import Optional, List
from datetime import datetime

from pydantic import BaseModel

from app.schemas.timetable import TimetableEntryResponse
from app.schemas.user import UserResponse
from app.schemas.doubt import DoubtResponse
from app.schemas.poll import PollResponse


# ============================================================
# START SESSION REQUEST
# ============================================================

class SessionStartRequest(BaseModel):

    timetable_entry_id: int


# ============================================================
# ATTENDANCE RESPONSE
# ============================================================

class AttendanceRecordResponse(BaseModel):

    id: int

    session_id: int

    student_id: int

    # --------------------------------------------------------
    # STUDENT ROLL NUMBER
    # --------------------------------------------------------
    # Student name intentionally removed.
    # Faculty dashboard needs only roll number.
    # --------------------------------------------------------

    roll_number: Optional[str] = None

    joined_at: datetime

    class Config:

        from_attributes = True


# ============================================================
# SESSION RESPONSE
# ============================================================

class SessionResponse(BaseModel):

    id: int

    timetable_entry_id: int

    faculty_id: int

    status: str

    started_at: datetime

    ended_at: Optional[datetime] = None

    timetable_entry: Optional[
        TimetableEntryResponse
    ] = None

    faculty: Optional[
        UserResponse
    ] = None

    class Config:

        from_attributes = True


# ============================================================
# SESSION SNAPSHOT RESPONSE
# ============================================================

class SessionSnapshotResponse(BaseModel):

    session: SessionResponse

    doubts: List[DoubtResponse]

    polls: List[PollResponse]

    attendance: List[
        AttendanceRecordResponse
    ]

    attendance_count: int