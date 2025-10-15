"""
Comprehensive Test Suite for Payment Management System Backend
Tests all API endpoints, authentication, and core functionality
"""

import pytest
import requests
import json
import time
from typing import Dict, Any

# Test Configuration
BASE_URL = "http://localhost:8001"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword123"
TEST_MANAGER_EMAIL = "manager@example.com"
TEST_MANAGER_PASSWORD = "manager123"

class PaymentSystemTester:
    """Main test class for Payment Management System"""
    
    def __init__(self):
        self.base_url = BASE_URL
        self.user_token = None
        self.manager_token = None
        self.test_request_id = None
        
    def setup_authentication(self) -> bool:
        """Setup authentication tokens for testing"""
        try:
            # Login as regular user
            user_response = requests.post(f"{self.base_url}/api/auth/login", data={
                "username": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            })
            
            if user_response.status_code == 200:
                self.user_token = user_response.json().get("access_token")
                print("✅ User authentication successful")
            else:
                print(f"❌ User authentication failed: {user_response.status_code}")
                return False
            
            # Login as manager
            manager_response = requests.post(f"{self.base_url}/api/auth/login", data={
                "username": TEST_MANAGER_EMAIL,
                "password": TEST_MANAGER_PASSWORD
            })
            
            if manager_response.status_code == 200:
                self.manager_token = manager_response.json().get("access_token")
                print("✅ Manager authentication successful")
            else:
                print(f"❌ Manager authentication failed: {manager_response.status_code}")
                return False
                
            return True
            
        except Exception as e:
            print(f"❌ Authentication setup failed: {str(e)}")
            return False
    
    def get_headers(self, token: str) -> Dict[str, str]:
        """Get authorization headers"""
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    
    # Authentication Tests
    def test_health_endpoint(self) -> bool:
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health")
            success = response.status_code == 200
            print(f"{'✅' if success else '❌'} Health check: {response.status_code}")
            return success
        except Exception as e:
            print(f"❌ Health check failed: {str(e)}")
            return False
    
    def test_invalid_login(self) -> bool:
        """Test login with invalid credentials"""
        try:
            response = requests.post(f"{self.base_url}/api/auth/login", data={
                "username": "invalid@example.com",
                "password": "wrongpassword"
            })
            success = response.status_code == 401
            print(f"{'✅' if success else '❌'} Invalid login rejection: {response.status_code}")
            return success
        except Exception as e:
            print(f"❌ Invalid login test failed: {str(e)}")
            return False
    
    def test_token_validation(self) -> bool:
        """Test token validation with invalid token"""
        try:
            headers = {"Authorization": "Bearer invalid_token"}
            response = requests.get(f"{self.base_url}/api/requests", headers=headers)
            success = response.status_code == 401
            print(f"{'✅' if success else '❌'} Invalid token rejection: {response.status_code}")
            return success
        except Exception as e:
            print(f"❌ Token validation test failed: {str(e)}")
            return False
    
    # Request Management Tests
    def test_create_request(self) -> bool:
        """Test creating a new payment request"""
        try:
            request_data = {
                "request_type": "overtime",
                "amount": 750.0,
                "description": "Test overtime request for API testing",
                "requested_payment_date": "2025-10-25"
            }
            
            response = requests.post(
                f"{self.base_url}/api/requests",
                headers=self.get_headers(self.user_token),
                json=request_data
            )
            
            if response.status_code == 201:
                self.test_request_id = response.json().get("id")
                print(f"✅ Request creation successful: {self.test_request_id}")
                return True
            else:
                print(f"❌ Request creation failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Request creation test failed: {str(e)}")
            return False
    
    def test_get_requests(self) -> bool:
        """Test retrieving requests"""
        try:
            response = requests.get(
                f"{self.base_url}/api/requests",
                headers=self.get_headers(self.user_token)
            )
            
            if response.status_code == 200:
                requests_data = response.json()
                success = isinstance(requests_data, list)
                print(f"✅ Get requests successful: {len(requests_data)} requests")
                return success
            else:
                print(f"❌ Get requests failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Get requests test failed: {str(e)}")
            return False
    
    def test_get_specific_request(self) -> bool:
        """Test retrieving a specific request"""
        if not self.test_request_id:
            self.test_request_id = "req_001"  # Use default test request
            
        try:
            response = requests.get(
                f"{self.base_url}/api/requests/{self.test_request_id}",
                headers=self.get_headers(self.user_token)
            )
            
            if response.status_code == 200:
                request_data = response.json()
                success = "id" in request_data
                print(f"✅ Get specific request successful: {request_data.get('id')}")
                return success
            else:
                print(f"❌ Get specific request failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Get specific request test failed: {str(e)}")
            return False
    
    def test_approve_request(self) -> bool:
        """Test approving a request (manager only)"""
        request_id = self.test_request_id or "req_001"
        
        try:
            approval_data = {
                "status": "approved_final",
                "comments": "Approved for testing purposes"
            }
            
            response = requests.put(
                f"{self.base_url}/api/requests/{request_id}/approve",
                headers=self.get_headers(self.manager_token),
                json=approval_data
            )
            
            if response.status_code == 200:
                result = response.json()
                success = result.get("message") is not None
                print(f"✅ Request approval successful: {result.get('message')}")
                return success
            else:
                print(f"❌ Request approval failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Request approval test failed: {str(e)}")
            return False
    
    # Settings API Tests
    def test_get_user_settings(self) -> bool:
        """Test retrieving user settings"""
        try:
            response = requests.get(
                f"{self.base_url}/api/user/settings",
                headers=self.get_headers(self.user_token)
            )
            
            if response.status_code == 200:
                settings = response.json()
                success = "profile" in settings and "notifications" in settings
                print(f"✅ Get user settings successful")
                return success
            else:
                print(f"❌ Get user settings failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Get user settings test failed: {str(e)}")
            return False
    
    def test_update_profile(self) -> bool:
        """Test updating user profile"""
        try:
            profile_data = {
                "name": "Test User Updated",
                "phone": "+1-555-123-4567",
                "department": "Engineering"
            }
            
            response = requests.put(
                f"{self.base_url}/api/user/profile",
                headers=self.get_headers(self.user_token),
                json=profile_data
            )
            
            if response.status_code == 200:
                result = response.json()
                success = "message" in result
                print(f"✅ Profile update successful")
                return success
            else:
                print(f"❌ Profile update failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Profile update test failed: {str(e)}")
            return False
    
    def test_update_notifications(self) -> bool:
        """Test updating notification settings"""
        try:
            notification_data = {
                "emailNotifications": True,
                "requestUpdates": True,
                "notificationFrequency": "daily"
            }
            
            response = requests.put(
                f"{self.base_url}/api/user/notifications",
                headers=self.get_headers(self.user_token),
                json=notification_data
            )
            
            if response.status_code == 200:
                result = response.json()
                success = "message" in result
                print(f"✅ Notification settings update successful")
                return success
            else:
                print(f"❌ Notification settings update failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Notification settings test failed: {str(e)}")
            return False
    
    # Analytics and PDF Tests
    def test_analytics_endpoint(self) -> bool:
        """Test analytics data retrieval (manager only)"""
        try:
            response = requests.get(
                f"{self.base_url}/api/reports/analytics",
                headers=self.get_headers(self.manager_token)
            )
            
            if response.status_code == 200:
                analytics = response.json()
                success = "summary" in analytics and "amounts" in analytics
                print(f"✅ Analytics endpoint successful")
                return success
            else:
                print(f"❌ Analytics endpoint failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Analytics test failed: {str(e)}")
            return False
    
    def test_pdf_summary_generation(self) -> bool:
        """Test PDF summary report generation"""
        try:
            response = requests.get(
                f"{self.base_url}/api/reports/summary",
                headers=self.get_headers(self.manager_token)
            )
            
            if response.status_code == 200:
                # Check if response is PDF content
                content_type = response.headers.get('content-type', '')
                success = 'application/pdf' in content_type
                print(f"✅ PDF summary generation successful")
                return success
            else:
                print(f"❌ PDF summary generation failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ PDF summary test failed: {str(e)}")
            return False
    
    def test_pdf_paycheck_generation(self) -> bool:
        """Test PDF paycheck generation"""
        request_id = "req_002"  # Use approved request
        
        try:
            response = requests.get(
                f"{self.base_url}/api/reports/paycheck/{request_id}",
                headers=self.get_headers(self.user_token)
            )
            
            if response.status_code == 200:
                # Check if response is PDF content
                content_type = response.headers.get('content-type', '')
                success = 'application/pdf' in content_type
                print(f"✅ PDF paycheck generation successful")
                return success
            else:
                print(f"❌ PDF paycheck generation failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ PDF paycheck test failed: {str(e)}")
            return False
    
    # Authorization Tests
    def test_unauthorized_access(self) -> bool:
        """Test unauthorized access to protected endpoints"""
        try:
            # Try to access manager endpoint as regular user
            response = requests.get(
                f"{self.base_url}/api/reports/analytics",
                headers=self.get_headers(self.user_token)
            )
            
            # Should fail with 403 or 401
            success = response.status_code in [401, 403]
            print(f"{'✅' if success else '❌'} Unauthorized access properly blocked: {response.status_code}")
            return success
                
        except Exception as e:
            print(f"❌ Authorization test failed: {str(e)}")
            return False
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all tests and return results"""
        print("\n🧪 Starting Payment Management System API Tests\n")
        
        # Setup
        if not self.setup_authentication():
            return {"error": "Authentication setup failed"}
        
        test_results = {}
        
        # Core API Tests
        tests = [
            ("Health Check", self.test_health_endpoint),
            ("Invalid Login", self.test_invalid_login),
            ("Token Validation", self.test_token_validation),
            ("Create Request", self.test_create_request),
            ("Get Requests", self.test_get_requests),
            ("Get Specific Request", self.test_get_specific_request),
            ("Approve Request", self.test_approve_request),
            ("Get User Settings", self.test_get_user_settings),
            ("Update Profile", self.test_update_profile),
            ("Update Notifications", self.test_update_notifications),
            ("Analytics Endpoint", self.test_analytics_endpoint),
            ("PDF Summary Generation", self.test_pdf_summary_generation),
            ("PDF Paycheck Generation", self.test_pdf_paycheck_generation),
            ("Unauthorized Access", self.test_unauthorized_access),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n🔍 Running: {test_name}")
            try:
                result = test_func()
                test_results[test_name] = result
                if result:
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ {test_name} crashed: {str(e)}")
                test_results[test_name] = False
                failed += 1
            
            time.sleep(0.5)  # Small delay between tests
        
        # Summary
        total_tests = passed + failed
        success_rate = (passed / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📊 Test Results Summary:")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return {
            "passed": passed,
            "failed": failed,
            "total": total_tests,
            "success_rate": success_rate,
            "details": test_results
        }

def main():
    """Main test execution"""
    tester = PaymentSystemTester()
    results = tester.run_all_tests()
    
    # Save results to file
    with open("test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📝 Results saved to test_results.json")
    
    # Exit with error code if tests failed
    if results.get("failed", 0) > 0:
        exit(1)
    else:
        print("\n🎉 All tests passed!")
        exit(0)

if __name__ == "__main__":
    main()