import requests

# Test admin users API
BASE_URL = "https://paymentpro-production.up.railway.app"

def test_admin_login_and_users():
    print("🧪 Testing Admin Users API")
    print("=" * 40)
    
    # First login as admin
    print("1. Logging in as admin...")
    login_data = {
        "username": "admin@paymentpro.com",
        "password": "admin123"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return
    
    result = response.json()
    token = result.get('access_token')
    user = result.get('user', {})
    
    print(f"✅ Login successful!")
    print(f"User: {user.get('full_name')} ({user.get('role')})")
    
    # Test users API
    print("\n2. Testing users API...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        users = data.get('users', [])
        print(f"✅ Users API successful!")
        print(f"Found {len(users)} users:")
        
        for user in users:
            print(f"  - {user.get('full_name')} ({user.get('email')}) - {user.get('role')}")
            
    else:
        print(f"❌ Users API failed: {response.text}")

if __name__ == "__main__":
    test_admin_login_and_users()