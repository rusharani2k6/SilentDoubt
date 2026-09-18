from datetime import date
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.models.user import User
from app.models.timetable import TimetableEntry

from app.schemas.timetable import (
    TimetableEntryCreate,
    TimetableEntryUpdate,
    TimetableEntryResponse,
)

from app.auth_utils import (
    get_current_user,
    require_roles,
)


router = APIRouter(
    prefix="/api/timetable",
    tags=["Timetable"],
)


# ============================================================
# GET MY TIMETABLE
# ============================================================

@router.get(
    "/me",
    response_model=List[TimetableEntryResponse],
)
def get_my_timetable(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Faculty:
        Returns classes owned by logged-in faculty.

    Student:
        Returns classes for student's section.

    Admin:
        Returns all timetable entries.
    """

    if current_user.role == "faculty":

        return (
            db.query(TimetableEntry)
            .filter(
                TimetableEntry.faculty_id
                == current_user.id
            )
            .order_by(
                TimetableEntry.class_date.asc(),
                TimetableEntry.day_of_week.asc(),
                TimetableEntry.start_time.asc(),
            )
            .all()
        )

    if current_user.role == "student":

        if not current_user.section:
            return []

        return (
            db.query(TimetableEntry)
            .filter(
                TimetableEntry.section
                == current_user.section
            )
            .order_by(
                TimetableEntry.class_date.asc(),
                TimetableEntry.day_of_week.asc(),
                TimetableEntry.start_time.asc(),
            )
            .all()
        )

    if current_user.role == "admin":

        return (
            db.query(TimetableEntry)
            .order_by(
                TimetableEntry.class_date.asc(),
                TimetableEntry.day_of_week.asc(),
                TimetableEntry.start_time.asc(),
            )
            .all()
        )

    return []


# ============================================================
# GET FACULTY LIST
# ============================================================

@router.get(
    "/faculty-list",
)
def get_faculty_list(
    current_user: User = Depends(
        require_roles("faculty", "admin")
    ),
    db: Session = Depends(get_db),
):
    """
    Returns faculty users.

    This endpoint is kept for compatibility.
    Faculty dashboard now uses manual text input
    for Assigned Faculty.
    """

    faculty = (
        db.query(User)
        .filter(
            User.role == "faculty",
            User.is_active == True,
        )
        .order_by(User.name.asc())
        .all()
    )

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
        }
        for user in faculty
    ]


# ============================================================
# CREATE CLASS
# FACULTY ONLY
# ============================================================

@router.post(
    "",
    response_model=TimetableEntryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_my_timetable_entry(
    entry_in: TimetableEntryCreate,
    current_user: User = Depends(
        require_roles("faculty")
    ),
    db: Session = Depends(get_db),
):
    """
    Logged-in faculty creates a class.

    faculty_id is automatically taken from login.

    Assigned Faculty is only a text field.
    """

    section = entry_in.section.strip()
    subject = entry_in.subject.strip()
    day_of_week = entry_in.day_of_week.strip()
    start_time = entry_in.start_time.strip()
    end_time = entry_in.end_time.strip()

    assigned_faculty_name = (
        entry_in.assigned_faculty_name.strip()
        if entry_in.assigned_faculty_name
        else None
    )

    # --------------------------------------------------------
    # Required validation
    # --------------------------------------------------------

    if not section:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Section is required",
        )

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject is required",
        )

    if not entry_in.class_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Class date is required",
        )

    if not start_time or not end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start time and end time are required",
        )

    # --------------------------------------------------------
    # Validate day
    # --------------------------------------------------------

    allowed_days = {
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    }

    normalized_day = day_of_week.capitalize()

    if normalized_day not in allowed_days:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid day. Allowed values: "
                "Monday, Tuesday, Wednesday, Thursday, "
                "Friday, Saturday, Sunday"
            ),
        )

    # --------------------------------------------------------
    # Validate time
    # --------------------------------------------------------

    try:

        start_hour, start_minute = map(
            int,
            start_time.split(":"),
        )

        end_hour, end_minute = map(
            int,
            end_time.split(":"),
        )

        if not (
            0 <= start_hour <= 23
            and 0 <= start_minute <= 59
            and 0 <= end_hour <= 23
            and 0 <= end_minute <= 59
        ):
            raise ValueError

        start_minutes = (
            start_hour * 60
            + start_minute
        )

        end_minutes = (
            end_hour * 60
            + end_minute
        )

    except Exception:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time must be in HH:MM format",
        )

    if start_minutes >= end_minutes:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )

    # --------------------------------------------------------
    # Duplicate check
    # --------------------------------------------------------

    existing = (
        db.query(TimetableEntry)
        .filter(
            TimetableEntry.faculty_id
            == current_user.id,

            TimetableEntry.class_date
            == entry_in.class_date,

            TimetableEntry.section
            == section,

            TimetableEntry.subject
            == subject,

            TimetableEntry.start_time
            == start_time,

            TimetableEntry.end_time
            == end_time,
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This class already exists "
                "in your timetable"
            ),
        )

    # --------------------------------------------------------
    # Create entry
    # --------------------------------------------------------

    entry = TimetableEntry(

        faculty_id=current_user.id,

        section=section,

        subject=subject,

        day_of_week=normalized_day,

        start_time=start_time,

        end_time=end_time,

        class_date=entry_in.class_date,

        assigned_faculty_name=(
            assigned_faculty_name
        ),
    )

    db.add(entry)

    db.commit()

    db.refresh(entry)

    return entry


# ============================================================
# UPDATE CLASS
# ============================================================

@router.put(
    "/{entry_id}",
    response_model=TimetableEntryResponse,
)
def update_timetable_entry(
    entry_id: int,
    entry_in: TimetableEntryUpdate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    entry = (
        db.query(TimetableEntry)
        .filter(
            TimetableEntry.id == entry_id
        )
        .first()
    )

    if not entry:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable entry not found",
        )

    # Faculty can modify only own class
    if (
        current_user.role == "faculty"
        and entry.faculty_id
        != current_user.id
    ):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot modify this class",
        )

    # Admin may update faculty
    if (
        entry_in.faculty_id is not None
        and current_user.role == "admin"
    ):

        faculty = (
            db.query(User)
            .filter(
                User.id
                == entry_in.faculty_id,
                User.role == "faculty",
            )
            .first()
        )

        if not faculty:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid faculty ID",
            )

        entry.faculty_id = (
            entry_in.faculty_id
        )

    if entry_in.section is not None:

        value = entry_in.section.strip()

        if not value:

            raise HTTPException(
                status_code=400,
                detail="Section is required",
            )

        entry.section = value

    if entry_in.subject is not None:

        value = entry_in.subject.strip()

        if not value:

            raise HTTPException(
                status_code=400,
                detail="Subject is required",
            )

        entry.subject = value

    if entry_in.day_of_week is not None:

        entry.day_of_week = (
            entry_in.day_of_week.strip().capitalize()
        )

    if entry_in.start_time is not None:

        entry.start_time = (
            entry_in.start_time.strip()
        )

    if entry_in.end_time is not None:

        entry.end_time = (
            entry_in.end_time.strip()
        )

    if entry_in.class_date is not None:

        entry.class_date = (
            entry_in.class_date
        )

    if (
        entry_in.assigned_faculty_name
        is not None
    ):

        value = (
            entry_in.assigned_faculty_name.strip()
        )

        entry.assigned_faculty_name = (
            value or None
        )

    db.commit()

    db.refresh(entry)

    return entry


# ============================================================
# DELETE CLASS
# ============================================================

@router.delete(
    "/{entry_id}",
)
def delete_timetable_entry(
    entry_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):

    entry = (
        db.query(TimetableEntry)
        .filter(
            TimetableEntry.id == entry_id
        )
        .first()
    )

    if not entry:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable entry not found",
        )

    if (
        current_user.role == "faculty"
        and entry.faculty_id
        != current_user.id
    ):

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot delete this class",
        )

    if current_user.role not in [
        "faculty",
        "admin",
    ]:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )

    db.delete(entry)

    db.commit()

    return {
        "message": (
            "Timetable entry deleted successfully"
        ),
        "id": entry_id,
    }