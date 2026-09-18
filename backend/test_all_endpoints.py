import sys
sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test the test endpoint
response = client.get("/api/auth/test")
print(f"GET /api/auth/test: {response.status_code}")
print(f"Response: {response.text}")

# Test login
response = client.post(
    "/api/auth/login",
    json={"email": "admin@silentdoubt.edu", "password": "admin123"}
)

print(f"\nPOST /api/auth/login: {response.status_code}")
print(f"Response: {response.text[:200]}")

if response.status_code == 200:
    print("SUCCESS! Login works")
else:
    print("FAILED!")
