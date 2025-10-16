# Payment Management System - Local Development Guide

## 🚀 Quick Start (Local Development)

### Option 1: One-Click Startup (Windows)
```bash
# Double-click or run from command line:
start-local-dev.bat
```

### Option 2: One-Click Startup (Linux/Mac)
```bash
# Make executable and run:
chmod +x start-local-dev.sh
./start-local-dev.sh
```

### Option 3: Manual Startup

#### Backend Server
```bash
cd backend
venv\Scripts\activate    # Windows
# or
source venv/bin/activate # Linux/Mac
python test_server.py
```

#### Frontend Server
```bash
cd frontend
npm run dev
```

## 🌐 Local Development URLs

- **Frontend Application**: http://localhost:3001
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## 👤 Default Login Credentials

```
Email: admin@paymentpro.com
Password: admin123
```

## 🔗 Production URLs (Already Deployed)

- **Frontend**: https://payment-management-hbbag7fn6-bunchuai123s-projects.vercel.app
- **Backend API**: https://paymentpro-production.up.railway.app
- **Database**: MongoDB Atlas (Cloud)

## 🛠️ Development Tips

1. **Backend**: Runs with auto-reload enabled - changes to Python files will restart the server
2. **Frontend**: Runs with hot-reload - changes to React/Next.js files will update instantly
3. **Database**: Uses production MongoDB Atlas - all data is shared between local and production
4. **Environment**: Local development uses `.env` and `.env.local` files for configuration

## 🔧 Troubleshooting

### Port Conflicts
- If port 3000 is in use, Next.js will automatically use 3001
- If port 8000 is in use, manually change the backend port in `test_server.py`

### Backend Issues
- Make sure virtual environment is activated
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify MongoDB connection in `.env` file

### Frontend Issues
- Make sure dependencies are installed: `npm install`
- Check that `.env.local` points to the correct backend URL
- Clear browser cache if needed

## 📁 Project Structure

```
Payment Management/
├── backend/                 # FastAPI Backend
│   ├── venv/               # Python Virtual Environment
│   ├── test_server.py      # Main Server File
│   ├── requirements.txt    # Python Dependencies
│   └── .env               # Backend Environment Variables
├── frontend/               # Next.js Frontend
│   ├── package.json       # Node Dependencies
│   ├── .env.local         # Frontend Environment Variables
│   └── src/               # React Components
├── start-local-dev.bat    # Windows Startup Script
└── start-local-dev.sh     # Linux/Mac Startup Script
```