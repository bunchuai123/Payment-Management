from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from app.models import PaymentRequest, RequestCreate, RequestUpdate, RequestApproval, User
from app.routers.auth import get_current_user
from app.database import get_database
from app.utils.email import email_service
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=dict)
async def create_request(
    request: RequestCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new payment request"""
    db = await get_database()
    
    # Create request document
    request_doc = {
        **request.dict(),
        "employee_id": current_user.id,
        "employee_name": current_user.full_name,
        "employee_email": current_user.email,
        "status": "pending",
        "approval_history": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Set initial approver (manager)
    if current_user.manager_id:
        request_doc["current_approver_id"] = current_user.manager_id
        
        # Get manager details for email notification
        manager = await db.users.find_one({"_id": current_user.manager_id})
        if manager:
            # Send email notification to manager
            await email_service.send_request_notification(
                to_email=manager["email"],
                employee_name=current_user.full_name,
                request_type=request.request_type,
                amount=request.amount,
                request_id="pending"  # Will update after insert
            )
    
    result = await db.requests.insert_one(request_doc)
    
    return {
        "message": "Request created successfully",
        "request_id": str(result.inserted_id)
    }

@router.get("/", response_model=List[PaymentRequest])
async def get_requests(
    current_user: User = Depends(get_current_user),
    status: str = None,
    skip: int = 0,
    limit: int = 100
):
    """Get payment requests based on user role"""
    db = await get_database()
    
    # Build query based on user role
    query = {}
    
    if current_user.role == "employee":
        # Employees can only see their own requests
        query["employee_id"] = current_user.id
    elif current_user.role == "manager":
        # Managers can see requests they need to approve + their own
        query = {
            "$or": [
                {"employee_id": current_user.id},
                {"current_approver_id": current_user.id}
            ]
        }
    elif current_user.role in ["hr", "admin"]:
        # HR and Admin can see all requests
        pass
    
    if status:
        query["status"] = status
    
    requests_cursor = db.requests.find(query).skip(skip).limit(limit).sort("created_at", -1)
    requests = []
    
    async for request in requests_cursor:
        request["_id"] = str(request["_id"])
        requests.append(PaymentRequest(**request))
    
    return requests

@router.get("/{request_id}", response_model=PaymentRequest)
async def get_request(
    request_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get specific payment request"""
    db = await get_database()
    
    try:
        request = await db.requests.find_one({"_id": ObjectId(request_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request ID"
        )
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Check permissions
    can_view = (
        request["employee_id"] == current_user.id or  # Own request
        request.get("current_approver_id") == current_user.id or  # Current approver
        current_user.role in ["hr", "admin"]  # HR/Admin
    )
    
    if not can_view:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    request["_id"] = str(request["_id"])
    return PaymentRequest(**request)

@router.put("/{request_id}/approve", response_model=dict)
async def approve_reject_request(
    request_id: str,
    approval: RequestApproval,
    current_user: User = Depends(get_current_user)
):
    """Approve or reject a payment request"""
    db = await get_database()
    
    # Get the request
    try:
        request = await db.requests.find_one({"_id": ObjectId(request_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request ID"
        )
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Check if user can approve this request
    if request.get("current_approver_id") != current_user.id and current_user.role not in ["hr", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to approve this request"
        )
    
    # Add to approval history
    approval_entry = {
        "approver_id": current_user.id,
        "approver_name": current_user.full_name,
        "status": approval.status,
        "comments": approval.comments,
        "approved_at": datetime.utcnow()
    }
    
    # Update request
    update_data = {
        "status": approval.status,
        "updated_at": datetime.utcnow(),
        "$push": {"approval_history": approval_entry}
    }
    
    if approval.status == "rejected":
        update_data["rejection_reason"] = approval.comments
        update_data["current_approver_id"] = None
    
    await db.requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": update_data}
    )
    
    # Send email notification to employee
    await email_service.send_approval_notification(
        to_email=request["employee_email"],
        employee_name=request["employee_name"],
        request_type=request["request_type"],
        amount=request["amount"],
        status=approval.status,
        approver_name=current_user.full_name,
        comments=approval.comments
    )
    
    return {"message": f"Request {approval.status} successfully"}
