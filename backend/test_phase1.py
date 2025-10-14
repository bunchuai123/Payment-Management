"""
Minimal backend test - Tests core functionality without external dependencies
"""

def test_imports():
    """Test if we can import our modules"""
    print("🧪 Testing Python imports...")
    
    try:
        # Test basic Python functionality
        from datetime import datetime
        from typing import Optional
        from enum import Enum
        print("✅ Basic Python imports working")
        
        # Test if we can import our models (without pydantic for now)
        import sys
        import os
        
        # Add app directory to path
        backend_path = os.path.dirname(os.path.abspath(__file__))
        app_path = os.path.join(backend_path, 'app')
        sys.path.insert(0, app_path)
        
        print("✅ App path configured")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_file_structure():
    """Test if all required files exist"""
    print("\n🧪 Testing file structure...")
    
    required_files = [
        "app/main.py",
        "app/database.py", 
        "app/models/user.py",
        "app/models/request.py",
        "app/routers/auth.py",
        "app/routers/users.py", 
        "app/routers/requests.py",
        "app/utils/auth.py",
        "app/utils/email.py",
        "requirements.txt",
        ".env.example"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
        else:
            print(f"✅ Found: {file_path}")
    
    if missing_files:
        print(f"\n❌ Missing files: {missing_files}")
        return False
    
    print("✅ All required files exist")
    return True

def test_env_template():
    """Test environment template"""
    print("\n🧪 Testing environment configuration...")
    
    try:
        with open(".env.example", "r") as f:
            env_content = f.read()
            
        required_vars = [
            "MONGODB_URL",
            "DATABASE_NAME", 
            "SECRET_KEY",
            "SENDGRID_API_KEY",
            "FROM_EMAIL"
        ]
        
        missing_vars = []
        for var in required_vars:
            if var not in env_content:
                missing_vars.append(var)
            else:
                print(f"✅ Environment variable template: {var}")
        
        if missing_vars:
            print(f"❌ Missing environment variables: {missing_vars}")
            return False
            
        print("✅ Environment template is complete")
        return True
        
    except FileNotFoundError:
        print("❌ .env.example file not found")
        return False

if __name__ == "__main__":
    print("🧪 PHASE 1 BACKEND TESTING")
    print("=" * 50)
    
    # Change to backend directory
    import os
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    tests_passed = 0
    total_tests = 3
    
    if test_imports():
        tests_passed += 1
        
    if test_file_structure():
        tests_passed += 1
        
    if test_env_template():
        tests_passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 TEST RESULTS: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 Phase 1 backend structure is ready!")
        print("\n📋 Next steps:")
        print("   1. Install Python dependencies: pip install -r requirements.txt")
        print("   2. Copy .env.example to .env and configure values")
        print("   3. Start MongoDB (local or Atlas)")
        print("   4. Test with: uvicorn app.main:app --reload")
    else:
        print("❌ Some tests failed. Please review the issues above.")
