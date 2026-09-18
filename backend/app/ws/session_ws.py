import json

from datetime import datetime, timezone
from typing import Optional

from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
    Query,
    status,
)

from sqlalchemy.orm import Session as DBSession

from app.database import SessionLocal
from app.auth_utils import decode_token

from app.models.user import User
from app.models.session import Session
from app.models.doubt import (
    Doubt,
    DoubtUpvote,
)
from app.models.poll import (
    Poll,
    PollResponse,
)
from app.models.attendance import Attendance

from app.ws.connection_manager import manager


router = APIRouter()


# ============================================================
# DOUBT DICTIONARY
# ============================================================

def get_doubt_dict(
    doubt: Doubt,
    db: DBSession,
) -> dict:

    # --------------------------------------------------------
    # GET STUDENT NAME
    # --------------------------------------------------------

    student_name = (
        doubt.student.name
        if doubt.student
        else "Anonymous Student"
    )

    # --------------------------------------------------------
    # RETURN COMPLETE DOUBT
    # --------------------------------------------------------

    return {

        # ====================================================
        # BASIC INFORMATION
        # ====================================================

        "id": doubt.id,

        "session_id": doubt.session_id,

        "student_id": doubt.student_id,

        "student_name": (
            student_name
            if not doubt.is_anonymous
            else "Anonymous Student"
        ),

        "text": doubt.text,

        "is_anonymous": doubt.is_anonymous,

        # ====================================================
        # STATUS
        # ====================================================

        "status": doubt.status,

        "upvote_count": (
            doubt.upvote_count
        ),

        # ====================================================
        # CREATED / BUMPED
        # ====================================================

        "created_at": (
            doubt.created_at.isoformat()
            if doubt.created_at
            else None
        ),

        "bumped_at": (
            doubt.bumped_at.isoformat()
            if doubt.bumped_at
            else None
        ),

        # ====================================================
        # FACULTY ANSWER
        # ====================================================

        "answer": doubt.answer,

        "answered_by": (
            doubt.answered_by
        ),

        "answered_at": (
            doubt.answered_at.isoformat()
            if doubt.answered_at
            else None
        ),
    }


# ============================================================
# POLL TALLY
# ============================================================

def get_poll_tally(
    poll: Poll,
    db: DBSession,
):

    try:

        options = json.loads(
            poll.options_json
        )

    except Exception:

        options = []

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

    tally = {
        opt: 0
        for opt in options
    }

    for response in responses:

        if response.selected_option in tally:

            tally[
                response.selected_option
            ] += 1

        else:

            tally[
                response.selected_option
            ] = 1

    percentages = {}

    for opt in options:

        percentages[opt] = (

            round(
                (
                    tally[opt]
                    / total_votes
                    * 100
                ),
                1,
            )

            if total_votes > 0

            else 0.0
        )

    return (
        tally,
        percentages,
        total_votes,
        options,
    )


# ============================================================
# SESSION WEBSOCKET
# ============================================================

