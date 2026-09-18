import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.routers.auth import login
from app.schemas.auth import LoginRequest

# Create a mock request
login_req = LoginRequest(email="admin@silentdoubt.edu", password="admin123")
db = SessionLocal()

try:
    print("Calling login function directly...")
    result = login(login_req, db)
    print(f"Success! Result: {result}")
    print(f"Access token: {result.get('access_token', '')[:50]}...")
    print(f"User: {result.get('user')}")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
