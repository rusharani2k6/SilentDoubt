import json

from datetime import datetime, timezone
from typing import Optional, List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session as DBSession

from app.database import get_db

from app.models.user import User
from app.models.timetable import TimetableEntry
from app.models.session import Session
from app.models.doubt import Doubt, DoubtUpvote
from app.models.poll import Poll, PollResponse
from app.models.attendance import Attendance
from app.models.notification import Notification

from app.schemas.session import (
    SessionStartRequest,
    SessionResponse,
    SessionSnapshotResponse,
    AttendanceRecordResponse,
)

from app.schemas.doubt import DoubtResponse
from app.schemas.poll import PollResponse as PollResponseSchema

from app.auth_utils import (
    get_current_user,
    require_roles,
)

from app.ws.connection_manager import manager


router = APIRouter(
    prefix="/api/sessions",
    tags=["Sessions"],
)


# ============================================================
# START SESSION
# ============================================================

@router.post(
    "/start",
    response_model=SessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_session(
    start_req: SessionStartRequest,
    current_user: User = Depends(
        require_roles("faculty", "admin")
    ),
    db: DBSession = Depends(get_db),
):

    entry = (
        db.query(TimetableEntry)
        .filter(
            TimetableEntry.id
            == start_req.timetable_entry_id
        )
        .first()
    )

    if not entry:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable entry not found",
        )

    # ========================================================
    # FACULTY AUTHORIZATION
    # ========================================================

    if (
        current_user.role == "faculty"
        and entry.faculty_id != current_user.id
    ):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You can only start sessions "
                "for your assigned timetable entries"
            ),
        )

    # ========================================================
    # CHECK EXISTING ACTIVE SESSION
    # ========================================================

    existing_active = (
        db.query(Session)
        .filter(
            Session.timetable_entry_id == entry.id,
            Session.status == "active",
        )
        .first()
    )

    if existing_active:

        return existing_active

    # ========================================================
    # CREATE NEW SESSION
    # ========================================================

    new_session = Session(
        timetable_entry_id=entry.id,
        faculty_id=current_user.id,
        status="active",
        started_at=datetime.now(timezone.utc),
    )

    db.add(new_session)

    db.commit()

    db.refresh(new_session)

    # ========================================================
    # NOTIFY STUDENTS
    # ========================================================

    students = (
        db.query(User)
        .filter(
            User.role == "student",
            User.section == entry.section,
            User.is_active == True,
        )
        .all()
    )

    for student in students:

        notification = Notification(
            user_id=student.id,
            message=(
                f"Live Session Started: "
                f"{entry.subject} with "
                f"{current_user.name} "
                f"({entry.section})"
            ),
            created_at=datetime.now(timezone.utc),
        )

        db.add(notification)

    db.commit()

    return new_session


# ============================================================
# END SESSION
# ============================================================

@router.post(
    "/{session_id}/end",
    response_model=SessionResponse,
)
async def end_session(
    session_id: int,
    current_user: User = Depends(
        require_roles("faculty", "admin")
    ),
    db: DBSession = Depends(get_db),
):

    session_obj = (
        db.query(Session)
        .filter(
            Session.id == session_id
        )
        .first()
    )

    if not session_obj:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # ========================================================
    # FACULTY AUTHORIZATION
    # ========================================================

    if (
        current_user.role == "faculty"
        and session_obj.faculty_id
        != current_user.id
    ):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You cannot end another "
                "faculty member's session"
            ),
        )

    # ========================================================
    # END SESSION
    # ========================================================

    session_obj.status = "ended"

    session_obj.ended_at = (
        datetime.now(timezone.utc)
    )

    db.commit()

    db.refresh(session_obj)

    # ========================================================
    # BROADCAST SESSION ENDED
    # ========================================================

    await manager.broadcast_session_ended(
        session_id
    )

    return session_obj


# ============================================================
# GET ACTIVE SESSION
# ============================================================