@router.websocket(
    "/ws/session/{session_id}"
)
async def websocket_session_endpoint(
    websocket: WebSocket,
    session_id: int,
    token: Optional[str] = Query(None),
):

    # ========================================================
    # AUTHENTICATE
    # ========================================================

    if not token:

        auth_header = (
            websocket.headers.get(
                "authorization"
            )
            or websocket.headers.get(
                "sec-websocket-protocol"
            )
        )

        if (
            auth_header
            and auth_header.startswith(
                "Bearer "
            )
        ):

            token = auth_header.split(
                " ",
                1,
            )[1]

        elif auth_header:

            token = auth_header

    # --------------------------------------------------------
    # NO TOKEN
    # --------------------------------------------------------

    if not token:

        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION
        )

        return

    # ========================================================
    # DECODE TOKEN
    # ========================================================

    payload = decode_token(
        token
    )

    if not payload:

        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION
        )

        return

    # ========================================================
    # GET USER ID
    # ========================================================

    user_id = (
        payload.get("sub")
        or payload.get("user_id")
    )

    if not user_id:

        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION
        )

        return

    # ========================================================
    # DATABASE
    # ========================================================

    db: DBSession = SessionLocal()

    try:

        # ====================================================
        # CONVERT USER ID
        # ====================================================

        try:

            numeric_user_id = int(
                user_id
            )

        except (
            TypeError,
            ValueError,
        ):

            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION
            )

            return

        # ====================================================
        # GET USER
        # ====================================================

        user = (
            db.query(User)
            .filter(
                User.id
                == numeric_user_id
            )
            .first()
        )

        # ====================================================
        # GET SESSION
        # ====================================================

        session_obj = (
            db.query(Session)
            .filter(
                Session.id
                == session_id
            )
            .first()
        )

        # ====================================================
        # VALIDATE
        # ====================================================

        if (
            not user
            or not session_obj
        ):

            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION
            )

            return

        # ====================================================
        # CONNECT TO SESSION ROOM
        # ====================================================

        await manager.connect(
            session_id=session_id,

            websocket=websocket,

            user_id=user.id,

            user_name=user.name,

            role=user.role,
        )

        # ====================================================
        # RECORD ATTENDANCE
        # ====================================================

        if user.role == "student":

            existing_att = (
                db.query(Attendance)
                .filter(

                    Attendance.session_id
                    == session_id,

                    Attendance.student_id
                    == user.id,
                )
                .first()
            )

            attendance_created = False

            # ------------------------------------------------
            # CREATE ATTENDANCE ONLY FIRST TIME
            # ------------------------------------------------

            if not existing_att:

                new_att = Attendance(

                    session_id=session_id,

                    student_id=user.id,

                    joined_at=datetime.now(
                        timezone.utc
                    ),
                )

                db.add(
                    new_att
                )

                db.commit()

                db.refresh(
                    new_att
                )

                attendance_record = (
                    new_att
                )

                attendance_created = True

            else:

                attendance_record = (
                    existing_att
                )

            # ------------------------------------------------
            # COUNT ATTENDANCE
            # ------------------------------------------------

            attendance_count = (
                db.query(Attendance)
                .filter(
                    Attendance.session_id
                    == session_id
                )
                .count()
            )

            # ------------------------------------------------
            # BROADCAST NEW ATTENDANCE
            # ------------------------------------------------

            if attendance_created:

                await manager.broadcast_attendance(

                    session_id,

                    {

                        "attendance_id":
                            attendance_record.id,

                        "student_id":
                            user.id,

                        "roll_number": (

                            user.roll_number
                            if user.roll_number
                            else "N/A"
                        ),

                        "joined_at": (

                            attendance_record
                            .joined_at
                            .isoformat()
                        ),

                        "attendance_count":
                            attendance_count,
                    },
                )

        # ====================================================
        # MESSAGE LOOP
        # ====================================================

        while True:

            raw_data = (
                await websocket.receive_text()
            )

            # ------------------------------------------------
            # PARSE JSON
            # ------------------------------------------------

            try:

                msg = json.loads(
                    raw_data
                )

            except Exception:

                continue

            event_type = (
                msg.get("type")
            )

            # =================================================
            # JOIN
            # =================================================

            if event_type == "join":

                attendance_count = (
                    db.query(Attendance)
                    .filter(
                        Attendance.session_id
                        == session_id
                    )
                    .count()
                )

                await manager.send_personal_message(

                    websocket,

                    {

                        "type":
                            "joined.ack",

                        "session_id":
                            session_id,

                        "attendance_count":
                            attendance_count,
                    },
                )

            # =================================================
            # DOUBT SUBMIT
            # =================================================

            elif event_type == "doubt.submit":

                text = (
                    msg.get("text")
                    or ""
                ).strip()

                if not text:

                    continue

                is_anonymous = bool(
                    msg.get(
                        "is_anonymous",
                        True,
                    )
                )

                # ------------------------------------------------
                # CREATE DOUBT
                # ------------------------------------------------

                doubt = Doubt(

                    session_id=session_id,

                    student_id=user.id,

                    text=text,

                    is_anonymous=is_anonymous,

                    status="open",

                    upvote_count=0,

                    created_at=datetime.now(
                        timezone.utc
                    ),
                )

                db.add(
                    doubt
                )

                db.commit()

                db.refresh(
                    doubt
                )

                # ------------------------------------------------
                # CREATE PAYLOAD
                # ------------------------------------------------

                doubt_dict = (
                    get_doubt_dict(
                        doubt,
                        db,
                    )
                )

                # ------------------------------------------------
                # BROADCAST NEW DOUBT
                # ------------------------------------------------

                await manager.broadcast_doubt(

                    session_id=session_id,

                    event_type="doubt.new",

                    doubt_dict=doubt_dict,

                    author_id=user.id,

                    is_anonymous=is_anonymous,
                )

            # =================================================
            # DOUBT UPVOTE
            # =================================================

            elif event_type == "doubt.upvote":

                doubt_id = (
                    msg.get(
                        "doubt_id"
                    )
                )

                if not doubt_id:

                    continue

                doubt = (
                    db.query(Doubt)
                    .filter(

                        Doubt.id
                        == doubt_id,

                        Doubt.session_id
                        == session_id,
                    )
                    .first()
                )

                if not doubt:

                    continue

                # ------------------------------------------------
                # EXISTING UPVOTE
                # ------------------------------------------------

                existing_upvote = (
                    db.query(
                        DoubtUpvote
                    )
                    .filter(

                        DoubtUpvote.doubt_id
                        == doubt_id,

                        DoubtUpvote.student_id
                        == user.id,
                    )
                    .first()
                )

                if existing_upvote:

                    db.delete(
                        existing_upvote
                    )

                else:

                    new_upvote = (
                        DoubtUpvote(

                            doubt_id=doubt_id,

                            student_id=user.id,
                        )
                    )

                    db.add(
                        new_upvote
                    )

                db.commit()

                # ------------------------------------------------
                # COUNT UPVOTES
                # ------------------------------------------------

                count = (
                    db.query(
                        DoubtUpvote
                    )
                    .filter(

                        DoubtUpvote.doubt_id
                        == doubt_id
                    )
                    .count()
                )

                doubt.upvote_count = (
                    count
                )

                db.commit()

                db.refresh(
                    doubt
                )

                doubt_dict = (
                    get_doubt_dict(
                        doubt,
                        db,
                    )
                )

                await manager.broadcast_doubt(

                    session_id=session_id,

                    event_type="doubt.updated",

                    doubt_dict=doubt_dict,

                    author_id=(
                        doubt.student_id
                        or 0
                    ),

                    is_anonymous=(
                        doubt.is_anonymous
                    ),
                )

            # =================================================
            # DOUBT BUMP
            # =================================================

            elif event_type == "doubt.bump":

                doubt_id = (
                    msg.get(
                        "doubt_id"
                    )
                )

                if not doubt_id:

                    continue

                doubt = (
                    db.query(Doubt)
                    .filter(

                        Doubt.id
                        == doubt_id,

                        Doubt.session_id
                        == session_id,
                    )
                    .first()
                )

                if (

                    not doubt

                    or doubt.status
                    == "resolved"

                ):

                    continue

                doubt.bumped_at = (
                    datetime.now(
                        timezone.utc
                    )
                )

                db.commit()

                db.refresh(
                    doubt
                )

                doubt_dict = (
                    get_doubt_dict(
                        doubt,
                        db,
                    )
                )

                await manager.broadcast_doubt(

                    session_id=session_id,

                    event_type="doubt.updated",

                    doubt_dict=doubt_dict,

                    author_id=(
                        doubt.student_id
                        or 0
                    ),

                    is_anonymous=(
                        doubt.is_anonymous
                    ),
                )

            # =================================================
            # DOUBT RESOLVE
            # =================================================

            elif event_type == "doubt.resolve":

                # ------------------------------------------------
                # ONLY FACULTY / ADMIN
                # ------------------------------------------------

                if user.role not in [
                    "faculty",
                    "admin",
                ]:

                    continue

                doubt_id = (
                    msg.get(
                        "doubt_id"
                    )
                )

                if not doubt_id:

                    continue

                doubt = (
                    db.query(Doubt)
                    .filter(

                        Doubt.id
                        == doubt_id,

                        Doubt.session_id
                        == session_id,
                    )
                    .first()
                )

                if not doubt:

                    continue

                # ------------------------------------------------
                # RESOLVE
                # ------------------------------------------------

                doubt.status = (
                    "resolved"
                )

                db.commit()

                db.refresh(
                    doubt
                )

                doubt_dict = (
                    get_doubt_dict(
                        doubt,
                        db,
                    )
                )

                await manager.broadcast_doubt(

                    session_id=session_id,

                    event_type="doubt.updated",

                    doubt_dict=doubt_dict,

                    author_id=(
                        doubt.student_id
                        or 0
                    ),

                    is_anonymous=(
                        doubt.is_anonymous
                    ),
                )

            # =================================================
            # DOUBT ANSWER
            # =================================================

            elif event_type == "doubt.answer":

                # ------------------------------------------------
                # ONLY FACULTY / ADMIN CAN ANSWER
                # ------------------------------------------------

                if user.role not in [
                    "faculty",
                    "admin",
                ]:

                    continue

                # ------------------------------------------------
                # GET DOUBT ID
                # ------------------------------------------------

                doubt_id = (
                    msg.get(
                        "doubt_id"
                    )
                )

                # ------------------------------------------------
                # GET ANSWER
                # ------------------------------------------------

                answer = (
                    msg.get("answer")
                    or ""
                ).strip()

                # ------------------------------------------------
                # VALIDATION
                # ------------------------------------------------

                if (
                    not doubt_id
                    or not answer
                ):

                    continue

                # ------------------------------------------------
                # FIND DOUBT
                # ------------------------------------------------

                doubt = (
                    db.query(Doubt)
                    .filter(

                        Doubt.id
                        == doubt_id,

                        Doubt.session_id
                        == session_id,
                    )
                    .first()
                )

                if not doubt:

                    continue

                # =================================================
                # SAVE ANSWER TO DATABASE
                # =================================================

                doubt.answer = (
                    answer
                )

                doubt.answered_by = (
                    user.id
                )

                doubt.answered_at = (
                    datetime.now(
                        timezone.utc
                    )
                )

                # ------------------------------------------------
                # MARK AS RESOLVED
                # ------------------------------------------------

                doubt.status = (
                    "resolved"
                )

                # ------------------------------------------------
                # COMMIT
                # ------------------------------------------------

                db.commit()

                db.refresh(
                    doubt
                )

                # =================================================
                # CREATE UPDATED DOUBT PAYLOAD
                # =================================================

                doubt_dict = (
                    get_doubt_dict(
                        doubt,
                        db,
                    )
                )

                # =================================================
                # BROADCAST ANSWER
                # =================================================

                await manager.broadcast_doubt(

                    session_id=session_id,

                    event_type="doubt.answered",

                    doubt_dict=doubt_dict,

                    author_id=user.id,

                    is_anonymous=False,
                )

            # =================================================
            # POLL CREATE
            # =================================================

            elif event_type == "poll.create":

                if user.role not in [
                    "faculty",
                    "admin",
                ]:

                    continue

                question = (
                    msg.get(
                        "question"
                    )
                    or ""
                ).strip()

                options = (
                    msg.get(
                        "options"
                    )
                    or []
                )

                if (
                    not question
                    or len(options) < 2
                ):

                    continue

                clean_options = [

                    str(opt).strip()

                    for opt in options

                    if str(opt).strip()
                ]

                if len(
                    clean_options
                ) < 2:

                    continue

                poll = Poll(

                    session_id=session_id,

                    question=question,

                    options_json=json.dumps(
                        clean_options
                    ),

                    status="open",

                    created_at=datetime.now(
                        timezone.utc
                    ),
                )

                db.add(
                    poll
                )

                db.commit()

                db.refresh(
                    poll
                )

                (
                    tally,
                    percentages,
                    total_votes,
                    opts,
                ) = get_poll_tally(
                    poll,
                    db,
                )

                poll_dict = {

                    "id":
                        poll.id,

                    "session_id":
                        poll.session_id,

                    "question":
                        poll.question,

                    "options":
                        opts,

                    "status":
                        poll.status,

                    "created_at": (

                        poll.created_at.isoformat()

                        if poll.created_at

                        else None
                    ),

                    "total_votes":
                        total_votes,

                    "tally":
                        tally,

                    "percentages":
                        percentages,
                }

                await manager.broadcast_poll_new(

                    session_id,

                    poll_dict,
                )

            # =================================================
            # POLL RESPOND
            # =================================================

            elif event_type == "poll.respond":

                poll_id = (
                    msg.get(
                        "poll_id"
                    )
                )

                option = (
                    msg.get(
                        "option"
                    )
                )

                if (
                    not poll_id
                    or not option
                ):

                    continue

                poll = (
                    db.query(Poll)
                    .filter(

                        Poll.id
                        == poll_id,

                        Poll.session_id
                        == session_id,
                    )
                    .first()
                )

                if (
                    not poll
                    or poll.status
                    != "open"
                ):

                    continue

                # ------------------------------------------------
                # VALIDATE OPTION
                # ------------------------------------------------

                try:

                    poll_options = (
                        json.loads(
                            poll.options_json
                        )
                    )

                except Exception:

                    poll_options = []

                if (
                    option
                    not in poll_options
                ):

                    continue

                # ------------------------------------------------
                # EXISTING RESPONSE
                # ------------------------------------------------

                existing_resp = (
                    db.query(
                        PollResponse
                    )
                    .filter(

                        PollResponse.poll_id
                        == poll_id,

                        PollResponse.student_id
                        == user.id,
                    )
                    .first()
                )

                if existing_resp:

                    existing_resp.selected_option = (
                        option
                    )

                else:

                    new_resp = (
                        PollResponse(

                            poll_id=poll_id,

                            student_id=user.id,

                            selected_option=option,
                        )
                    )

                    db.add(
                        new_resp
                    )

                db.commit()

                (
                    tally,
                    percentages,
                    total_votes,
                    _,
                ) = get_poll_tally(
                    poll,
                    db,
                )

                await manager.broadcast_poll_result(

                    session_id=session_id,

                    poll_id=poll.id,

                    status=poll.status,

                    tally=tally,

                    percentages=percentages,

                    total_votes=total_votes,
                )

            # =================================================
            # POLL CLOSE
            # =================================================

            elif event_type == "poll.close":

                if user.role not in [
                    "faculty",
                    "admin",
                ]:

                    continue

                poll_id = (
                    msg.get(
                        "poll_id"
                    )
                )

                if not poll_id:

                    continue

                poll = (
                    db.query(Poll)
                    .filter(

                        Poll.id
                        == poll_id,

                        Poll.session_id
                        == session_id,
                    )
                    .first()
                )

                if not poll:

                    continue

                poll.status = (
                    "closed"
                )

                db.commit()

                db.refresh(
                    poll
                )

                (
                    tally,
                    percentages,
                    total_votes,
                    _,
                ) = get_poll_tally(
                    poll,
                    db,
                )

                await manager.broadcast_poll_result(

                    session_id=session_id,

                    poll_id=poll.id,

                    status="closed",

                    tally=tally,

                    percentages=percentages,

                    total_votes=total_votes,
                )

            # =================================================
            # UNKNOWN EVENT
            # =================================================

            else:

                print(
                    "Unknown WebSocket event: "
                    f"{event_type}"
                )

    # ========================================================
    # DISCONNECT
    # ========================================================

    except WebSocketDisconnect:

        manager.disconnect(

            session_id,

            websocket,
        )

    # ========================================================
    # OTHER ERROR
    # ========================================================

    except Exception as e:

        print(
            "WebSocket error:",
            str(e),
        )

        try:

            await websocket.close(
                code=1011
            )

        except Exception:

            pass

        manager.disconnect(

            session_id,

            websocket,
        )

    # ========================================================
    # CLOSE DATABASE
    # ========================================================

    finally:

        db.close()