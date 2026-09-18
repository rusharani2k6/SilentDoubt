from typing import List, Optional
from datetime import datetime, timezone

from sqlalchemy import func
import csv
import io

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
    UploadFile,
    File,
)

from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.timetable import TimetableEntry
from app.models.session import Session as ClassSession
from app.models.doubt import Doubt

from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
)

from app.schemas.admin_doubt import (
    AdminClassResponse,
    AdminDoubtResponse,
    AdminDoubtAction,
)

from app.auth_utils import (
    require_roles,
    get_password_hash,
)


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
    dependencies=[Depends(require_roles("admin"))],
)


# ============================================================
# USERS
# ============================================================


@router.get(
    "/users",
    response_model=List[UserResponse],
)
def list_users(
    role: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):

    query = db.query(User)

    if role:

        if role not in [
            "student",
            "faculty",
            "admin",
        ]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role",
            )

        query = query.filter(
            User.role == role
        )

    return (
        query
        .order_by(User.id.asc())
        .all()
    )


# ============================================================
# CREATE SINGLE USER
# ============================================================


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):

    email_clean = (
        user_in.email
        .lower()
        .strip()
    )

    existing = (
        db.query(User)
        .filter(
            User.email == email_clean
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"User with email "
                f"'{email_clean}' already exists"
            ),
        )

    if user_in.role not in [
        "faculty",
        "student",
    ]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Admin can create only "
                "faculty or student users"
            ),
        )

    user = User(
        name=user_in.name.strip(),

        email=email_clean,

        password_hash=get_password_hash(
            user_in.password
        ),

        role=user_in.role,

        section=(
            user_in.section.strip()
            if user_in.section
            else None
        ),

        # ====================================================
        # ROLL NUMBER
        # ====================================================
        roll_number=(
            user_in.roll_number.strip()
            if user_in.roll_number
            else None
        ),

        is_active=(
            user_in.is_active
            if user_in.is_active is not None
            else True
        ),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ============================================================
# BULK CSV UPLOAD
# ============================================================


@router.post(
    "/users/bulk-upload"
)
async def bulk_upload_users(
    file: UploadFile = File(...),
    section: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):

    """
    Bulk upload Faculty or Student users using CSV.

    Faculty CSV:
        Name
        Official mail id
        Temporary password

    Student CSV:
        Rollno
        First Name
        Official Email (College domain)
        passwords

    Example:
        /api/admin/users/bulk-upload?section=4-CSM-C
    """

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select a CSV file",
        )

    if not file.filename.lower().endswith(
        ".csv"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are allowed",
        )

    try:

        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV file is empty",
            )

        text = contents.decode(
            "utf-8-sig"
        )

        reader = csv.DictReader(
            io.StringIO(text)
        )

        if not reader.fieldnames:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "CSV file does not "
                    "contain headers"
                ),
            )

        headers = [
            header.strip()
            for header in reader.fieldnames
            if header
        ]

    except UnicodeDecodeError:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "CSV must be saved as UTF-8 format"
            ),
        )

    header_set = set(headers)

    faculty_csv = (
        "Name" in header_set
        and "Official mail id" in header_set
        and "Temporary password" in header_set
    )

    student_csv = (
        "Rollno" in header_set
        and "First Name" in header_set
        and "Official Email (College domain)" in header_set
        and "passwords" in header_set
    )

    if not faculty_csv and not student_csv:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid CSV format. "
                "Expected Faculty or Student CSV."
            ),
        )

    role = (
        "faculty"
        if faculty_csv
        else "student"
    )

    total_rows = 0
    created_count = 0
    skipped_count = 0
    error_count = 0

    skipped_users = []
    errors = []

    for row_number, raw_row in enumerate(
        reader,
        start=2,
    ):

        total_rows += 1

        row = {}

        for key, value in raw_row.items():

            if key:

                clean_key = key.strip()

                clean_value = (
                    value.strip()
                    if isinstance(value, str)
                    else ""
                )

                row[clean_key] = clean_value

        try:

            # =================================================
            # FACULTY
            # =================================================

            if role == "faculty":

                name = row.get(
                    "Name",
                    "",
                ).strip()

                email = row.get(
                    "Official mail id",
                    "",
                ).strip().lower()

                password = row.get(
                    "Temporary password",
                    "",
                ).strip()

                # Faculty ki roll number undadu
                roll_number = None

            # =================================================
            # STUDENT
            # =================================================

            else:

                # ---------------------------------------------
                # IMPORTANT:
                # CSV Rollno ni read chestunnam
                # ---------------------------------------------

                roll_number = row.get(
                    "Rollno",
                    "",
                ).strip()

                name = row.get(
                    "First Name",
                    "",
                ).strip()

                email = row.get(
                    "Official Email (College domain)",
                    "",
                ).strip().lower()

                password = row.get(
                    "passwords",
                    "",
                ).strip()

            # =================================================
            # VALIDATION
            # =================================================

            if not name:

                errors.append({
                    "row": row_number,
                    "reason": "Name is missing",
                })

                error_count += 1
                continue

            if not email:

                errors.append({
                    "row": row_number,
                    "reason": "Email is missing",
                })

                error_count += 1
                continue

            if not password:

                errors.append({
                    "row": row_number,
                    "reason": "Password is missing",
                })

                error_count += 1
                continue

            # =================================================
            # STUDENT ROLL NUMBER VALIDATION
            # =================================================

            if role == "student" and not roll_number:

                errors.append({
                    "row": row_number,
                    "reason": "Rollno is missing",
                })

                error_count += 1
                continue

            # =================================================
            # DUPLICATE EMAIL
            # =================================================

            existing = (
                db.query(User)
                .filter(
                    User.email == email
                )
                .first()
            )

            if existing:

                skipped_count += 1

                skipped_users.append({
                    "row": row_number,
                    "name": name,
                    "email": email,
                    "reason": (
                        "Email already exists"
                    ),
                })

                continue

            # =================================================
            # DUPLICATE ROLL NUMBER
            # =================================================

            if (
                role == "student"
                and roll_number
            ):

                existing_roll = (
                    db.query(User)
                    .filter(
                        User.roll_number
                        == roll_number
                    )
                    .first()
                )

                if existing_roll:

                    skipped_count += 1

                    skipped_users.append({
                        "row": row_number,
                        "name": name,
                        "email": email,
                        "roll_number": roll_number,
                        "reason": (
                            "Roll number already exists"
                        ),
                    })

                    continue

            # =================================================
            # SECTION
            # =================================================

            user_section = (
                section.strip()
                if section
                else None
            )

            # =================================================
            # CREATE USER
            # =================================================

            user = User(
                name=name,

                email=email,

                password_hash=get_password_hash(
                    password
                ),

                role=role,

                section=user_section,

                # ---------------------------------------------
                # IMPORTANT:
                # Save Rollno into database
                # ---------------------------------------------
                roll_number=(
                    roll_number
                    if role == "student"
                    else None
                ),

                is_active=True,
            )

            db.add(user)

            created_count += 1

        except Exception as row_error:

            error_count += 1

            errors.append({
                "row": row_number,
                "reason": str(row_error),
            })

    # ========================================================
    # SAVE
    # ========================================================

    try:

        db.commit()

    except Exception as commit_error:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=(
                "Failed to save users to database: "
                f"{str(commit_error)}"
            ),
        )

    return {
        "success": True,

        "message": (
            f"{created_count} "
            f"{role} users imported successfully"
        ),

        "role": role,

        "total_rows": total_rows,

        "created": created_count,

        "skipped": skipped_count,

        "errors": error_count,

        "skipped_users": skipped_users,

        "error_rows": errors,
    }


