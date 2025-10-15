from fastapi import FastAPI, HTTPException, Depends, Form, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from jose import jwt
from datetime import datetime, timedelta
import hashlib
import uuid
import json
import io

# Import our PDF generator
try:
    from pdf_generator import generate_paycheck_pdf, generate_report_pdf
except ImportError as e:
    print(f"Warning: Could not import PDF generator - {e}")
    generate_paycheck_pdf = None
    generate_report_pdf = None

# Simple FastAPI app for testing
app = FastAPI(title="Payment Management Test API")

# CORS middleware with very permissive settings for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Secret key for JWT
SECRET_KEY = "test-secret-key-for-development"
ALGORITHM = "HS256"

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Simple in-memory user store
users_db = {
    "test@example.com": {
        "id": "user_1",
        "email": "test@example.com",
        "hashed_password": hashlib.sha256("testpassword123".encode()).hexdigest(),
        "full_name": "Test User",
        "role": "employee"
    },
    "manager@example.com": {
        "id": "user_2", 
        "email": "manager@example.com",
        "hashed_password": hashlib.sha256("manager123".encode()).hexdigest(),
        "full_name": "Test Manager",
        "role": "manager"
    }
}

# In-memory requests store with sample data
requests_db = {
    "req_001": {
        "id": "req_001",
        "employee_id": "user_1",
        "employee_name": "Test User",
        "employee_email": "test@example.com",
        "request_type": "overtime",
        "amount": 500.0,
        "description": "Overtime work for project deadline - worked 10 extra hours last week",
        "status": "pending",
        "created_at": "2025-10-14T10:00:00",
        "updated_at": "2025-10-14T10:00:00",
        "requested_payment_date": "2025-10-20T00:00:00",
        "supporting_documents": ["documents/req_001/timesheet.pdf"],
        "approval_history": [],
        "rejection_reason": None
    },
    "req_002": {
        "id": "req_002", 
        "employee_id": "user_1",
        "employee_name": "Test User",
        "employee_email": "test@example.com",
        "request_type": "reimbursement",
        "amount": 125.50,
        "description": "Business lunch with client - receipt attached",
        "status": "approved_final",
        "created_at": "2025-10-10T14:30:00",
        "updated_at": "2025-10-11T09:15:00",
        "requested_payment_date": None,
        "supporting_documents": ["documents/req_002/receipt.jpg"],
        "approval_history": [
            {
                "approver_id": "user_2",
                "approver_name": "Test Manager", 
                "status": "approved_final",
                "comments": "Approved - valid business expense",
                "approved_at": "2025-10-11T09:15:00"
            }
        ],
        "rejection_reason": None
    }
}

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class RequestCreate(BaseModel):
    request_type: str
    amount: float
    description: str
    requested_payment_date: Optional[str] = None

class RequestResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    employee_email: str
    request_type: str
    amount: float
    description: str
    status: str
    created_at: str
    updated_at: str
    requested_payment_date: Optional[str] = None
    supporting_documents: List[str] = []
    approval_history: List[dict] = []
    rejection_reason: Optional[str] = None

class ApprovalRequest(BaseModel):
    status: str  # 'approved_final' or 'rejected'
    comments: Optional[str] = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using simple hash"""
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    """Hash password using simple hash"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token and return user email"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except jwt.PyJWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email = verify_token(token)
    if email is None:
        raise credentials_exception
    
    user = users_db.get(email)
    if user is None:
        raise credentials_exception
    
    return user

@app.get("/")
async def root():
    return {"message": "Payment Management Test API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login endpoint"""
    user = users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"]
        )
    )

@app.get("/api/auth/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"]
    )

# Request Management Endpoints

