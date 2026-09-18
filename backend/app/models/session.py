from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    timetable_entry_id = Column(
        Integer,
        ForeignKey(
            "timetable_entries.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    faculty_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    status = Column(
        String(20),
        default="active",
        nullable=False,
    )

    started_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    ended_at = Column(
        DateTime,
        nullable=True,
    )

    # --------------------------------------------------------
    # RELATIONSHIPS
    # --------------------------------------------------------

    timetable_entry = relationship(
        "TimetableEntry",
        back_populates="sessions",
    )

    faculty = relationship(
        "User",
        back_populates="faculty_sessions",
    )

    doubts = relationship(
        "Doubt",
        back_populates="session",
        cascade="all, delete-orphan",
    )

    polls = relationship(
        "Poll",
        back_populates="session",
        cascade="all, delete-orphan",
    )

    attendance = relationship(
        "Attendance",
        back_populates="session",
        cascade="all, delete-orphan",
    )