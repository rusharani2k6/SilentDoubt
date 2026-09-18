from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # BASIC USER INFORMATION
    # ============================================================

    name = Column(
        String(100),
        nullable=False,
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash = Column(
        String(255),
        nullable=False,
    )

    role = Column(
        String(20),
        nullable=False,
    )

    section = Column(
        String(50),
        nullable=True,
    )

    # ============================================================
    # STUDENT ROLL NUMBER
    # ============================================================
    # Faculty attendance lo student name badulu
    # roll number display cheyyadaniki use avtundi.
    #
    # Faculty ki roll number avasaram ledu,
    # students ki maatrame CSV dwara populate avtundi.
    # ============================================================

    roll_number = Column(
        String(50),
        nullable=True,
        index=True,
    )

    # ============================================================
    # ACCOUNT STATUS
    # ============================================================

    is_active = Column(
        Boolean,
        default=True,
    )

    # ============================================================
    # TIMESTAMP
    # ============================================================

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    # ------------------------------------------------------------
    # FACULTY TIMETABLE
    # ------------------------------------------------------------

    timetable_entries = relationship(
        "TimetableEntry",
        foreign_keys="TimetableEntry.faculty_id",
        back_populates="faculty",
        cascade="all, delete-orphan",
    )

    # ------------------------------------------------------------
    # FACULTY LIVE SESSIONS
    # ------------------------------------------------------------

    faculty_sessions = relationship(
        "Session",
        foreign_keys="Session.faculty_id",
        back_populates="faculty",
    )

    # ------------------------------------------------------------
    # NOTIFICATIONS
    # ------------------------------------------------------------

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # ------------------------------------------------------------
    # ATTENDANCE
    # ------------------------------------------------------------

    attendance_records = relationship(
        "Attendance",
        back_populates="student",
        cascade="all, delete-orphan",
    )

    # ------------------------------------------------------------
    # LIVE CLASS DOUBTS
    # ------------------------------------------------------------

    doubts = relationship(
        "Doubt",
        foreign_keys="Doubt.student_id",
        back_populates="student",
    )

    # ============================================================
    # ASK FACULTY QUESTIONS
    # ============================================================
    # StudentQuestion table has TWO foreign keys pointing to
    # users.id:
    #
    #   student_id -> users.id
    #   faculty_id -> users.id
    #
    # Therefore explicit foreign_keys are important here to
    # prevent SQLAlchemy AmbiguousForeignKeysError.
    # ============================================================

    student_questions = relationship(
        "StudentQuestion",
        foreign_keys="StudentQuestion.student_id",
        back_populates="student",
    )

    faculty_questions = relationship(
        "StudentQuestion",
        foreign_keys="StudentQuestion.faculty_id",
        back_populates="faculty",
    )