# ============================================================
# UPDATE USER
# ============================================================


@router.put(
    "/users/{user_id}",
    response_model=UserResponse,
)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # --------------------------------------------------------
    # EMAIL
    # --------------------------------------------------------

    if user_in.email is not None:

        email_clean = (
            user_in.email
            .lower()
            .strip()
        )

        existing = (
            db.query(User)
            .filter(
                User.email == email_clean,
                User.id != user_id,
            )
            .first()
        )

        if existing:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken",
            )

        user.email = email_clean

    # --------------------------------------------------------
    # NAME
    # --------------------------------------------------------

    if user_in.name is not None:
        user.name = user_in.name.strip()

    # --------------------------------------------------------
    # ROLE
    # --------------------------------------------------------

    if user_in.role is not None:

        if user_in.role not in [
            "faculty",
            "student",
        ]:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Admin can manage only "
                    "faculty and student roles"
                ),
            )

        user.role = user_in.role

    # --------------------------------------------------------
    # SECTION
    # --------------------------------------------------------

    if user_in.section is not None:

        user.section = (
            user_in.section.strip()
            if user_in.section
            else None
        )

    # --------------------------------------------------------
    # ROLL NUMBER
    # --------------------------------------------------------

    if user_in.roll_number is not None:

        roll_number = (
            user_in.roll_number
            .strip()
        )

        if roll_number:

            existing_roll = (
                db.query(User)
                .filter(
                    User.roll_number
                    == roll_number,
                    User.id != user_id,
                )
                .first()
            )

            if existing_roll:

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Roll number already exists"
                    ),
                )

            user.roll_number = roll_number

        else:

            user.roll_number = None

    # --------------------------------------------------------
    # PASSWORD
    # --------------------------------------------------------

    if (
        user_in.password is not None
        and user_in.password.strip()
    ):

        user.password_hash = (
            get_password_hash(
                user_in.password.strip()
            )
        )

    # --------------------------------------------------------
    # ACTIVE
    # --------------------------------------------------------

    if user_in.is_active is not None:
        user.is_active = user_in.is_active

    db.commit()
    db.refresh(user)

    return user