@router.get(
    "/active",
    response_model=Optional[SessionResponse],
)
def get_active_session(
    current_user: User = Depends(
        get_current_user
    ),
    db: DBSession = Depends(get_db),
):

    # ========================================================
    # FACULTY
    # ========================================================

    if current_user.role == "faculty":

        active = (
            db.query(Session)
            .filter(
                Session.faculty_id
                == current_user.id,

                Session.status
                == "active",
            )
            .order_by(
                Session.started_at.desc()
            )
            .first()
        )

        return active

    # ========================================================
    # STUDENT
    # ========================================================

    elif current_user.role == "student":

        if not current_user.section:

            return None

        active = (
            db.query(Session)
            .join(TimetableEntry)
            .filter(
                TimetableEntry.section
                == current_user.section,

                Session.status
                == "active",
            )
            .order_by(
                Session.started_at.desc()
            )
            .first()
        )

        return active

    # ========================================================
    # ADMIN
    # ========================================================

    return (
        db.query(Session)
        .filter(
            Session.status == "active"
        )
        .order_by(
            Session.started_at.desc()
        )
        .first()
    )


# ============================================================
# GET SESSION SNAPSHOT
# ============================================================

@router.get(
    "/{session_id}",
    response_model=SessionSnapshotResponse,
)
def get_session_snapshot(
    session_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: DBSession = Depends(get_db),
):

    # ========================================================
    # FIND SESSION
    # ========================================================

    session_obj = (
        db.query(Session)
        .filter(
            Session.id == session_id
        )
        .first()
    )

    if not session_obj:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # ========================================================
    # DOUBTS
    # ========================================================

    raw_doubts = (
        db.query(Doubt)
        .filter(
            Doubt.session_id == session_id
        )
        .order_by(
            Doubt.bumped_at.desc().nullslast(),
            Doubt.upvote_count.desc(),
            Doubt.created_at.desc(),
        )
        .all()
    )

    # ========================================================
    # CURRENT USER UPVOTES
    # ========================================================

    user_upvotes = set()

    if current_user.role == "student":

        upvotes = (
            db.query(
                DoubtUpvote.doubt_id
            )
            .filter(
                DoubtUpvote.student_id
                == current_user.id
            )
            .all()
        )

        user_upvotes = {
            row[0]
            for row in upvotes
        }

    # ========================================================
    # DOUBT RESPONSE
    # ========================================================

    doubt_responses: List[
        DoubtResponse
    ] = []

    for doubt in raw_doubts:

        # ----------------------------------------------------
        # CHECK AUTHOR
        # ----------------------------------------------------

        is_author = (
            doubt.student_id
            == current_user.id
        )

        # ----------------------------------------------------
        # CHECK UPVOTE
        # ----------------------------------------------------

        has_upvoted = (
            doubt.id
            in user_upvotes
        )

        # ----------------------------------------------------
        # ANONYMOUS DOUBT
        # ----------------------------------------------------

        if doubt.is_anonymous:

            if is_author:

                student_name = (
                    "You (Anonymous)"
                )

                student_id = (
                    current_user.id
                )

            else:

                student_name = (
                    "Anonymous Student"
                )

                student_id = None

        # ----------------------------------------------------
        # NON-ANONYMOUS DOUBT
        # ----------------------------------------------------

        else:

            student_name = (
                doubt.student.name
                if doubt.student
                else "Student"
            )

            student_id = (
                doubt.student_id
            )

        # ----------------------------------------------------
        # CREATE RESPONSE
        # ----------------------------------------------------

        doubt_responses.append(
            DoubtResponse(

                id=doubt.id,

                session_id=doubt.session_id,

                student_id=student_id,

                student_name=student_name,

                text=doubt.text,

                is_anonymous=doubt.is_anonymous,

                status=doubt.status,

                upvote_count=doubt.upvote_count,

                created_at=doubt.created_at,

                bumped_at=doubt.bumped_at,

                # ==========================================
                # FACULTY ANSWER
                # ==========================================

                answer=doubt.answer,

                answered_by=doubt.answered_by,

                answered_at=doubt.answered_at,

                # ==========================================
                # USER SPECIFIC
                # ==========================================

                has_upvoted=has_upvoted,

                is_own=is_author,
            )
        )

    # ========================================================
    # POLLS
    # ========================================================

    raw_polls = (
        db.query(Poll)
        .filter(
            Poll.session_id == session_id
        )
        .order_by(
            Poll.created_at.asc()
        )
        .all()
    )

    poll_responses: List[
        PollResponseSchema
    ] = []

    for poll in raw_polls:

        # ----------------------------------------------------
        # LOAD OPTIONS
        # ----------------------------------------------------

        try:

            options = json.loads(
                poll.options_json
            )

        except Exception:

            options = []

        # ----------------------------------------------------
        # GET RESPONSES
        # ----------------------------------------------------

        responses = (
            db.query(PollResponse)
            .filter(
                PollResponse.poll_id
                == poll.id
            )
            .all()
        )

        total_votes = len(
            responses
        )

        # ----------------------------------------------------
        # INITIAL TALLY
        # ----------------------------------------------------

        tally = {
            option: 0
            for option in options
        }

        # ----------------------------------------------------
        # COUNT VOTES
        # ----------------------------------------------------

        for response in responses:

            if (
                response.selected_option
                in tally
            ):

                tally[
                    response.selected_option
                ] += 1

            else:

                tally[
                    response.selected_option
                ] = 1

        # ----------------------------------------------------
        # PERCENTAGES
        # ----------------------------------------------------

        percentages = {}

        for option in options:

            if total_votes > 0:

                percentages[
                    option
                ] = round(
                    (
                        tally[option]
                        / total_votes
                        * 100
                    ),
                    1,
                )

            else:

                percentages[
                    option
                ] = 0.0

        # ----------------------------------------------------
        # CURRENT USER RESPONSE
        # ----------------------------------------------------

        user_response = None

        for response in responses:

            if (
                response.student_id
                == current_user.id
            ):

                user_response = (
                    response.selected_option
                )

                break

        # ----------------------------------------------------
        # POLL RESPONSE
        # ----------------------------------------------------

        poll_responses.append(
            PollResponseSchema(

                id=poll.id,

                session_id=poll.session_id,

                question=poll.question,

                options=options,

                status=poll.status,

                created_at=poll.created_at,

                total_votes=total_votes,

                tally=tally,

                percentages=percentages,

                user_selected_option=(
                    user_response
                ),
            )
        )

    # ========================================================
    # ATTENDANCE
    # ========================================================

    attendance_records = (
        db.query(Attendance)
        .filter(
            Attendance.session_id
            == session_id
        )
        .order_by(
            Attendance.joined_at.asc()
        )
        .all()
    )

    att_list: List[
        AttendanceRecordResponse
    ] = []

    for attendance in attendance_records:

        # ----------------------------------------------------
        # GET ROLL NUMBER
        # ----------------------------------------------------

        roll_number = "N/A"

        if attendance.student:

            if attendance.student.roll_number:

                roll_number = (
                    attendance.student.roll_number
                )

        # ----------------------------------------------------
        # CREATE ATTENDANCE RESPONSE
        # ----------------------------------------------------

        att_list.append(
            AttendanceRecordResponse(

                id=attendance.id,

                session_id=attendance.session_id,

                student_id=attendance.student_id,

                roll_number=roll_number,

                joined_at=attendance.joined_at,
            )
        )

    # ========================================================
    # RETURN SNAPSHOT
    # ========================================================

    return SessionSnapshotResponse(

        session=SessionResponse.model_validate(
            session_obj
        ),

        doubts=doubt_responses,

        polls=poll_responses,

        attendance=att_list,

        attendance_count=len(
            att_list
        ),
    )