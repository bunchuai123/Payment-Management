# 🚀 Payment Management System - Production Deployment Guide

This guide provides step-by-step instructions for deploying the Payment Management System to production environments.

## 📋 **Deployment Overview**

- **Frontend**: Next.js application → Vercel
- **Backend**: FastAPI application → Railway/Heroku/DigitalOcean
- **Database**: MongoDB Atlas (Production)
- **Email Service**: SendGrid (Production Account)
- **File Storage**: Cloud storage for document uploads

## 🛠️ **Pre-Deployment Checklist**

### ✅ **System Requirements Verification**
- [ ] Node.js 18+ for frontend build
- [ ] Python 3.8+ for backend
- [ ] MongoDB Atlas account setup
- [ ] SendGrid production account
- [ ] Domain name for production (optional)
- [ ] SSL certificate setup

### ✅ **Code Preparation**
- [ ] All tests passing (run `comprehensive_tests.py`)
- [ ] Environment variables configured
- [ ] Security configurations reviewed
- [ ] CORS settings updated for production domains
- [ ] Error handling and logging implemented

## 🗄️ **Database Setup (MongoDB Atlas)**

### **1. Create Production Database**
```bash
# 1. Sign up for MongoDB Atlas at https://cloud.mongodb.com/
# 2. Create a new cluster (M0 tier is free)
# 3. Create database user with read/write permissions
# 4. Whitelist your application's IP addresses
# 5. Get connection string: mongodb+srv://username:password@cluster.mongodb.net/payment_management
```

### **2. Database Migration**
```python
# backend/migrate_to_production.py
import pymongo
from datetime import datetime

# Production connection string
PROD_CONNECTION = "mongodb+srv://username:password@cluster.mongodb.net/payment_management"

def migrate_users():
    """Migrate user data to production"""
    client = pymongo.MongoClient(PROD_CONNECTION)
    db = client.payment_management
    
    # Create admin user
    admin_user = {
        "email": "admin@yourcompany.com",
        "full_name": "System Administrator",
        "password_hash": "your_hashed_password",
        "role": "admin",
        "department": "IT",
        "is_active": True,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    db.users.insert_one(admin_user)
    print("✅ Admin user created")

def setup_indexes():
    """Create database indexes for performance"""
    client = pymongo.MongoClient(PROD_CONNECTION)
    db = client.payment_management
    
    # User indexes
    db.users.create_index("email", unique=True)
    db.users.create_index("role")
    
    # Request indexes
    db.requests.create_index("employee_id")
    db.requests.create_index("status")
    db.requests.create_index("created_at")
    
    print("✅ Database indexes created")

if __name__ == "__main__":
    migrate_users()
    setup_indexes()
```

## 🔧 **Backend Deployment**

### **Option A: Railway Deployment**

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Create Production Environment File**
```env
# backend/.env.production
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/payment_management
SECRET_KEY=your_super_secret_jwt_key_here_64_characters_minimum
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
CORS_ORIGINS=["https://yourdomain.com", "https://www.yourdomain.com"]
ENVIRONMENT=production
```

3. **Create Railway Configuration**
```toml
# backend/railway.toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on-failure"

[env]
PORT = "8000"
PYTHON_VERSION = "3.11"
```

4. **Deploy to Railway**
```bash
cd backend
railway init
railway add
railway deploy
```

### **Option B: Heroku Deployment**

1. **Create Heroku App**
```bash
heroku create payment-management-api
heroku config:set SECRET_KEY=your_secret_key
heroku config:set DATABASE_URL=your_mongodb_connection
heroku config:set SENDGRID_API_KEY=your_sendgrid_key
```

2. **Create Procfile**
```procfile
web: uvicorn test_server:app --host 0.0.0.0 --port $PORT
```

3. **Deploy**
```bash
git push heroku main
```

### **Production Backend Configuration**

Update `test_server.py` for production:
```python
# Add to test_server.py
import os

# Production environment detection
IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"

# CORS configuration for production
if IS_PRODUCTION:
    allowed_origins = os.getenv("CORS_ORIGINS", "").split(",")
else:
    allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection for production
if IS_PRODUCTION:
    DATABASE_URL = os.getenv("DATABASE_URL")
    # Initialize MongoDB connection
else:
    # Use existing in-memory storage for development
    pass
```

## 🌐 **Frontend Deployment (Vercel)**

### **1. Prepare Frontend for Production**

Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-domain.railway.app'
      : 'http://localhost:8001'
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone'
}

