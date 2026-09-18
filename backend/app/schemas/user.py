from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str  # "admin", "faculty", "student"
    section: Optional[str] = None

    # Student roll number
    roll_number: Optional[str] = None

    is_active: Optional[bool] = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    section: Optional[str] = None

    # Allow admin/user update of roll number
    roll_number: Optional[str] = None

    password: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int

    model_config = ConfigDict(
        from_attributes=True
    )