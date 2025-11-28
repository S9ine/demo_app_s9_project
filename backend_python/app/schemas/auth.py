from pydantic import BaseModel, Field
from typing import Optional, List


class LoginRequest(BaseModel):
    """Login request schema"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    """User response schema (without password)"""
    id: str
    username: str
    firstName: str
    lastName: str
    email: Optional[str] = None
    role: str
    permissions: List[str] = []
    isActive: bool
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
