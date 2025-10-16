# Payment Management System

# Payment Management System

A comprehensive payment request management system built with Next.js and MongoDB.

🚀 **Status**: Ready for production deployment with Vercel integration

## Features

- 🔐 **User Authentication** - JWT-based authentication with role-based access control
- 📝 **Request Management** - Create, view, and manage payment requests
- ✅ **Approval Workflow** - Multi-level approval process with email notifications
- 📧 **Email Notifications** - Automated notifications for request status changes
- 📄 **PDF Generation** - Generate printable paychecks for approved requests
- 🎯 **Role-Based Access** - Different permissions for employees, managers, HR, and admins

## Technology Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **MongoDB** - NoSQL database for flexible data storage
- **JWT** - Secure authentication tokens
- **SendGrid** - Email service for notifications
- **ReportLab** - PDF generation for paychecks

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client for API calls

## Project Structure

```
Payment Management/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── models/         # Pydantic data models
│   │   ├── routers/        # API route handlers
│   │   ├── utils/          # Utility functions (auth, email)
│   │   ├── main.py         # FastAPI application
│   │   └── database.py     # MongoDB connection
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example       # Environment variables template
│   └── start.bat          # Windows startup script
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utility functions
│   ├── package.json       # Node.js dependencies
│   ├── .env.example      # Environment variables template
│   └── start.bat         # Windows startup script
└── ProjectPlan.md         # Detailed project plan
```

## Quick Start

### Prerequisites

- **Python 3.8+** installed
- **Node.js 18+** installed
- **MongoDB** running locally or MongoDB Atlas account
- **SendGrid** account for email notifications (optional for development)

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Run the startup script:
   ```bash
   start.bat
   ```
   
   Or manually:
   ```bash
   # Create virtual environment
   python -m venv venv
   venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Copy and configure environment
   copy .env.example .env
   # Edit .env with your actual values
   
   # Start server
   uvicorn app.main:app --reload --port 8000
   ```

3. **Configure Environment Variables** in `.env`:
   ```
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=payment_management
   SECRET_KEY=your-very-secret-key-here
   SENDGRID_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=noreply@yourcompany.com
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Run the startup script:
   ```bash
   start.bat
   ```
   
   Or manually:
   ```bash
   # Install dependencies
   npm install
   
   # Copy environment file
   copy .env.example .env.local
   
   # Start development server
   npm run dev
   ```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)

## Development Phase Status

### ✅ Phase 1: Project Setup & Core Data Models (COMPLETED)
- [x] FastAPI project initialized
- [x] MongoDB connection setup
- [x] User and Request data models defined
- [x] Email service configuration
- [x] Next.js project initialized
- [x] Basic project structure created

### 🚧 Phase 2: User Authentication & Roles (READY TO START)
- [ ] Authentication endpoints implementation
- [ ] JWT security setup
- [ ] Login/Register pages
- [ ] Role-based access control

### 📋 Phase 3: Request Submission & Approval Workflow (PENDING)
- [ ] Request management APIs
- [ ] Email notification triggers
- [ ] Submission forms
- [ ] Approval dashboard

### 📋 Phase 4: Paycheck Generation & Printing (PENDING)
- [ ] PDF generation integration
- [ ] Paycheck templates
- [ ] Print functionality

### 📋 Phase 5: Testing, Refinement & Deployment (PENDING)
- [ ] Comprehensive testing
- [ ] UI/UX polish
- [ ] Production deployment

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Users
- `GET /api/users/` - Get all users (admin/hr only)
- `GET /api/users/{user_id}` - Get specific user
- `PUT /api/users/{user_id}` - Update user information

### Payment Requests
- `POST /api/requests/` - Create new payment request
- `GET /api/requests/` - Get payment requests (filtered by role)
- `GET /api/requests/{request_id}` - Get specific request
- `PUT /api/requests/{request_id}/approve` - Approve/reject request

## User Roles

- **Employee**: Can create and view their own payment requests
- **Manager**: Can approve/reject requests from their team members
- **HR**: Can view and manage all requests and users
- **Admin**: Full system access and management capabilities

## Next Steps

1. **Configure MongoDB**: Set up your MongoDB database (local or Atlas)
2. **Configure Email**: Set up SendGrid account for email notifications
3. **Start Development**: Begin with Phase 2 - User Authentication
4. **Test System**: Use the provided API endpoints to test functionality

## Support

For questions or issues during development, refer to:
- FastAPI Documentation: https://fastapi.tiangolo.com/
- Next.js Documentation: https://nextjs.org/docs
- MongoDB Documentation: https://docs.mongodb.com/

---

**Project Status**: Phase 1 Complete ✅ | Ready for Phase 2 Development 🚀