module.exports = nextConfig
```

### **2. Update API Configuration**
```typescript
// frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export default {
  baseURL: API_BASE_URL,
  // ... rest of configuration
}
```

### **3. Deploy to Vercel**

**Option A: Vercel CLI**
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

**Option B: GitHub Integration**
1. Push code to GitHub repository
2. Connect GitHub repo to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### **4. Environment Variables for Vercel**
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
```

## 🔐 **Security Configuration**

### **1. SSL/TLS Setup**
- Enable HTTPS on all domains
- Configure SSL certificates
- Update CORS origins to use HTTPS

### **2. Security Headers**
Add to backend:
```python
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

### **3. Rate Limiting**
```python
# Install: pip install slowapi
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)

@app.post("/api/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    # ... login logic
```

## 📊 **Monitoring and Logging**

### **1. Application Monitoring**
```python
# backend/monitoring.py
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request, call_next):
    start_time = datetime.now()
    response = await call_next(request)
    process_time = (datetime.now() - start_time).total_seconds()
    
    logger.info(f"{request.method} {request.url} - {response.status_code} - {process_time}s")
    return response
```

### **2. Error Tracking**
```bash
# Install Sentry for error tracking
pip install sentry-sdk[fastapi]
```

```python
# Add to test_server.py
import sentry_sdk

if IS_PRODUCTION:
    sentry_sdk.init(
        dsn="your-sentry-dsn",
        traces_sample_rate=1.0,
    )
```

## 🧪 **Production Testing**

### **1. Smoke Tests**
Create production smoke test:
```python
# backend/production_smoke_test.py
import requests
import os

PRODUCTION_URL = os.getenv("PRODUCTION_URL", "https://your-domain.com")

def test_production_health():
    response = requests.get(f"{PRODUCTION_URL}/health")
    assert response.status_code == 200
    print("✅ Production health check passed")

def test_production_api():
    # Test key endpoints
    endpoints = ["/api/auth/login", "/docs"]
    for endpoint in endpoints:
        response = requests.get(f"{PRODUCTION_URL}{endpoint}")
        print(f"✅ {endpoint}: {response.status_code}")

if __name__ == "__main__":
    test_production_health()
    test_production_api()
```

### **2. Load Testing**
```bash
# Install locust for load testing
pip install locust
```

```python
# backend/load_test.py
from locust import HttpUser, task, between

class PaymentSystemUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login user
        response = self.client.post("/api/auth/login", data={
            "username": "test@example.com",
            "password": "testpassword123"
        })
        self.token = response.json().get("access_token")
    
    @task
    def get_requests(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/requests", headers=headers)
    
    @task
    def get_analytics(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/reports/analytics", headers=headers)
```

## 🔄 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Run all tests (`comprehensive_tests.py`)
- [ ] Update environment variables
- [ ] Configure production database
- [ ] Setup email service (SendGrid)
- [ ] Review security settings

### **Deployment**
- [ ] Deploy backend to Railway/Heroku
- [ ] Deploy frontend to Vercel
- [ ] Configure DNS/domain settings
- [ ] Setup SSL certificates
- [ ] Test production endpoints

### **Post-Deployment**
- [ ] Run production smoke tests
- [ ] Verify email notifications work
- [ ] Test PDF generation in production
- [ ] Monitor application logs
- [ ] Setup monitoring dashboards

### **Maintenance**
- [ ] Setup automated backups
- [ ] Configure monitoring alerts
- [ ] Document deployment process
- [ ] Setup CI/CD pipeline (optional)

## 🎯 **Production URLs**

After deployment, your application will be available at:
- **Frontend**: https://your-app.vercel.app
- **Backend API**: https://your-api.railway.app
- **API Documentation**: https://your-api.railway.app/docs

## 🆘 **Troubleshooting**

### **Common Issues**
1. **CORS Errors**: Update `allowed_origins` in backend
2. **Database Connection**: Check MongoDB Atlas IP whitelist
3. **Email Not Sending**: Verify SendGrid API key and domain verification
4. **PDF Generation**: Ensure all dependencies installed in production
5. **Authentication Issues**: Check JWT secret key configuration

### **Debug Commands**
```bash
# Check backend logs
heroku logs --tail --app your-app-name

# Check Vercel deployment
vercel logs

# Test database connection
mongo "mongodb+srv://cluster.mongodb.net/test" --username your-username
```

## 🎉 **Success!**

Your Payment Management System is now deployed to production! 🚀

Monitor the application, gather user feedback, and iterate based on usage patterns.