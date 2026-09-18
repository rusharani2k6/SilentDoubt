from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import relationship

from app.database import Base


class StudentQuestion(Base):
    __tablename__ = "student_questions"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # STUDENT
    # ============================================================

    student_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    # ============================================================
    # FACULTY
    # ============================================================

    faculty_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    # ============================================================
    # SUBJECT
    # ============================================================

    subject = Column(
        String(255),
        nullable=False,
        index=True,
    )

    # ============================================================
    # QUESTION
    # ============================================================

    question = Column(
        Text,
        nullable=False,
    )

    # ============================================================
    # ANONYMOUS
    # ============================================================

    is_anonymous = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ============================================================
    # ANSWER
    # ============================================================

    answer = Column(
        Text,
        nullable=True,
    )

    answered_at = Column(
        DateTime,
        nullable=True,
    )

    # ============================================================
    # STATUS
    # ============================================================

    status = Column(
        String(20),
        default="pending",
        nullable=False,
        index=True,
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    student = relationship(
        "User",
        foreign_keys=[student_id],
        back_populates="student_questions",
    )

    faculty = relationship(
        "User",
        foreign_keys=[faculty_id],
        back_populates="faculty_questions",
    )