from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    UniqueConstraint,
)

from sqlalchemy.orm import relationship

from app.database import Base


class Doubt(Base):
    __tablename__ = "doubts"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # SESSION / STUDENT
    # ============================================================

    session_id = Column(
        Integer,
        ForeignKey(
            "sessions.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    student_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    # ============================================================
    # DOUBT CONTENT
    # ============================================================

    text = Column(
        Text,
        nullable=False,
    )

    is_anonymous = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    # ============================================================
    # DOUBT STATUS
    # ============================================================

    status = Column(
        String(20),
        default="open",
        nullable=False,
    )

    moderation_status = Column(
        String(20),
        default="normal",
        nullable=False,
    )

    moderation_reason = Column(
        Text,
        nullable=True,
    )

    reviewed_by = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    reviewed_at = Column(
        DateTime,
        nullable=True,
    )

    # ============================================================
    # UPVOTES
    # ============================================================

    upvote_count = Column(
        Integer,
        default=0,
        nullable=False,
    )

    # ============================================================
    # TIMESTAMPS
    # ============================================================

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    bumped_at = Column(
        DateTime,
        nullable=True,
    )

    # ============================================================
    # FACULTY ANSWER
    # ============================================================

    answer = Column(
        Text,
        nullable=True,
    )

    answered_by = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="SET NULL",
        ),
        nullable=True,
    )

    answered_at = Column(
        DateTime,
        nullable=True,
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    session = relationship(
        "Session",
        back_populates="doubts",
    )

    student = relationship(
        "User",
        back_populates="doubts",
        foreign_keys=[student_id],
    )

    reviewer = relationship(
        "User",
        foreign_keys=[reviewed_by],
    )

    # Faculty/Admin who answered the doubt.
    # Explicit foreign_keys avoids ambiguity because
    # doubts already has multiple foreign keys to users.id.
    answerer = relationship(
        "User",
        foreign_keys=[answered_by],
    )

    upvotes = relationship(
        "DoubtUpvote",
        back_populates="doubt",
        cascade="all, delete-orphan",
    )


class DoubtUpvote(Base):
    __tablename__ = "doubt_upvotes"

    # ============================================================
    # PRIMARY KEY
    # ============================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ============================================================
    # DOUBT / STUDENT
    # ============================================================

    doubt_id = Column(
        Integer,
        ForeignKey(
            "doubts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    student_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    # ============================================================
    # PREVENT DUPLICATE UPVOTES
    # ============================================================

    __table_args__ = (
        UniqueConstraint(
            "doubt_id",
            "student_id",
            name="uq_doubt_student_upvote",
        ),
    )

    # ============================================================
    # RELATIONSHIPS
    # ============================================================

    doubt = relationship(
        "Doubt",
        back_populates="upvotes",
    )

    student = relationship(
        "User",
    )