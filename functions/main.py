import firebase_admin
from firebase_admin import auth
import functions_framework
import os

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "gcp-learning-497122")

if not firebase_admin._apps:
    firebase_admin.initialize_app(options={"projectId": PROJECT_ID})


def _cors_headers():
    return {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
    }


def _json(payload, status=200):
    headers = {"Content-Type": "application/json"}
    headers.update(_cors_headers())
    return payload, status, headers


def _verify_bearer_token(request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, _json({"error": "Missing or invalid Authorization header"}, 401)

    id_token = auth_header.removeprefix("Bearer ").strip()
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded, None
    except Exception as exc:
        detail = f"{type(exc).__name__}: {repr(exc)}"
        return None, _json({"error": f"Invalid token: {detail}"}, 401)


@functions_framework.http
def health(request):
    if request.method == "OPTIONS":
        return "", 204, _cors_headers()
    return _json({"ok": True})


@functions_framework.http
def me(request):
    if request.method == "OPTIONS":
        return "", 204, _cors_headers()
    decoded, error_response = _verify_bearer_token(request)
    if error_response:
        return error_response

    return _json(
        {
            "uid": decoded.get("uid"),
            "email": decoded.get("email"),
            "message": "Authenticated",
        }
    )
