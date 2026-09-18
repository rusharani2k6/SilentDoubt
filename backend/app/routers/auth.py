from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserResponse
from app.auth_utils import (
    verify_password,
    create_access_token,
    get_current_user,
)


router = APIRouter(
    prefix="/api",
    tags=["Auth"]
)


# ============================================================
# TEST ENDPOINT
# ============================================================

@router.get("/auth/test")
def test():
    """Simple test endpoint."""

    return {
        "message": "Test endpoint works"
    }


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/auth/login",
    response_model=TokenResponse
)
def login(
    login_req: LoginRequest,
    db: Session = Depends(get_db)
):
    """User login endpoint."""

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    email = login_req.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # --------------------------------------------------------
    # USER NOT FOUND / WRONG PASSWORD
    # --------------------------------------------------------

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    if not verify_password(
        login_req.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # --------------------------------------------------------
    # CHECK ACTIVE ACCOUNT
    # --------------------------------------------------------

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Account is deactivated. "
                "Please contact your administrator."
            ),
        )

    # --------------------------------------------------------
    # CREATE JWT TOKEN
    # --------------------------------------------------------

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "name": user.name,
        }
    )

    # --------------------------------------------------------
    # RETURN LOGIN RESPONSE
    # --------------------------------------------------------

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "section": user.section,
            "is_active": user.is_active,
        },
    }


# ============================================================
# CURRENT USER
# ============================================================

@router.get(
    "/users/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    """Return currently authenticated user."""

    return current_user