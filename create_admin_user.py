import requests
import hashlib
import json

# Railway backend URL
BASE_URL = "https://paymentpro-production.up.railway.app"

def create_admin_user():
    """Create admin user by directly calling the backend"""
    
    print("🚀 Creating Admin User on Railway Backend")
    print("=" * 50)
    
    # Admin user data
    admin_data = {
        "id": "user_3",
        "email": "admin@paymentpro.com",
        "hashed_password": hashlib.sha256("admin123".encode()).hexdigest(),
        "full_name": "System Administrator",
        "role": "admin"
    }
    
    print(f"Admin Email: {admin_data['email']}")
    print(f"Admin Password: admin123")
    print(f"Admin Role: {admin_data['role']}")
    print(f"Hashed Password: {admin_data['hashed_password']}")
    
    # Test if backend accepts a registration endpoint or if we need to modify the backend
    try:
        # First, let's check if there's a user creation endpoint
        print("\n🔍 Testing admin creation...")
        
        # Try to register as admin (this might not work depending on backend)
        registration_data = {
            "email": admin_data["email"],
            "password": "admin123",
            "full_name": admin_data["full_name"],
            "role": "admin"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Registration Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200 or response.status_code == 201:
            print("✅ Admin user created successfully via registration!")
            return True
        else:
            print("❌ Registration endpoint not available or doesn't support admin role")
            return False
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False

def test_admin_login():
    """Test if admin login works after creation"""
    print("\n🧪 Testing Admin Login...")
    
    try:
        data = {
            "username": "admin@paymentpro.com",
            "password": "admin123"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Login Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            user = result.get('user', {})
            print(f"✅ Admin login successful!")
            print(f"User: {user.get('full_name', 'Unknown')} ({user.get('role', 'Unknown')})")
            return True
        else:
            print(f"❌ Admin login failed!")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing admin login: {e}")
        return False

def main():
    # Test backend health first
    try:
        health_response = requests.get(f"{BASE_URL}/health")
        print(f"Backend Health: {health_response.status_code} - {health_response.json()}")
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return
    
    # Try to create admin user
    success = create_admin_user()
    
    if success:
        # Test the login
        test_admin_login()
    else:
        print("\n💡 Alternative solutions:")
        print("1. Deploy updated backend with admin user")
        print("2. Add admin user manually to backend database") 
        print("3. Use manager account for now (has most admin features)")

if __name__ == "__main__":
    main()