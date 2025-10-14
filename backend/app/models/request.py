from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RequestType(str, Enum):
    OVERTIME = "overtime"
    BONUS = "bonus"
    REIMBURSEMENT = "reimbursement"
    SALARY_ADVANCE = "salary_advance"
    COMMISSION = "commission"

class RequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED_L1 = "approved_l1"  # First level approval
    APPROVED_L2 = "approved_l2"  # Second level approval (if needed)
    APPROVED_FINAL = "approved_final"  # Final approval
    REJECTED = "rejected"
    PAID = "paid"

class ApprovalHistory(BaseModel):
    approver_id: str
    approver_name: str
    status: RequestStatus
    comments: Optional[str] = None
    approved_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentRequest(BaseModel):
    id: Optional[str] = Field(alias="_id")
    employee_id: str
    employee_name: str
    employee_email: str
    request_type: RequestType
    amount: float
    description: str
    supporting_documents: Optional[List[str]] = []  # URLs or file paths
    status: RequestStatus = RequestStatus.PENDING
    approval_history: List[ApprovalHistory] = []
    current_approver_id: Optional[str] = None
    rejection_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    requested_payment_date: Optional[datetime] = None
    actual_payment_date: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "employee_id": "employee_id_here",
                "employee_name": "John Doe",
                "employee_email": "john.doe@company.com",
                "request_type": "overtime",
                "amount": 500.00,
                "description": "Overtime work for project deadline",
                "requested_payment_date": "2025-10-20T00:00:00Z"
            }
        }

class RequestCreate(BaseModel):
    request_type: RequestType
    amount: float
    description: str
    supporting_documents: Optional[List[str]] = []
    requested_payment_date: Optional[datetime] = None

class RequestUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    supporting_documents: Optional[List[str]] = None
    requested_payment_date: Optional[datetime] = None

class RequestApproval(BaseModel):
    status: RequestStatus
    comments: Optional[str] = None
