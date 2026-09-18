from app.database import SessionLocal
from app.models.user import User
from app.auth_utils import get_password_hash


# ============================================================
# CHANGE THESE VALUES
# ============================================================

EMAIL = "admin@silentdoubt.edu"
NEW_PASSWORD = "Admin@123"


# ============================================================
# RESET PASSWORD
# ============================================================

db = SessionLocal()

try:

    email = EMAIL.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None:

        print()
        print("USER NOT FOUND")
        print(f"Email: {email}")
        print()
        print("Existing users:")
        
        users = db.query(User).all()

        for u in users:
            print(
                f"ID={u.id} | "
                f"Name={u.name} | "
                f"Email={u.email} | "
                f"Role={u.role}"
            )

    else:

        user.password_hash = get_password_hash(
            NEW_PASSWORD
        )

        user.is_active = True

        db.commit()

        print()
        print("===================================")
        print("PASSWORD RESET SUCCESSFUL")
        print("===================================")
        print(f"Email    : {user.email}")
        print(f"Password : {NEW_PASSWORD}")
        print(f"Role     : {user.role}")
        print("===================================")
        print()

finally:

    db.close()