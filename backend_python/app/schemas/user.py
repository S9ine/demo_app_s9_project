from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for creating a new user"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    firstName: str = Field(..., min_length=1)
    lastName: str = Field(..., min_length=1)
    email: Optional[EmailStr] = None
    roleId: str
    isActive: bool = True


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    password: Optional[str] = Field(None, min_length=6)
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    roleId: Optional[str] = None
    isActive: Optional[bool] = None


class UserResponse(BaseModel):
    """Schema for user response"""
    id: str
    username: str
    firstName: str
    lastName: str
    email: Optional[str] = None
    role: str
    roleId: str
    isActive: bool
    createdAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class RoleCreate(BaseModel):
    """Schema for creating a role"""
    name: str = Field(..., min_length=1)
    permissions: list[str] = []


class RoleUpdate(BaseModel):
    """Schema for updating a role"""
    name: Optional[str] = None
    permissions: Optional[list[str]] = None


class RoleResponse(BaseModel):
    """Schema for role response"""
    id: str
    name: str
    permissions: list[str]
    
    class Config:
        from_attributes = True