@app.post("/api/requests", response_model=dict)
async def create_request(
    request_type: str = Form(...),
    amount: float = Form(...),
    description: str = Form(...),
    requested_payment_date: Optional[str] = Form(None),
    supporting_documents: List[UploadFile] = File(default=[]),
    current_user: dict = Depends(get_current_user)
):
    """Create a new payment request"""
    
    # Generate request ID
    request_id = str(uuid.uuid4())
    
    # Store files (in real app, upload to cloud storage)
    document_urls = []
    for file in supporting_documents:
        if file.filename:
            document_urls.append(f"documents/{request_id}/{file.filename}")
    
    # Create request
    request_data = {
        "id": request_id,
        "employee_id": current_user["id"],
        "employee_name": current_user["full_name"],
        "employee_email": current_user["email"],
        "request_type": request_type,
        "amount": amount,
        "description": description,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "requested_payment_date": requested_payment_date,
        "supporting_documents": document_urls,
        "approval_history": [],
        "rejection_reason": None
    }
    
    requests_db[request_id] = request_data
    
    # Send notification to manager (mock)
    await send_new_request_notification(request_data, current_user)
    
    return {
        "message": "Request created successfully",
        "request_id": request_id
    }

async def send_new_request_notification(request: dict, employee: dict):
    """Mock email notification for new request submission"""
    # In real app, find manager email from database
    manager_email = "manager@example.com"  # Mock manager email
    
    subject = f"🔔 New Payment Request - {request['request_type'].replace('_', ' ').title()}"
    message = f"""
    Dear Manager,

    A new payment request has been submitted for your approval.

    Request Details:
    - Employee: {employee['full_name']} ({employee['email']})
    - Type: {request['request_type'].replace('_', ' ').title()}
    - Amount: ${request['amount']:,.2f}
    - Description: {request['description']}
    - Requested Date: {request.get('requested_payment_date', 'Not specified')}

    Please review and approve/reject this request in the system.

    Best regards,
    Payment Management System
    """
    
    # Mock email sending
    print(f"""
    📧 EMAIL SENT TO MANAGER
    To: {manager_email}
    Subject: {subject}
    Message: {message.strip()}
    """)
    
    return True

