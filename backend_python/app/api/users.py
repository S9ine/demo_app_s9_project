from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.schemas.user import UserCreate, UserUpdate, UserResponse, RoleCreate, RoleUpdate, RoleResponse
from app.core.security import get_password_hash
from app.core.deps import get_current_active_user, require_role
from app.database import get_db
from app.models.user import User, Role
import json


router = APIRouter()


# ========== USER ENDPOINTS ==========

@router.get("", response_model=List[UserResponse])
async def get_users(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all users
    """
    # Fetch users
    result = await db.execute(select(User).order_by(User.id))
    users = result.scalars().all()
    
    # Fetch roles for mapping
    roles_result = await db.execute(select(Role))
    roles = roles_result.scalars().all()
    role_map = {r.roleId: r for r in roles}
    
    result_list = []
    for user in users:
        role_info = role_map.get(user.roleId)
        result_list.append({
            "id": str(user.id),
            "username": user.username,
            "firstName": user.firstName,
            "lastName": user.lastName,
            "email": user.email,
            "role": role_info.name if role_info else "User",
            "roleId": user.roleId,
            "isActive": user.isActive,
            "createdAt": user.createdAt
        })
    
    return result_list


@router.post("", response_model=UserResponse, dependencies=[Depends(require_role("Admin"))])
async def create_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new user
    """
    # Check if username already exists
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Get role information
    result = await db.execute(select(Role).where(Role.roleId == user_data.roleId))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Create user
    new_user = User(
        username=user_data.username,
        password=get_password_hash(user_data.password),
        firstName=user_data.firstName,
        lastName=user_data.lastName,
        email=user_data.email,
        roleId=user_data.roleId,
        role=role.name,
        isActive=user_data.isActive
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {
        "id": str(new_user.id),
        "username": new_user.username,
        "firstName": new_user.firstName,
        "lastName": new_user.lastName,
        "email": new_user.email,
        "role": role.name,
        "roleId": new_user.roleId,
        "isActive": new_user.isActive,
        "createdAt": new_user.createdAt
    }


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user by ID"""
    try:
        uid = int(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    result = await db.execute(select(Role).where(Role.roleId == user.roleId))
    role = result.scalar_one_or_none()
    
    return {
        "id": str(user.id),
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "role": role.name if role else "User",
        "roleId": user.roleId,
        "isActive": user.isActive,
        "createdAt": user.createdAt
    }


@router.put("/{user_id}", response_model=UserResponse, dependencies=[Depends(require_role("Admin"))])
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update user"""
    try:
        uid = int(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_data.username is not None:
        # Check uniqueness
        result = await db.execute(
            select(User).where(User.username == user_data.username).where(User.id != uid)
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already exists")
        user.username = user_data.username
        
    if user_data.password is not None:
        user.password = get_password_hash(user_data.password)
        
    if user_data.firstName is not None:
        user.firstName = user_data.firstName
        
    if user_data.lastName is not None:
        user.lastName = user_data.lastName
        
    if user_data.email is not None:
        user.email = user_data.email
        
    if user_data.roleId is not None:
        result = await db.execute(select(Role).where(Role.roleId == user_data.roleId))
        role = result.scalar_one_or_none()
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        user.roleId = user_data.roleId
        user.role = role.name
        
    if user_data.isActive is not None:
        user.isActive = user_data.isActive
        
    await db.commit()
    await db.refresh(user)
    
    # Get role info again for response
    result = await db.execute(select(Role).where(Role.roleId == user.roleId))
    role = result.scalar_one_or_none()
    
    return {
        "id": str(user.id),
        "username": user.username,
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "role": role.name if role else "User",
        "roleId": user.roleId,
        "isActive": user.isActive,
        "createdAt": user.createdAt
    }


@router.delete("/{user_id}", dependencies=[Depends(require_role("Admin"))])
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete user"""
    try:
        uid = int(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.username == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
        
    await db.delete(user)
    await db.commit()
    
    return {"message": "User deleted successfully"}


# ========== ROLE ENDPOINTS ==========

@router.get("/roles/all", response_model=List[RoleResponse])
async def get_roles(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all roles"""
    result = await db.execute(select(Role).order_by(Role.id))
    roles = result.scalars().all()
    
    return [
        {
            "id": role.roleId,  # Use roleId string as ID for frontend
            "name": role.name,
            "permissions": json.loads(role.permissions) if role.permissions else []
        }
        for role in roles
    ]


@router.post("/roles", response_model=RoleResponse, dependencies=[Depends(require_role("Admin"))])
async def create_role(
    role_data: RoleCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create role"""
    # Check name
    result = await db.execute(select(Role).where(Role.name == role_data.name))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Role name already exists")
        
    # Generate ID (simple auto-increment logic for roleId string)
    result = await db.execute(select(func.count(Role.id)))
    count = result.scalar()
    role_id = str(count + 1)
    
    new_role = Role(
        roleId=role_id,
        name=role_data.name,
        permissions=json.dumps(role_data.permissions or [])
    )
    
    db.add(new_role)
    await db.commit()
    await db.refresh(new_role)
    
    return {
        "id": new_role.roleId,
        "name": new_role.name,
        "permissions": json.loads(new_role.permissions)
    }


@router.put("/roles/{role_id}", response_model=RoleResponse, dependencies=[Depends(require_role("Admin"))])
async def update_role(
    role_id: str,
    role_data: RoleUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update role"""
    result = await db.execute(select(Role).where(Role.roleId == role_id))
    role = result.scalar_one_or_none()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    if role_data.name is not None:
        role.name = role_data.name
        
    if role_data.permissions is not None:
        role.permissions = json.dumps(role_data.permissions)
        
    await db.commit()
    await db.refresh(role)
    
    return {
        "id": role.roleId,
        "name": role.name,
        "permissions": json.loads(role.permissions)
    }


@router.delete("/roles/{role_id}", dependencies=[Depends(require_role("Admin"))])
async def delete_role(
    role_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete role"""
    result = await db.execute(select(Role).where(Role.roleId == role_id))
    role = result.scalar_one_or_none()
    
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    if role.name == "Admin":
        raise HTTPException(status_code=400, detail="Cannot delete Admin role")
        
    # Check usage
    result = await db.execute(select(func.count(User.id)).where(User.roleId == role_id))
    usage_count = result.scalar()
    
    if usage_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete role. {usage_count} user(s) are assigned to this role"
        )
        
    await db.delete(role)
    await db.commit()
    
    return {"message": "Role deleted successfully"}
