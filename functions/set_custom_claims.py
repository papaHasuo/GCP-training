#!/usr/bin/env python3
"""
Script to set custom claims (roles) for Firebase users.
Usage: python set_custom_claims.py <email> <role>
"""

import sys
import firebase_admin
from firebase_admin import auth, credentials
import os

PROJECT_ID = "gcp-learning-497122"

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    firebase_admin.initialize_app(
        options={"projectId": PROJECT_ID}
    )


def set_user_role(email: str, role: str) -> None:
    """Set custom claims (role) for a user by email."""
    try:
        # Get user by email
        user = auth.get_user_by_email(email)
        print(f"Found user: uid={user.uid}, email={user.email}")

        # Set custom claims
        auth.set_custom_user_claims(user.uid, {"role": role})
        print(f"✓ Set role '{role}' for {email}")

    except auth.UserNotFoundError:
        print(f"✗ User not found: {email}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)


def main():
    if len(sys.argv) != 3:
        print("Usage: python set_custom_claims.py <email> <role>")
        print("Example: python set_custom_claims.py papapa@firebase.app admin")
        sys.exit(1)

    email = sys.argv[1]
    role = sys.argv[2]

    if role not in ["admin", "editor", "viewer"]:
        print(f"✗ Invalid role: {role}")
        print("Valid roles: admin, editor, viewer")
        sys.exit(1)

    set_user_role(email, role)


if __name__ == "__main__":
    main()