@app.get("/api/requests", response_model=List[RequestResponse])
async def get_requests(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get payment requests based on user role"""
    
    filtered_requests = []
    
    for request in requests_db.values():
        # Role-based filtering
        if current_user["role"] == "employee":
            # Employees only see their own requests
            if request["employee_id"] != current_user["id"]:
                continue
        elif current_user["role"] == "manager":
            # Managers see requests they can approve + their own
            if (request["employee_id"] != current_user["id"] and 
                request["status"] != "pending"):
                continue
        # HR and Admin see all requests
        
        # Status filtering
        if status and request["status"] != status:
            continue
            
        filtered_requests.append(RequestResponse(**request))
    
    # Sort by creation date (newest first)
    filtered_requests.sort(key=lambda x: x.created_at, reverse=True)
    
    return filtered_requests

@app.get("/api/requests/{request_id}", response_model=RequestResponse)
async def get_request(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get specific payment request"""
    
    if request_id not in requests_db:
        raise HTTPException(status_code=404, detail="Request not found")
    
    request = requests_db[request_id]
    
    # Check permissions
    can_view = (
        request["employee_id"] == current_user["id"] or  # Own request
        current_user["role"] in ["manager", "hr", "admin"]  # Can approve
    )
    
    if not can_view:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return RequestResponse(**request)

@app.put("/api/requests/{request_id}/approve", response_model=dict)
async def approve_reject_request(
    request_id: str,
    approval: ApprovalRequest,
    current_user: dict = Depends(get_current_user)
):
    """Approve or reject a payment request"""
    
    if request_id not in requests_db:
        raise HTTPException(status_code=404, detail="Request not found")
    
    request = requests_db[request_id]
    
    # Check permissions
    if current_user["role"] not in ["manager", "hr", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if request["status"] != "pending":
        raise HTTPException(status_code=400, detail="Request is not pending")
    
    if request["employee_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot approve own request")
    
    # Add approval history
    approval_entry = {
        "approver_id": current_user["id"],
        "approver_name": current_user["full_name"],
        "status": approval.status,
        "comments": approval.comments,
        "approved_at": datetime.utcnow().isoformat()
    }
    
    # Update request
    request["status"] = approval.status
    request["updated_at"] = datetime.utcnow().isoformat()
    request["approval_history"].append(approval_entry)
    
    if approval.status == "rejected":
        request["rejection_reason"] = approval.comments
    
    # Send email notifications
    await send_email_notification(request, approval.status, current_user, approval.comments)
    
    return {"message": f"Request {approval.status} successfully"}

async def send_email_notification(request: dict, status: str, approver: dict, comments: str = None):
    """Mock email notification service"""
    employee_email = request["employee_email"]
    employee_name = request["employee_name"]
    request_type = request["request_type"]
    amount = request["amount"]
    
    if status == "approved_final":
        subject = f"✅ Payment Request Approved - {request_type.replace('_', ' ').title()}"
        message = f"""
        Dear {employee_name},

        Your payment request has been approved!

        Request Details:
        - Type: {request_type.replace('_', ' ').title()}
        - Amount: ${amount:,.2f}
        - Approved by: {approver['full_name']}
        - Status: Approved
        {f'- Comments: {comments}' if comments else ''}

        Your payment will be processed according to company policy.

        Best regards,
        Payment Management System
        """
    else:  # rejected
        subject = f"❌ Payment Request Rejected - {request_type.replace('_', ' ').title()}"
        message = f"""
        Dear {employee_name},

        Your payment request has been rejected.

        Request Details:
        - Type: {request_type.replace('_', ' ').title()}
        - Amount: ${amount:,.2f}
        - Rejected by: {approver['full_name']}
        - Reason: {comments or 'No specific reason provided'}

        Please contact your manager if you have any questions.

        Best regards,
        Payment Management System
        """
    
    # Mock email sending (in production, use SendGrid, etc.)
    print(f"""
    📧 EMAIL SENT
    To: {employee_email}
    Subject: {subject}
    Message: {message.strip()}
    """)
    
    return True


# PDF Generation Endpoints
@app.get("/api/reports/paycheck/{request_id}")
async def generate_paycheck(request_id: str, token: str = Depends(oauth2_scheme)):
    """
    Generate PDF paycheck for an approved payment request
    """
    if generate_paycheck_pdf is None:
        raise HTTPException(status_code=500, detail="PDF generation not available")
    
    # Verify token and get user
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get full user object
    current_user = users_db.get(email)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Get request
    request_data = requests_db.get(request_id)
    if not request_data:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Only allow PDF generation for approved requests
    if request_data['status'] not in ['approved', 'approved_final']:
        raise HTTPException(status_code=400, detail="Paycheck can only be generated for approved requests")
    
    # Check permissions - only employee who made request or managers can generate PDF
    user_role = current_user.get('role', '')
    is_request_owner = request_data['employee_id'] == current_user['id']
    is_manager = user_role in ['manager', 'hr', 'admin']
    
    if not (is_request_owner or is_manager):
        raise HTTPException(status_code=403, detail="Not authorized to generate paycheck for this request")
    
    # Get employee data
    employee_email = request_data['employee_email']
    employee_data = None
    for user in users_db.values():
        if user['email'] == employee_email:
            employee_data = user
            break
    
    if not employee_data:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    try:
        # Check if PDF generation is available
        if generate_paycheck_pdf is None:
            raise HTTPException(status_code=500, detail="PDF generation not available - ReportLab not installed")
        
        # Generate PDF
        pdf_content = generate_paycheck_pdf(request_data, employee_data)
        
        # Create filename
        filename = f"paycheck_{request_id}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        # Return PDF as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        print(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF")


@app.get("/api/reports/summary")
async def generate_summary_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    token: str = Depends(oauth2_scheme)
):
    """
    Generate PDF summary report of all payment requests
    """
    if generate_report_pdf is None:
        raise HTTPException(status_code=500, detail="PDF generation not available")
    
    # Verify token and get user
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get full user object
    current_user = users_db.get(email)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Only managers/HR/admin can generate summary reports
    user_role = current_user.get('role', '')
    if user_role not in ['manager', 'hr', 'admin']:
        raise HTTPException(status_code=403, detail="Not authorized to generate summary reports")
    
    try:
        # Get all requests (managers can see all, employees only their own)
        all_requests = list(requests_db.values())
        
        # Filter by date range if provided
        if start_date or end_date:
            filtered_requests = []
            for req in all_requests:
                req_date = req.get('created_at', '')[:10]  # Get date part
                
                if start_date and req_date < start_date:
                    continue
                if end_date and req_date > end_date:
                    continue
                    
                filtered_requests.append(req)
            
            all_requests = filtered_requests
        
        # Set up date range for report
        date_range = {
            'start_date': start_date or 'Beginning',
            'end_date': end_date or 'Present'
        }
        
        # Check if PDF generation is available
        if generate_report_pdf is None:
            raise HTTPException(status_code=500, detail="PDF generation not available - ReportLab not installed")
        
        # Generate PDF
        pdf_content = generate_report_pdf(all_requests, date_range)
        
        # Create filename
        filename = f"payment_summary_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        # Return PDF as streaming response
        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        print(f"Error generating summary report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")


