from pydantic import BaseModel

from typing import Optional, List

from datetime import datetime


# ============================================================
# DOUBT BASE
# ============================================================

class DoubtBase(BaseModel):

    text: str

    is_anonymous: bool = True


# ============================================================
# CREATE DOUBT
# ============================================================

class DoubtCreate(DoubtBase):

    pass


# ============================================================
# DOUBT RESPONSE
# ============================================================

class DoubtResponse(DoubtBase):

    id: int

    session_id: int

    student_id: Optional[int] = None

    student_name: Optional[str] = None

    status: str

    upvote_count: int

    created_at: datetime

    bumped_at: Optional[datetime] = None

    # ========================================================
    # FACULTY ANSWER
    # ========================================================

    answer: Optional[str] = None

    answered_by: Optional[int] = None

    answered_at: Optional[datetime] = None

    # ========================================================
    # USER-SPECIFIC INFORMATION
    # ========================================================

    has_upvoted: Optional[bool] = False

    is_own: Optional[bool] = False

    # ========================================================
    # PYDANTIC / SQLALCHEMY
    # ========================================================

    class Config:

        from_attributes = True


# ============================================================
# DOUBT UPVOTE RESPONSE
# ============================================================

class DoubtUpvoteResponse(BaseModel):

    doubt_id: int

    upvote_count: int

    has_upvoted: bool