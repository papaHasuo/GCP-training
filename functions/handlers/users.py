from datetime import datetime
import firebase_admin
from firebase_admin import auth, firestore
from firebase_functions import https_fn
from .utils import (
    verify_bearer_token,
    get_user_role,
    require_role,
    json_response,
    cors_headers,
)


def admin_users(req: https_fn.Request) -> https_fn.Response:
    """Create a new user (admin only)."""
    # Initialize Firestore client lazily
    db = firestore.client()
    
    if req.method == "OPTIONS":
        return https_fn.Response(
            "",
            status=204,
            headers=cors_headers()
        )

    decoded, error_response = verify_bearer_token(req)
    if error_response:
        return error_response

    role_check = require_role(["admin"])(decoded)
    if role_check:
        return role_check

    if req.method != "POST":
        return json_response({"error": "POST method required"}, 405)

    try:
        payload = req.get_json()
        email = payload.get("email")
        password = payload.get("password")
        role = payload.get("role", "viewer")

        if not email or not password:
            return json_response({"error": "email and password are required"}, 400)

        if role not in ["admin", "editor", "viewer"]:
            return json_response({"error": f"Invalid role: {role}"}, 400)

        user = auth.create_user(email=email, password=password)
        auth.set_custom_user_claims(user.uid, {"role": role})

        db.collection("users").document(user.uid).set(
            {
                "uid": user.uid,
                "email": email,
                "role": role,
                "createdAt": datetime.utcnow(),
                "createdBy": decoded.get("uid"),
            }
        )

        return json_response(
            {
                "message": f"User created: {email}",
                "uid": user.uid,
                "email": user.email,
                "role": role,
            },
            201,
        )

    except auth.EmailAlreadyExistsError:
        return json_response({"error": "Email already exists"}, 409)
    except ValueError as e:
        return json_response({"error": f"Invalid input: {str(e)}"}, 400)
    except Exception as e:
        return json_response({"error": f"Failed to create user: {str(e)}"}, 500)
