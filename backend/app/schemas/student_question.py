from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ============================================================
# STUDENT QUESTION BASE
# ============================================================

class StudentQuestionBase(BaseModel):

    subject: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
    )

    is_anonymous: bool = True


# ============================================================
# CREATE STUDENT QUESTION
# ============================================================

class StudentQuestionCreate(StudentQuestionBase):

    faculty_id: int


# ============================================================
# ANSWER QUESTION
# ============================================================

class StudentQuestionAnswer(BaseModel):

    answer: str = Field(
        ...,
        min_length=1,
        max_length=5000,
    )


# ============================================================
# STUDENT QUESTION RESPONSE
# ============================================================

class StudentQuestionResponse(BaseModel):

    id: int

    student_id: Optional[int] = None

    faculty_id: Optional[int] = None

    subject: str

    question: str

    is_anonymous: bool

    answer: Optional[str] = None

    answered_at: Optional[datetime] = None

    status: str

    created_at: datetime

    # --------------------------------------------------------
    # DISPLAY INFORMATION
    # --------------------------------------------------------

    student_name: Optional[str] = None

    faculty_name: Optional[str] = None

    # --------------------------------------------------------
    # PYDANTIC / SQLALCHEMY
    # --------------------------------------------------------

    class Config:
        from_attributes = True