import requests
import json

print("🧪 Testing Backend API Endpoints")
print("=" * 40)

# Test 1: Health Check
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    if response.status_code == 200:
        print("✅ Health endpoint working!")
        print(f"   Response: {response.json()}")
    else:
        print(f"❌ Health endpoint failed: {response.status_code}")
except Exception as e:
    print(f"❌ Health check failed: {e}")

# Test 2: Root endpoint  
try:
    response = requests.get("http://localhost:8000/", timeout=5)
    if response.status_code == 200:
        print("✅ Root endpoint working!")
        print(f"   Response: {response.json()}")
    else:
        print(f"❌ Root endpoint failed: {response.status_code}")
except Exception as e:
    print(f"❌ Root endpoint failed: {e}")

# Test 3: API Documentation
try:
    response = requests.get("http://localhost:8000/docs", timeout=5)
    if response.status_code == 200:
        print("✅ API Documentation available!")
    else:
        print(f"❌ API docs failed: {response.status_code}")
except Exception as e:
    print(f"❌ API docs failed: {e}")

print("\n🎉 Phase 1 Backend Testing Complete!")
