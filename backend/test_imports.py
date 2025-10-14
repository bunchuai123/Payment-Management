"""
Import test for Phase 1 backend
Tests all imports to identify any issues
"""

def test_imports():
    """Test all imports systematically"""
    print("🧪 Testing Phase 1 Backend Imports")
    print("=" * 40)
    
    errors = []
    
    # Test 1: Basic models
    try:
        print("📦 Testing models...")
        from app.models.user import User, UserCreate, UserLogin, UserRole
        from app.models.request import PaymentRequest, RequestCreate, RequestType
        print("✅ Models import successfully")
    except Exception as e:
        errors.append(f"Models: {e}")
        print(f"❌ Models error: {e}")
    
    # Test 2: Auth utilities
    try:
        print("🔐 Testing auth utilities...")
        from app.utils.auth import create_access_token, verify_password
        print("✅ Auth utils import successfully")
    except Exception as e:
        errors.append(f"Auth utils: {e}")
        print(f"❌ Auth utils error: {e}")
    
    # Test 3: Email utilities
    try:
        print("📧 Testing email utilities...")
        from app.utils.email import email_service
        print("✅ Email utils import successfully")
    except Exception as e:
        errors.append(f"Email utils: {e}")
        print(f"❌ Email utils error: {e}")
    
    # Test 4: Database
    try:
        print("🗄️ Testing database...")
        from app.database import get_database, connect_to_mongo
        print("✅ Database imports successfully")
    except Exception as e:
        errors.append(f"Database: {e}")
        print(f"❌ Database error: {e}")
    
    # Test 5: Routers
    try:
        print("🛣️ Testing routers...")
        from app.routers.auth import router as auth_router
        from app.routers.users import router as users_router
        from app.routers.requests import router as requests_router
        print("✅ Routers import successfully")
    except Exception as e:
        errors.append(f"Routers: {e}")
        print(f"❌ Routers error: {e}")
    
    # Test 6: Main app
    try:
        print("🚀 Testing main app...")
        from app.main import app
        print("✅ Main app imports successfully")
    except Exception as e:
        errors.append(f"Main app: {e}")
        print(f"❌ Main app error: {e}")
    
    print("\n" + "=" * 40)
    if errors:
        print(f"❌ Found {len(errors)} import errors:")
        for error in errors:
            print(f"   • {error}")
        return False
    else:
        print("🎉 All imports successful! Ready to test server startup.")
        return True

if __name__ == "__main__":
    test_imports()
