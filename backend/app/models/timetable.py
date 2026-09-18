from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship

from app.database import Base


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(Integer, primary_key=True, index=True)

    # Faculty who created/owns the class
    faculty_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    section = Column(
        String(50),
        index=True,
        nullable=False,
    )

    subject = Column(
        String(100),
        nullable=False,
    )

    day_of_week = Column(
        String(20),
        nullable=False,
    )

    start_time = Column(
        String(10),
        nullable=False,
    )

    end_time = Column(
        String(10),
        nullable=False,
    )

    # Specific date of the class
    class_date = Column(
        Date,
        nullable=True,
        index=True,
    )

    # Optional faculty name entered manually
    assigned_faculty_name = Column(
        String(100),
        nullable=True,
    )

    # ---------------------------------------------------------
    # Relationships
    # ---------------------------------------------------------

    faculty = relationship(
        "User",
        back_populates="timetable_entries",
        foreign_keys=[faculty_id],
    )

    sessions = relationship(
        "Session",
        back_populates="timetable_entry",
        cascade="all, delete-orphan",
    )