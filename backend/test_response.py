import sys
sys.path.insert(0, '.')
from app.database import SessionLocal
from app.models import User
from app.schemas.user import UserResponse
import json

db = SessionLocal()
user = db.query(User).filter(User.email == "admin@silentdoubt.edu").first()

if user:
    print(f"User found: {user.email}")
    print(f"Converting to UserResponse...")
    
    try:
        user_response = UserResponse.model_validate(user)
        print(f"Success! UserResponse created")
        print(f"User Response dict: {user_response.model_dump()}")
        print(f"JSON: {json.dumps(user_response.model_dump())}")
    except Exception as e:
        print(f"ERROR: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
else:
    print("User not found")
