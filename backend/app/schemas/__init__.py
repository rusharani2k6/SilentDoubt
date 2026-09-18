from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserBase, UserCreate, UserUpdate, UserResponse
from app.schemas.timetable import TimetableEntryBase, TimetableEntryCreate, TimetableEntryUpdate, TimetableEntryResponse
from app.schemas.session import SessionStartRequest, SessionResponse, SessionSnapshotResponse, AttendanceRecordResponse
from app.schemas.doubt import DoubtBase, DoubtCreate, DoubtResponse, DoubtUpvoteResponse
from app.schemas.poll import PollCreate, PollResponseSubmit, PollResponse
from app.schemas.notification import NotificationResponse

__all__ = [
    "LoginRequest",
    "TokenResponse",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "TimetableEntryBase",
    "TimetableEntryCreate",
    "TimetableEntryUpdate",
    "TimetableEntryResponse",
    "SessionStartRequest",
    "SessionResponse",
    "SessionSnapshotResponse",
    "AttendanceRecordResponse",
    "DoubtBase",
    "DoubtCreate",
    "DoubtResponse",
    "DoubtUpvoteResponse",
    "PollCreate",
    "PollResponseSubmit",
    "PollResponse",
    "NotificationResponse",
]
