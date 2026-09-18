import sys
sys.path.insert(0, '.')

from app.main import app

print("Registered routes in main app:")
for route in app.routes:
    if hasattr(route, 'path'):
        methods = route.methods if hasattr(route, 'methods') else 'N/A'
        print(f"  {route.path} - {methods}")
    else:
        print(f"  [Route Object] {type(route)}")

print("\n\nNow checking the auth router directly:")
from app.routers.auth import router as auth_router
for route in auth_router.routes:
    print(f"  {route.path} - {route.methods if hasattr(route, 'methods') else 'N/A'}")
