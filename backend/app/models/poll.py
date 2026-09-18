from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Poll(Base):
    __tablename__ = "polls"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    question = Column(String(500), nullable=False)
    options_json = Column(Text, nullable=False)  # JSON array string e.g. '["A","B","C"]'
    status = Column(String(20), default="open", nullable=False)  # "open", "closed"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    session = relationship("Session", back_populates="polls")
    responses = relationship("PollResponse", back_populates="poll", cascade="all, delete-orphan")


class PollResponse(Base):
    __tablename__ = "poll_responses"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    selected_option = Column(String(255), nullable=False)

    __table_args__ = (
        UniqueConstraint("poll_id", "student_id", name="uq_poll_student_response"),
    )

    poll = relationship("Poll", back_populates="responses")
    student = relationship("User")