@app.get("/api/reports/analytics")
async def get_analytics_data(token: str = Depends(oauth2_scheme)):
    """
    Get analytics data for dashboard charts
    """
    # Verify token and get user
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user from database
    current_user = users_db.get(email)
    if not current_user:
        raise HTTPException(status_code=401, detail="User not found")
    
    user_role = current_user.get('role', '')
    
    # Get requests based on user role
    if user_role in ['manager', 'hr', 'admin']:
        # Managers can see all requests
        all_requests = list(requests_db.values())
    else:
        # Employees can only see their own requests
        user_id = current_user['id']
        all_requests = [req for req in requests_db.values() if req['employee_id'] == user_id]
    
    # Calculate analytics
    total_requests = len(all_requests)
    approved_count = len([req for req in all_requests if req['status'] in ['approved', 'approved_final']])
    pending_count = len([req for req in all_requests if req['status'] == 'pending'])
    rejected_count = len([req for req in all_requests if req['status'] == 'rejected'])
    
    # Request types breakdown
    request_types = {}
    for req in all_requests:
        req_type = req.get('request_type', 'Unknown').title()
        request_types[req_type] = request_types.get(req_type, 0) + 1
    
    # Monthly trends (simplified for demo)
    monthly_data = {
        'October 2025': total_requests  # Simplified - in real app would calculate by month
    }
    
    # Amount statistics
    total_amount_requested = sum(req.get('amount', 0) for req in all_requests)
    total_amount_approved = sum(req.get('amount', 0) for req in all_requests if req['status'] in ['approved', 'approved_final'])
    
    analytics_data = {
        'summary': {
            'total_requests': total_requests,
            'approved_count': approved_count,
            'pending_count': pending_count,
            'rejected_count': rejected_count,
            'approval_rate': round((approved_count / total_requests * 100) if total_requests > 0 else 0, 1)
        },
        'request_types': request_types,
        'monthly_trends': monthly_data,
        'amounts': {
            'total_requested': round(total_amount_requested, 2),
            'total_approved': round(total_amount_approved, 2),
            'average_request': round(total_amount_requested / total_requests if total_requests > 0 else 0, 2)
        }
    }
    
    return analytics_data

# Settings API Endpoints

@app.put("/api/user/profile")
async def update_user_profile(request: Request):
    """Update user profile information"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = users_db.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    try:
        body = await request.json()
        
        # Update user profile fields
        if 'name' in body:
            user['full_name'] = body['name']
        if 'email' in body and body['email'] != email:
            # Handle email change (would need additional verification in production)
            user['email'] = body['email']
        if 'phone' in body:
            user['phone'] = body.get('phone', '')
        if 'department' in body:
            user['department'] = body.get('department', '')
        
        user['updated_at'] = datetime.now().isoformat()
        
        # Update in database
        users_db[email] = user
        
        return {"message": "Profile updated successfully", "user": user}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@app.put("/api/user/change-password")
async def change_password(request: Request):
    """Change user password"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = users_db.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    try:
        body = await request.json()
        current_password = body.get('currentPassword')
        new_password = body.get('newPassword')
        
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail="Current and new password are required")
        
        # Verify current password
        if not verify_password(current_password, user.get('password_hash', '')):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Validate new password
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
        # Update password
        user['password_hash'] = get_password_hash(new_password)
        user['updated_at'] = datetime.now().isoformat()
        
        # Update in database
        users_db[email] = user
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to change password: {str(e)}")

