import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.routers.auth import login
from app.schemas.auth import LoginRequest, TokenResponse
import json

# Create a mock request
login_req = LoginRequest(email="admin@silentdoubt.edu", password="admin123")
db = SessionLocal()

try:
    print("Calling login function...")
    result = login(login_req, db)
    print(f"Result type: {type(result)}")
    print(f"Result: {result}")
    
    print("\nTrying to convert to TokenResponse...")
    token_response = TokenResponse(**result)
    print(f"TokenResponse created: {token_response}")
    
    print("\nTrying to serialize to JSON...")
    json_str = token_response.model_dump_json()
    print(f"JSON serialization successful!")
    print(f"JSON: {json_str[:100]}...")
    
    print("\nTrying to parse back...")
    parsed = json.loads(json_str)
    print(f"Parsed: {parsed}")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
