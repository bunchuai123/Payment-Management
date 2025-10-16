import requests
import json

# Railway backend URL
BASE_URL = "https://paymentpro-production.up.railway.app"

def test_login(email, password, label):
    """Test login for a specific user"""
    print(f"\n🔍 Testing {label}...")
    print(f"Email: {email}")
    print(f"Password: {password}")
    
    try:
        data = {
            "username": email,
            "password": password
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            user = result.get('user', {})
            print(f"✅ {label} login successful!")
            print(f"User: {user.get('full_name', 'Unknown')} ({user.get('role', 'Unknown')})")
            return True
        else:
            print(f"❌ {label} login failed!")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing {label}: {e}")
        return False

def main():
    print("🧪 Testing All Users on Railway Backend")
    print("=" * 60)
    
    # Test health first
    try:
        health_response = requests.get(f"{BASE_URL}/health")
        print(f"Backend Health: {health_response.status_code} - {health_response.json()}")
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return
    
    # Test all known users
    test_accounts = [
        ("test@example.com", "testpassword123", "Employee"),
        ("manager@example.com", "manager123", "Manager"), 
        ("admin@paymentpro.com", "admin123", "Admin"),
        # Try some variations in case credentials are different
        ("admin@example.com", "admin123", "Admin (alt email)"),
        ("admin@paymentpro.com", "password123", "Admin (alt password)"),
        ("admin@paymentpro.com", "adminpassword", "Admin (alt password 2)")
    ]
    
    results = {}
    for email, password, label in test_accounts:
        results[label] = test_login(email, password, label)
    
    print("\n" + "=" * 60)
    print("🔍 SUMMARY:")
    for label, success in results.items():
        status = "✅ Works" if success else "❌ Failed"
        print(f"{label}: {status}")

if __name__ == "__main__":
    main()