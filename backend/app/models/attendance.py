from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)

from sqlalchemy.orm import relationship

from app.database import Base


class Attendance(Base):

    __tablename__ = "attendance"

    # ========================================================
    # PRIMARY KEY
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ========================================================
    # SESSION
    # ========================================================

    session_id = Column(
        Integer,
        ForeignKey(
            "sessions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    # ========================================================
    # STUDENT
    # ========================================================

    student_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    # ========================================================
    # JOIN TIME
    # ========================================================

    joined_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ========================================================
    # UNIQUE ATTENDANCE
    # ========================================================

    __table_args__ = (
        UniqueConstraint(
            "session_id",
            "student_id",
            name="uq_session_student_attendance",
        ),
    )

    # ========================================================
    # RELATIONSHIPS
    # ========================================================

    session = relationship(
        "Session",
        back_populates="attendance",
    )

    student = relationship(
        "User",
        back_populates="attendance_records",
    )