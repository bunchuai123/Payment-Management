#!/usr/bin/env python3
"""
MongoDB Atlas Connection Test
Test your MongoDB Atlas connection before deployment
"""

import pymongo
import sys
from datetime import datetime

def test_mongodb_connection():
    """Test MongoDB Atlas connection and create initial data"""
    
    # Replace this with your actual MongoDB Atlas connection string
    # Format: mongodb+srv://paymentadmin:yourpassword@payment-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
    CONNECTION_STRING = input("Enter your MongoDB Atlas connection string: ")
    
    if not CONNECTION_STRING:
        print("❌ No connection string provided!")
        return False
    
    try:
        print("🔄 Connecting to MongoDB Atlas...")
        
        # Connect to MongoDB
        client = pymongo.MongoClient(CONNECTION_STRING)
        
        # Test the connection
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB Atlas!")
        
        # Create/access the payment management database
        db = client.payment_management
        
        # Test creating a collection and document
        test_collection = db.connection_test
        test_doc = {
            "test_id": 1,
            "message": "MongoDB Atlas connection successful!",
            "timestamp": datetime.now().isoformat(),
            "status": "connected"
        }
        
        # Insert test document
        result = test_collection.insert_one(test_doc)
        print(f"✅ Test document inserted with ID: {result.inserted_id}")
        
        # Verify document exists
        found_doc = test_collection.find_one({"test_id": 1})
        if found_doc:
            print("✅ Test document retrieved successfully!")
            print(f"   Message: {found_doc['message']}")
            print(f"   Timestamp: {found_doc['timestamp']}")
        
        # Clean up test document
        test_collection.delete_one({"test_id": 1})
        print("✅ Test cleanup completed")
        
        # Create indexes for production
        print("🔄 Creating database indexes...")
        
        # Users collection indexes
        users_collection = db.users
        users_collection.create_index("email", unique=True)
        users_collection.create_index("role")
        print("✅ Users collection indexes created")
        
        # Requests collection indexes
        requests_collection = db.requests
        requests_collection.create_index("employee_id")
        requests_collection.create_index("status")
        requests_collection.create_index("created_at")
        print("✅ Requests collection indexes created")
        
        # Create admin user for production
        admin_user = {
            "email": "admin@company.com",
            "full_name": "System Administrator",
            "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8WjKM9XQL2",  # password: admin123
            "role": "admin",
            "department": "IT",
            "is_active": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        try:
            users_collection.insert_one(admin_user)
            print("✅ Admin user created successfully!")
            print("   Email: admin@company.com")
            print("   Password: admin123")
            print("   ⚠️  IMPORTANT: Change this password after first login!")
        except pymongo.errors.DuplicateKeyError:
            print("ℹ️  Admin user already exists")
        
        print("\n🎉 MongoDB Atlas setup completed successfully!")
        print("\n📋 Summary:")
        print("   ✅ Connection established")
        print("   ✅ Database 'payment_management' ready")
        print("   ✅ Indexes created")
        print("   ✅ Admin user available")
        print("\n🔗 Your connection string (save this!):")
        print(f"   {CONNECTION_STRING}")
        
        # Close connection
        client.close()
        return True
        
    except pymongo.errors.ServerSelectionTimeoutError:
        print("❌ Failed to connect to MongoDB Atlas")
        print("   Check your:")
        print("   - Internet connection")
        print("   - Connection string format")
        print("   - Network access settings (IP whitelist)")
        return False
        
    except pymongo.errors.OperationFailure as e:
        print(f"❌ MongoDB operation failed: {e}")
        print("   Check your:")
        print("   - Database user credentials")
        print("   - User permissions")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    print("🚀 MongoDB Atlas Connection Test for Payment Management System")
    print("=" * 60)
    
    print("\n📋 Before running this test, make sure you have:")
    print("   1. Created a MongoDB Atlas account")
    print("   2. Created a cluster (M0 FREE tier)")
    print("   3. Created a database user with read/write permissions")
    print("   4. Added your IP address (or 0.0.0.0/0) to network access")
    print("   5. Obtained your connection string")
    
    input("\nPress Enter when ready to test connection...")
    
    success = test_mongodb_connection()
    
    if success:
        print("\n🎯 Next Steps:")
        print("   1. Save your connection string securely")
        print("   2. Use this connection string in your production deployment")
        print("   3. Proceed with backend deployment")
    else:
        print("\n🔧 Troubleshooting:")
        print("   1. Double-check your connection string format")
        print("   2. Verify network access settings in MongoDB Atlas")
        print("   3. Check database user credentials")
        print("   4. Try again in a few minutes")
    
    return success

if __name__ == "__main__":
    main()