@app.put("/api/user/notifications")
async def update_notification_settings(request: Request):
    """Update user notification preferences"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = users_db.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    try:
        body = await request.json()
        
        # Initialize notifications settings if not exists
        if 'notifications' not in user:
            user['notifications'] = {}
        
        # Update notification settings
        user['notifications'].update(body)
        user['updated_at'] = datetime.now().isoformat()
        
        # Update in database
        users_db[email] = user
        
        return {"message": "Notification settings updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update notifications: {str(e)}")

@app.put("/api/user/security")
async def update_security_settings(request: Request):
    """Update user security settings"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = users_db.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    try:
        body = await request.json()
        
        # Initialize security settings if not exists
        if 'security' not in user:
            user['security'] = {}
        
        # Update security settings
        user['security'].update(body)
        user['updated_at'] = datetime.now().isoformat()
        
        # Update in database
        users_db[email] = user
        
        return {"message": "Security settings updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update security settings: {str(e)}")

@app.put("/api/user/preferences")
async def update_user_preferences(request: Request):
    """Update user preferences"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = users_db.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    try:
        body = await request.json()
        
        # Initialize preferences if not exists
        if 'preferences' not in user:
            user['preferences'] = {}
        
        # Update preferences
        user['preferences'].update(body)
        user['updated_at'] = datetime.now().isoformat()
        
        # Update in database
        users_db[email] = user
        
        return {"message": "Preferences updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update preferences: {str(e)}")

# Admin Settings Endpoints

@app.put("/api/admin/company")
async def update_company_settings(request: Request):
    """Update company settings (Admin/HR only)"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = users_db.get(email)
    if not user or user.get('role') not in ['hr', 'admin']:
        raise HTTPException(status_code=403, detail="Not authorized to update company settings")
    
    try:
        body = await request.json()
        
        # Store company settings in a global variable or separate store
        # For this demo, we'll just return success
        return {"message": "Company settings updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update company settings: {str(e)}")

@app.put("/api/admin/system")
async def update_system_settings(request: Request):
    """Update system settings (Admin only)"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = users_db.get(email)
    if not user or user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized to update system settings")
    
    try:
        body = await request.json()
        
        # Store system settings in a global variable or separate store
        # For this demo, we'll just return success
        return {"message": "System settings updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update system settings: {str(e)}")

@app.get("/api/user/settings")
async def get_user_settings(request: Request):
    """Get all user settings"""
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    
    email = verify_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = users_db.get(email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    try:
        return {
            "profile": {
                "name": user.get('full_name', ''),
                "email": user.get('email', ''),
                "phone": user.get('phone', ''),
                "department": user.get('department', ''),
                "position": user.get('role', '')
            },
            "notifications": user.get('notifications', {
                "emailNotifications": True,
                "requestUpdates": True,
                "approvalReminders": True,
                "systemUpdates": False,
                "notificationFrequency": "immediate"
            }),
            "security": user.get('security', {
                "twoFactorEnabled": False,
                "sessionTimeout": 60,
                "passwordLastChanged": user.get('created_at', '2025-10-01')
            }),
            "preferences": user.get('preferences', {
                "theme": "system",
                "language": "en",
                "timezone": "America/New_York",
                "dateFormat": "MM/dd/yyyy",
                "currency": "USD"
            })
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user settings: {str(e)}")

if __name__ == "__main__":
    try:
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8001)
    except ImportError:
        print("uvicorn not installed. Install with: pip install uvicorn")
        print("Running with: python -m uvicorn test_server:app --host 0.0.0.0 --port 8001")
