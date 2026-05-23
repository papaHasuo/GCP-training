import os
import json
import firebase_admin
from firebase_admin import auth
from firebase_functions import https_fn

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "gcp-learning-497122")

def _init_firebase():
    if not firebase_admin._apps:
        firebase_admin.initialize_app(options={"projectId": PROJECT_ID})

_init_firebase()


def cors_headers():
    origin = os.getenv("ALLOWED_ORIGIN", "http://localhost:5173")
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    }


def json_response(payload, status=200):
    headers = {"Content-Type": "application/json"}
    headers.update(cors_headers())
    return https_fn.Response(
        json.dumps(payload),
        status=status,
        headers=headers
    )


def verify_bearer_token(request: https_fn.Request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, json_response({"error": "Missing or invalid Authorization header"}, 401)

    id_token = auth_header.removeprefix("Bearer ").strip()
    try:
        decoded = auth.verify_id_token(id_token, clock_skew_seconds=10)
        return decoded, None
    except Exception as exc:
        detail = f"{type(exc).__name__}: {repr(exc)}"
        return None, json_response({"error": f"Invalid token: {detail}"}, 401)


def get_user_role(decoded):
    """Extract role from decoded token."""
    return decoded.get("role", "viewer")


def require_role(required_roles):
    """Check if user has required role. Returns error response if not."""
    def check(decoded):
        user_role = get_user_role(decoded)
        if user_role not in required_roles:
            return json_response(
                {"error": f"Forbidden: requires one of {required_roles}"}, 403
            )
        return None

    return check
