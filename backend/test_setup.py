"""
Test script to verify the backend setup
Run this after starting the backend to test basic functionality
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test if the API is running"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Backend is running successfully!")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to backend: {e}")

def test_api_docs():
    """Test if API documentation is available"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ API documentation is available at /docs")
        else:
            print(f"❌ API docs not accessible: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot access API docs: {e}")

def test_register_user():
    """Test user registration"""
    test_user = {
        "email": "test@example.com",
        "password": "testpassword123",
        "full_name": "Test User",
        "role": "employee",
        "department": "IT"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=test_user)
        if response.status_code == 200:
            print("✅ User registration endpoint working!")
            print(f"   Response: {response.json()}")
        elif response.status_code == 400 and "already registered" in response.text:
            print("✅ User registration endpoint working (user already exists)")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Registration test failed: {e}")

if __name__ == "__main__":
    print("🧪 Testing Payment Management System Backend")
    print("=" * 50)
    
    test_health_check()
    test_api_docs()
    test_register_user()
    
    print("\n" + "=" * 50)
    print("✨ Backend testing complete!")
    print("\n📖 Next steps:")
    print("   1. Visit http://localhost:8000/docs for API documentation")
    print("   2. Configure your .env file with MongoDB and SendGrid settings")
    print("   3. Start the frontend with: cd frontend && start.bat")
    print("   4. Begin Phase 2 development - User Authentication")
