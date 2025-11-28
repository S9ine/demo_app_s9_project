from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.auth import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token
from app.core.deps import get_current_active_user
from app.database import get_db
from app.models.user import User, Role
import json


router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    User login endpoint
    """
    # Find user by username
    result = await db.execute(select(User).where(User.username == credentials.username))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        )
    
    # Verify password
    if not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
        )
    
    # Check if user is active
    if not user.isActive:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="บัญชีผู้ใช้ถูกปิดใช้งาน",
        )
    
    # Get role permissions
    result = await db.execute(select(Role).where(Role.roleId == user.roleId))
    role = result.scalar_one_or_none()
    permissions = json.loads(role.permissions) if role and role.permissions else []
    
    # Create access token
    access_token = create_access_token(data={"sub": user.username})
    
    # Prepare user data for response
    user_data = {
        "id": str(user.id),
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "role": user.role,
        "permissions": permissions,
        "isActive": user.isActive,
    }
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }


@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user information
    """
    # Get role permissions
    result = await db.execute(select(Role).where(Role.roleId == current_user.roleId))
    role = result.scalar_one_or_none()
    permissions = json.loads(role.permissions) if role and role.permissions else []
    
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "firstName": current_user.firstName,
        "lastName": current_user.lastName,
        "email": current_user.email,
        "role": current_user.role,
        "permissions": permissions,
        "isActive": current_user.isActive,
    }


@router.post("/logout")
async def logout():
    """
    Logout endpoint (client-side should delete token)
    """
    return {"message": "Logged out successfully"}
