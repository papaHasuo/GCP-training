import firebase_admin
from firebase_admin import auth
import functions_framework
import os
import json

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


def _get_user_role(decoded):
    """Extract role from decoded token."""
    role = decoded.get("role", "viewer")
    return role


def _require_role(required_roles):
    """Check if user has required role. Returns error response if not."""
    def check(decoded):
        user_role = _get_user_role(decoded)
        if user_role not in required_roles:
            return _json(
                {"error": f"Forbidden: requires one of {required_roles}"}, 403
            )
        return None

    return check


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

    role = _get_user_role(decoded)
    return _json(
        {
            "uid": decoded.get("uid"),
            "email": decoded.get("email"),
            "role": role,
            "message": "Authenticated",
        }
    )


@functions_framework.http
def admin_test(request):
    if request.method == "OPTIONS":
        return "", 204, _cors_headers()
    decoded, error_response = _verify_bearer_token(request)
    if error_response:
        return error_response

    role_check = _require_role(["admin"])(decoded)
    if role_check:
        return role_check

    role = _get_user_role(decoded)
    return _json(
        {
            "message": "Admin endpoint accessed",
            "uid": decoded.get("uid"),
            "role": role,
        }
    )


@functions_framework.http
def admin_users(request):
    if request.method == "OPTIONS":
        return "", 204, _cors_headers()

    decoded, error_response = _verify_bearer_token(request)
    if error_response:
        return error_response

    role_check = _require_role(["admin"])(decoded)
    if role_check:
        return role_check

    if request.method != "POST":
        return _json({"error": "POST method required"}, 405)

    try:
        payload = request.get_json()
        email = payload.get("email")
        password = payload.get("password")
        role = payload.get("role", "viewer")

        if not email or not password:
            return _json({"error": "email and password are required"}, 400)

        if role not in ["admin", "editor", "viewer"]:
            return _json({"error": f"Invalid role: {role}"}, 400)

        user = auth.create_user(email=email, password=password)
        auth.set_custom_user_claims(user.uid, {"role": role})

        return _json(
            {
                "message": f"User created: {email}",
                "uid": user.uid,
                "email": user.email,
                "role": role,
            },
            201,
        )

    except auth.EmailAlreadyExistsError:
        return _json({"error": "Email already exists"}, 409)
    except ValueError as e:
        return _json({"error": f"Invalid input: {str(e)}"}, 400)
    except Exception as e:
        return _json({"error": f"Failed to create user: {str(e)}"}, 500)
