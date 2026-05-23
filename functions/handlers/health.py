from firebase_functions import https_fn
from .utils import json_response, cors_headers


def health(req: https_fn.Request) -> https_fn.Response:
    """Health check endpoint."""
    if req.method == "OPTIONS":
        return https_fn.Response(
            "",
            status=204,
            headers=cors_headers()
        )
    return json_response({"ok": True})

