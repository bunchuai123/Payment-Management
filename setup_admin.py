import requests
import time

# Railway backend URL
BASE_URL = "https://paymentpro-production.up.railway.app"
ADMIN_SECRET = "create-admin-paymentpro-2025"

def wait_for_backend():
    """Wait for backend to be ready"""
    print("⏳ Waiting for backend deployment to complete...")
    
    for i in range(30):  # Try for 5 minutes
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=10)
            if response.status_code == 200:
                print("✅ Backend is ready!")
                return True
        except:
            pass
        
        print(f"   Attempt {i+1}/30... waiting 10 seconds")
        time.sleep(10)
    
    print("❌ Backend not ready after 5 minutes")
    return False

def create_admin_user():
    """Create admin user using the special endpoint"""
    print("\n🚀 Creating Admin User...")
    
    try:
        data = {
            "admin_secret": ADMIN_SECRET
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/create-admin",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Admin user created successfully!")
            return True
        else:
            print("❌ Failed to create admin user")
            return False
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return False

def test_admin_login():
    """Test admin login"""
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
            print(f"Token: {result.get('access_token', 'No token')[:50]}...")
            return True
        else:
            print(f"❌ Admin login failed!")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing admin login: {e}")
        return False

def main():
    print("🔧 Admin User Creation for Railway Backend")
    print("=" * 50)
    
    # Wait for backend to be ready
    if not wait_for_backend():
        return
    
    # Create admin user
    if create_admin_user():
        # Test admin login
        test_admin_login()
        
        print("\n🎉 SUCCESS!")
        print("Admin account is now available:")
        print("📧 Email: admin@paymentpro.com")
        print("🔑 Password: admin123")
        print("🎭 Role: admin")
        print("\nYou can now login to your app with admin privileges!")
    else:
        print("\n❌ Failed to create admin user")
        print("Please check the Railway deployment logs")

if __name__ == "__main__":
    main()