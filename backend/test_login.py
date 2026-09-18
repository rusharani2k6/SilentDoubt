import sys
sys.path.insert(0, '.')
from app.database import SessionLocal
from app.models import User
from app.auth_utils import verify_password, create_access_token
import json

db = SessionLocal()

# Simulate login
email = "admin@silentdoubt.edu"
password = "admin123"

user = db.query(User).filter(User.email == email.lower().strip()).first()
print(f"User found: {user is not None}")

if user and verify_password(password, user.password_hash):
    print(f"Password verified!")
    print(f"User active: {user.is_active}")
    
    # Try to create token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role, "name": user.name}
    )
    print(f"Token created: {access_token[:20]}...")
    
    # Try to construct response
    response = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
    
    # This is where it might fail - serializing the user object
    print(f"Trying to serialize response...")
    try:
        print(json.dumps(response, default=str))
    except Exception as e:
        print(f"ERROR: {e}")
        print(f"User type: {type(user)}")
        print(f"User dict: {user.__dict__}")
    
else:
    print("Password verification failed")
