from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AdminClassResponse(BaseModel):
    session_id: int
    subject: str
    section: str
    faculty_name: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    status: str
    doubt_count: int


class AdminDoubtResponse(BaseModel):
    id: int
    session_id: int
    text: str
    is_anonymous: bool
    status: str
    moderation_status: str
    moderation_reason: Optional[str] = None
    created_at: datetime
    upvote_count: int = 0

    student_id: Optional[int] = None
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    student_section: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AdminDoubtAction(BaseModel):
    moderation_status: Optional[str] = None
    moderation_reason: Optional[str] = None
    status: Optional[str] = None
