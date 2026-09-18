import requests
import json

# Test the login endpoint
url = "http://localhost:8000/api/auth/login"
payload = {
    "email": "admin@silentdoubt.edu",
    "password": "admin123"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nSuccess! User: {data.get('user')}")
    else:
        print(f"\nError: {response.status_code}")
        try:
            error_data = response.json()
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Could not parse error response")
            
except Exception as e:
    print(f"Exception: {e}")
    import traceback
    traceback.print_exc()
