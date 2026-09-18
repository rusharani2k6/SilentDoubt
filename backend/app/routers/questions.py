from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth_utils import get_current_user

from app.models.user import User
from app.models.student_question import StudentQuestion

from app.schemas.student_question import (
    StudentQuestionCreate,
    StudentQuestionAnswer,
    StudentQuestionResponse,
)


router = APIRouter(
    prefix="/api/questions",
    tags=["Student Questions"],
)


# ============================================================
# Helper functions
# ============================================================

def check_student(current_user: User):
    """
    Allow only students to access student-question operations.
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can perform this action",
        )


def check_faculty(current_user: User):
    """
    Allow only faculty to access faculty-question operations.
    """
    if current_user.role != "faculty":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only faculty can perform this action",
        )


# ============================================================
# 1. STUDENT - ASK FACULTY
# ============================================================

@router.post(
    "",
    response_model=StudentQuestionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_question(
    question_data: StudentQuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Student submits a question to a faculty member.
    """

    check_student(current_user)

    # --------------------------------------------------------
    # Check whether faculty exists
    # --------------------------------------------------------

    faculty = db.query(User).filter(
        User.id == question_data.faculty_id,
        User.role == "faculty",
    ).first()

    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found",
        )

    # --------------------------------------------------------
    # Validate question text
    # --------------------------------------------------------

    clean_question = question_data.question.strip()

    if not clean_question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty",
        )

    # --------------------------------------------------------
    # Create question
    # --------------------------------------------------------

    new_question = StudentQuestion(
        student_id=current_user.id,
        faculty_id=faculty.id,
        subject=question_data.subject.strip(),
        question=clean_question,
        is_anonymous=question_data.is_anonymous,
        status="pending",
        created_at=datetime.now(timezone.utc),
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    # --------------------------------------------------------
    # Prepare response
    # --------------------------------------------------------

    response = StudentQuestionResponse(
        id=new_question.id,
        student_id=new_question.student_id,
        faculty_id=new_question.faculty_id,
        subject=new_question.subject,
        question=new_question.question,
        is_anonymous=new_question.is_anonymous,
        answer=new_question.answer,
        answered_at=new_question.answered_at,
        status=new_question.status,
        created_at=new_question.created_at,
        student_name=None,
        faculty_name=faculty.name,
    )

    return response


# ============================================================
# 2. STUDENT - VIEW MY QUESTIONS
# ============================================================

@router.get(
    "/my",
    response_model=List[StudentQuestionResponse],
)
def get_my_questions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Student can see all questions they have asked,
    including faculty answers.
    """

    check_student(current_user)

    questions = (
        db.query(StudentQuestion)
        .filter(
            StudentQuestion.student_id == current_user.id
        )
        .order_by(StudentQuestion.created_at.desc())
        .all()
    )

    result = []

    for question in questions:

        faculty_name = None

        if question.faculty:
            faculty_name = question.faculty.name

        result.append(
            StudentQuestionResponse(
                id=question.id,
                student_id=question.student_id,
                faculty_id=question.faculty_id,
                subject=question.subject,
                question=question.question,
                is_anonymous=question.is_anonymous,
                answer=question.answer,
                answered_at=question.answered_at,
                status=question.status,
                created_at=question.created_at,
                student_name=current_user.name,
                faculty_name=faculty_name,
            )
        )

    return result


# ============================================================
# 3. FACULTY - VIEW QUESTIONS
# ============================================================

@router.get(
    "/faculty",
    response_model=List[StudentQuestionResponse],
)
def get_faculty_questions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Faculty can see questions assigned to them.

    If the question is anonymous:
        student_name = None

    If the question is not anonymous:
        student_name = actual student name
    """

    check_faculty(current_user)

    questions = (
        db.query(StudentQuestion)
        .filter(
            StudentQuestion.faculty_id == current_user.id
        )
        .order_by(StudentQuestion.created_at.desc())
        .all()
    )

    result = []

    for question in questions:

        student_name = None

        # ----------------------------------------------------
        # Show student name only when NOT anonymous
        # ----------------------------------------------------

        if not question.is_anonymous and question.student:
            student_name = question.student.name

        result.append(
            StudentQuestionResponse(
                id=question.id,
                student_id=question.student_id,
                faculty_id=question.faculty_id,
                subject=question.subject,
                question=question.question,
                is_anonymous=question.is_anonymous,
                answer=question.answer,
                answered_at=question.answered_at,
                status=question.status,
                created_at=question.created_at,
                student_name=student_name,
                faculty_name=current_user.name,
            )
        )

    return result


# ============================================================
# 4. FACULTY - ANSWER QUESTION
# ============================================================

@router.post(
    "/{question_id}/answer",
    response_model=StudentQuestionResponse,
)
def answer_question(
    question_id: int,
    answer_data: StudentQuestionAnswer,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Faculty answers a student's question.
    """

    check_faculty(current_user)

    # --------------------------------------------------------
    # Find question
    # --------------------------------------------------------

    question = (
        db.query(StudentQuestion)
        .filter(
            StudentQuestion.id == question_id
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )

    # --------------------------------------------------------
    # Make sure this question belongs to this faculty
    # --------------------------------------------------------

    if question.faculty_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to answer this question",
        )

    # --------------------------------------------------------
    # Validate answer
    # --------------------------------------------------------

    clean_answer = answer_data.answer.strip()

    if not clean_answer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answer cannot be empty",
        )

    # --------------------------------------------------------
    # Save answer
    # --------------------------------------------------------

    question.answer = clean_answer
    question.status = "answered"
    question.answered_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(question)

    # --------------------------------------------------------
    # Student name
    # --------------------------------------------------------

    student_name = None

    if not question.is_anonymous and question.student:
        student_name = question.student.name

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return StudentQuestionResponse(
        id=question.id,
        student_id=question.student_id,
        faculty_id=question.faculty_id,
        subject=question.subject,
        question=question.question,
        is_anonymous=question.is_anonymous,
        answer=question.answer,
        answered_at=question.answered_at,
        status=question.status,
        created_at=question.created_at,
        student_name=student_name,
        faculty_name=current_user.name,
    )