#!/usr/bin/env python3
"""
Test script to verify and create manager user for login testing.
"""
import requests
import json

# Production backend URL
BASE_URL = "https://paymentpro-production.up.railway.app"

def test_manager_login():
    """Test if manager@example.com can login"""
    login_data = {
        "username": "manager@example.com",
        "password": "manager123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login", data=login_data)
        print(f"Login response status: {response.status_code}")
        print(f"Login response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Login test failed: {e}")
        return False

def create_manager_user():
    """Create manager user if it doesn't exist"""
    register_data = {
        "email": "manager@example.com",
        "password": "manager123",
        "full_name": "Test Manager",
        "role": "manager"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
        print(f"Register response status: {response.status_code}")
        print(f"Register response: {response.text}")
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"Registration failed: {e}")
        return False

def main():
    print("Testing manager login...")
    
    # First try to login
    if test_manager_login():
        print("✅ Manager login successful!")
        return
    
    print("❌ Manager login failed. Trying to create manager user...")
    
    # Try to create the user
    if create_manager_user():
        print("✅ Manager user created successfully!")
        
        # Test login again
        if test_manager_login():
            print("✅ Manager login now works!")
        else:
            print("❌ Manager login still fails after creation")
    else:
        print("❌ Failed to create manager user")

if __name__ == "__main__":
    main()