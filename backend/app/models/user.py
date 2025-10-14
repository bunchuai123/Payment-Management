from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    EMPLOYEE = "employee"
    MANAGER = "manager"
    HR = "hr"
    ADMIN = "admin"

class User(BaseModel):
    id: Optional[str] = Field(alias="_id")
    email: EmailStr
    full_name: str
    role: UserRole
    department: Optional[str] = None
    manager_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "email": "john.doe@company.com",
                "full_name": "John Doe",
                "role": "employee",
                "department": "Engineering",
                "manager_id": "manager_id_here"
            }
        }

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.EMPLOYEE
    department: Optional[str] = None
    manager_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    manager_id: Optional[str] = None
    is_active: Optional[bool] = None