# ============================================================
# DEACTIVATE / DELETE USER
# ============================================================


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_200_OK,
)
def deactivate_or_delete_user(
    user_id: int,
    hard_delete: bool = Query(False),
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if hard_delete:

        db.delete(user)
        db.commit()

        return {
            "message": "User deleted successfully",
            "id": user_id,
        }

    user.is_active = False

    db.commit()

    return {
        "message": "User deactivated successfully",
        "id": user_id,
        "is_active": False,
    }


# ============================================================
# DOUBT MONITOR
# ============================================================


@router.get(
    "/doubt-monitor/classes",
    response_model=List[AdminClassResponse],
)
def get_conducted_classes(
    date_value: str = Query(
        ...,
        alias="date",
    ),
    year: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    section: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):

    try:

        selected_date = datetime.strptime(
            date_value.strip(),
            "%Y-%m-%d",
        ).date()

    except ValueError:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid date format. "
                "Use YYYY-MM-DD."
            ),
        )

    query = (
        db.query(ClassSession)
        .join(
            TimetableEntry,
            ClassSession.timetable_entry_id
            == TimetableEntry.id,
        )
        .filter(
            func.date(
                ClassSession.started_at
            )
            == selected_date
        )
    )

    if section and section.strip():

        query = query.filter(
            TimetableEntry.section
            == section.strip()
        )

    if year and year.strip():

        normalized_year = (
            year.strip()
            .lower()
            .replace("th", "")
            .replace("st", "")
            .replace("nd", "")
            .replace("rd", "")
            .strip()
        )

        query = query.filter(
            TimetableEntry.section.like(
                f"{normalized_year}-%"
            )
        )

    if department and department.strip():

        query = query.filter(
            TimetableEntry.section.like(
                f"%-{department.strip()}-%"
            )
        )

    sessions = (
        query
        .order_by(
            ClassSession.started_at.asc()
        )
        .all()
    )

    results = []

    for session_obj in sessions:

        timetable = (
            session_obj.timetable_entry
        )

        doubt_count = (
            db.query(Doubt)
            .filter(
                Doubt.session_id
                == session_obj.id
            )
            .count()
        )

        results.append(
            AdminClassResponse(
                session_id=session_obj.id,
                subject=timetable.subject,
                section=timetable.section,
                faculty_name=(
                    session_obj.faculty.name
                    if session_obj.faculty
                    else "Unknown Faculty"
                ),
                started_at=session_obj.started_at,
                ended_at=session_obj.ended_at,
                status=session_obj.status,
                doubt_count=doubt_count,
            )
        )

    return results


# ============================================================
# CLASS DOUBTS
# ============================================================


