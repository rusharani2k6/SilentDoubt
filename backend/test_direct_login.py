import urllib.request
import urllib.error
import json

# Test directly against Uvicorn on port 8000 (bypassing Vite proxy)
url = "http://localhost:8000/api/auth/login"
payload = json.dumps({
    "email": "admin@silentdoubt.edu",
    "password": "admin123"
}).encode('utf-8')

print(f"Testing {url}")

try:
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        body = response.read().decode('utf-8')
        print(f"Success! Response: {body[:100]}...")
        data = json.loads(body)
        print(f"User: {data.get('user')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    body = e.read().decode('utf-8')
    print(f"Response Body: {body}")
except Exception as e:
    print(f"Exception: {e}")
