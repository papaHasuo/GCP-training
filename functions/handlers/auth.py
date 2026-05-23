from .utils import (
    verify_bearer_token,
    get_user_role,
    require_role,
    json_response,
    cors_headers,
)


def me(request):
    """Get authenticated user info."""
    if request.method == "OPTIONS":
        return "", 204, cors_headers()
    decoded, error_response = verify_bearer_token(request)
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


def admin_test(request):
    """Admin-only test endpoint."""
    if request.method == "OPTIONS":
        return "", 204, cors_headers()
    decoded, error_response = verify_bearer_token(request)
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
