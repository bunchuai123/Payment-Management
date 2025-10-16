#!/usr/bin/env python3
"""
Quick test to verify admin login credentials work with the backend
"""

import requests
import json

# Test the Railway backend
BACKEND_URL = "https://paymentpro-production.up.railway.app"

def test_admin_login():
    """Test admin login"""
    print("Testing admin login...")
    
    login_data = {
        "username": "admin@paymentpro.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin login successful!")
            print(f"User: {data['user']['full_name']} ({data['user']['role']})")
            return data['access_token']
        else:
            print("❌ Admin login failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error testing login: {e}")
        return None

def test_manager_login():
    """Test manager login for comparison"""
    print("\nTesting manager login...")
    
    login_data = {
        "username": "manager@example.com", 
        "password": "manager123"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Manager login successful!")
            print(f"User: {data['user']['full_name']} ({data['user']['role']})")
            return data['access_token']
        else:
            print("❌ Manager login failed!")
            return None
            
    except Exception as e:
        print(f"❌ Error testing login: {e}")
        return None

def test_backend_health():
    """Test if backend is running"""
    print("Testing backend health...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        print(f"Health Status Code: {response.status_code}")
        print(f"Health Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return False

if __name__ == "__main__":
    print(f"🧪 Testing Railway Backend: {BACKEND_URL}")
    print("="*50)
    
    # Test backend health first
    if not test_backend_health():
        print("Backend is not responding!")
        exit(1)
    
    print("\n" + "="*50)
    
    # Test manager login (known working)
    manager_token = test_manager_login()
    
    # Test admin login (reported not working)  
    admin_token = test_admin_login()
    
    print("\n" + "="*50)
    print("🔍 SUMMARY:")
    print(f"Manager login: {'✅ Works' if manager_token else '❌ Failed'}")
    print(f"Admin login: {'✅ Works' if admin_token else '❌ Failed'}")
    
    if not admin_token:
        print("\n🔧 POSSIBLE ISSUES:")
        print("1. Admin user might not exist in Railway backend")
        print("2. Admin credentials might be different")
        print("3. Backend code might have been updated without admin user")
        print("\n💡 SOLUTION:")
        print("Check if Railway backend has the admin user defined in users_db")