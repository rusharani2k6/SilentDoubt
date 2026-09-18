import urllib.request
import urllib.error
import json

url = "http://localhost:8000/api/auth/login"
payload = json.dumps({
    "email": "admin@silentdoubt.edu",
    "password": "admin123"
}).encode('utf-8')

try:
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'}, method='POST')
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.status}")
        body = response.read().decode('utf-8')
        print(f"Response: {body}")
        data = json.loads(body)
        print(f"\nUser: {data.get('user')}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    body = e.read().decode('utf-8')
    print(f"Response Body: {body}")
    try:
        error_data = json.loads(body)
        print(f"Error details: {json.dumps(error_data, indent=2)}")
    except:
        print("Could not parse JSON")
except Exception as e:
    print(f"Exception: {e}")
    import traceback
    traceback.print_exc()
