from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models import User, UserUpdate
from app.routers.auth import get_current_user
from app.database import get_database

router = APIRouter()

@router.get("/", response_model=List[User])
async def get_users(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    """Get all users (admin/hr only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db = await get_database()
    users_cursor = db.users.find().skip(skip).limit(limit)
    users = []
    
    async for user in users_cursor:
        users.append(User(**user))
    
    return users

@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get user by ID"""
    # Users can only view their own profile unless they're admin/hr
    if current_user.id != user_id and current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db = await get_database()
    user = await db.users.find_one({"_id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(**user)

@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update user information"""
    # Users can only update their own profile unless they're admin/hr
    if current_user.id != user_id and current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db = await get_database()
    
    # Build update document
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data to update"
        )
    
    # Add updated timestamp
    from datetime import datetime
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.users.update_one(
        {"_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return updated user
    updated_user = await db.users.find_one({"_id": user_id})
    return User(**updated_user)
