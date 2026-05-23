from .utils import json_response, cors_headers


def health(request):
    """Health check endpoint."""
    if request.method == "OPTIONS":
        return "", 204, cors_headers()
    return json_response({"ok": True})
