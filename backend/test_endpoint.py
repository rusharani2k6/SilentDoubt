import sys
sys.path.insert(0, '.')
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test login endpoint
response = client.post(
    "/api/auth/login",
    json={"email": "admin@silentdoubt.edu", "password": "admin123"}
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print(f"Success! Login worked")
    data = response.json()
    print(f"User: {data.get('user')}")