@router.get(
    "/doubt-monitor/classes/{session_id}/doubts",
    response_model=List[AdminDoubtResponse],
)
def get_class_doubts(
    session_id: int,
    db: Session = Depends(get_db),
):

    class_session = (
        db.query(ClassSession)
        .filter(
            ClassSession.id
            == session_id
        )
        .first()
    )

    if not class_session:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Class session not found",
        )

    doubts = (
        db.query(Doubt)
        .filter(
            Doubt.session_id
            == session_id
        )
        .order_by(
            Doubt.created_at.asc()
        )
        .all()
    )

    return [
        AdminDoubtResponse(
            id=d.id,
            session_id=d.session_id,
            text=d.text,
            is_anonymous=d.is_anonymous,
            status=d.status,
            moderation_status=d.moderation_status,
            moderation_reason=d.moderation_reason,
            created_at=d.created_at,
            upvote_count=d.upvote_count,
        )
        for d in doubts
    ]


# ============================================================
# SINGLE DOUBT
# ============================================================


@router.get(
    "/doubt-monitor/doubts/{doubt_id}",
    response_model=AdminDoubtResponse,
)
def get_admin_doubt(
    doubt_id: int,
    db: Session = Depends(get_db),
):

    doubt = (
        db.query(Doubt)
        .filter(
            Doubt.id == doubt_id
        )
        .first()
    )

    if not doubt:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doubt not found",
        )

    return AdminDoubtResponse(
        id=doubt.id,
        session_id=doubt.session_id,
        text=doubt.text,
        is_anonymous=doubt.is_anonymous,
        status=doubt.status,
        moderation_status=doubt.moderation_status,
        moderation_reason=doubt.moderation_reason,
        created_at=doubt.created_at,
        upvote_count=doubt.upvote_count,
    )


# ============================================================
# DOUBT IDENTITY
# ============================================================


@router.get(
    "/doubt-monitor/doubts/{doubt_id}/identity"
)
def get_doubt_identity(
    doubt_id: int,
    db: Session = Depends(get_db),
):

    doubt = (
        db.query(Doubt)
        .filter(
            Doubt.id == doubt_id
        )
        .first()
    )

    if not doubt:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doubt not found",
        )

    if not doubt.student:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Student information "
                "is not available"
            ),
        )

    student = doubt.student

    return {
        "doubt_id": doubt.id,
        "student_id": student.id,
        "name": student.name,
        "email": student.email,
        "section": student.section,
        "role": student.role,
    }


# ============================================================
# UPDATE DOUBT MODERATION
# ============================================================


@router.patch(
    "/doubt-monitor/doubts/{doubt_id}",
    response_model=AdminDoubtResponse,
)
def update_doubt_moderation(
    doubt_id: int,
    action: AdminDoubtAction,
    current_user: User = Depends(
        require_roles("admin")
    ),
    db: Session = Depends(get_db),
):

    doubt = (
        db.query(Doubt)
        .filter(
            Doubt.id == doubt_id
        )
        .first()
    )

    if not doubt:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doubt not found",
        )

    if action.moderation_status is not None:

        allowed = {
            "normal",
            "needs_review",
            "flagged",
        }

        if action.moderation_status not in allowed:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid moderation status. "
                    "Allowed values: "
                    "normal, needs_review, flagged"
                ),
            )

        doubt.moderation_status = (
            action.moderation_status
        )

    if action.moderation_reason is not None:

        doubt.moderation_reason = (
            action.moderation_reason.strip()
            or None
        )

    if action.status is not None:

        allowed = {
            "open",
            "resolved",
        }

        if action.status not in allowed:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid doubt status. "
                    "Allowed values: "
                    "open, resolved"
                ),
            )

        doubt.status = action.status

    doubt.reviewed_by = current_user.id

    doubt.reviewed_at = (
        datetime.now(timezone.utc)
    )

    db.commit()
    db.refresh(doubt)

    return AdminDoubtResponse(
        id=doubt.id,
        session_id=doubt.session_id,
        text=doubt.text,
        is_anonymous=doubt.is_anonymous,
        status=doubt.status,
        moderation_status=doubt.moderation_status,
        moderation_reason=doubt.moderation_reason,
        created_at=doubt.created_at,
        upvote_count=doubt.upvote_count,
    )