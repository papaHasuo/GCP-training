import functions_framework
from handlers.health import health as health_handler
from handlers.auth import me as me_handler, admin_test as admin_test_handler
from handlers.users import admin_users as admin_users_handler


@functions_framework.http
def health(request):
    """Health check endpoint."""
    return health_handler(request)


@functions_framework.http
def me(request):
    """Get authenticated user info."""
    return me_handler(request)


@functions_framework.http
def admin_test(request):
    """Admin-only test endpoint."""
    return admin_test_handler(request)


@functions_framework.http
def admin_users(request):
    """Create a new user (admin only)."""
    return admin_users_handler(request)
