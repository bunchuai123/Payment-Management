# Temporary in-memory authentication for testing
# This bypasses MongoDB dependency for frontend testing

from typing import Optional
from app.utils.auth import verify_password, get_password_hash

# In-memory user store for testing
TEST_USERS = {
    "test@example.com": {
        "email": "test@example.com",
        "hashed_password": get_password_hash("testpassword123"),
        "full_name": "Test User",
        "role": "employee",
        "department": "IT",
        "is_active": True
    }
}

def get_user_by_email(email: str) -> Optional[dict]:
    """Get user from in-memory store"""
    return TEST_USERS.get(email)

def verify_user_credentials(email: str, password: str) -> Optional[dict]:
    """Verify user credentials against in-memory store"""
    user = get_user_by_email(email)
    if user and verify_password(password, user["hashed_password"]):
        return user
    return None
