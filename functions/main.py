from firebase_functions import https_fn
from handlers.health import health as health_handler
from handlers.auth import me as me_handler, admin_test as admin_test_handler
from handlers.users import admin_users as admin_users_handler
from handlers.uploads import upload as upload_handler, my_uploads as my_uploads_handler, delete_upload as delete_upload_handler


@https_fn.on_request()
def health(req: https_fn.Request) -> https_fn.Response:
    """Health check endpoint."""
    return health_handler(req)


@https_fn.on_request()
def me(req: https_fn.Request) -> https_fn.Response:
    """Get authenticated user info."""
    return me_handler(req)


@https_fn.on_request()
def admin_test(req: https_fn.Request) -> https_fn.Response:
    """Admin-only test endpoint."""
    return admin_test_handler(req)


@https_fn.on_request()
def admin_users(req: https_fn.Request) -> https_fn.Response:
    """Create a new user (admin only)."""
    return admin_users_handler(req)


@https_fn.on_request()
def upload(req: https_fn.Request) -> https_fn.Response:
    """Upload image file."""
    return upload_handler(req)


@https_fn.on_request()
def my_uploads(req: https_fn.Request) -> https_fn.Response:
    """Get user's uploaded images."""
    return my_uploads_handler(req)


@https_fn.on_request()
def delete_upload(req: https_fn.Request) -> https_fn.Response:
    """Delete user's uploaded image."""
    return delete_upload_handler(req)
