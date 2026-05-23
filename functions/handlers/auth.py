from firebase_functions import https_fn
from .utils import (
    verify_bearer_token,
    get_user_role,
    require_role,
    json_response,
    cors_headers,
)


def me(req: https_fn.Request) -> https_fn.Response:
    """Get authenticated user info."""
    if req.method == "OPTIONS":
        return https_fn.Response(
            "",
            status=204,
            headers=cors_headers()
        )
    decoded, error_response = verify_bearer_token(req)
    if error_response:
        return error_response

    role = get_user_role(decoded)
    return json_response(
        {
            "uid": decoded.get("uid"),
            "email": decoded.get("email"),
            "role": role,
            "message": "Authenticated",
        }
    )


def admin_test(req: https_fn.Request) -> https_fn.Response:
    """Admin-only test endpoint."""
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

    role = get_user_role(decoded)
    return json_response(
        {
            "message": "Admin endpoint accessed",
            "uid": decoded.get("uid"),
            "role": role,
        }
    )
