from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List


class AuditLogResponse(BaseModel):
    id: int
    action: str
    entityType: str
    entityId: Optional[str]
    entityName: Optional[str]
    userId: int
    username: str
    description: Optional[str]
    oldData: Optional[Dict[str, Any]]
    newData: Optional[Dict[str, Any]]
    changes: Optional[List[str]]
    ipAddress: Optional[str]
    userAgent: Optional[str]
    createdAt: datetime

    class Config:
        from_attributes = True


class AuditLogCreate(BaseModel):
    action: str
    entityType: str
    entityId: Optional[str] = None
    entityName: Optional[str] = None
    description: Optional[str] = None
    oldData: Optional[Dict[str, Any]] = None
    newData: Optional[Dict[str, Any]] = None
    changes: Optional[List[str]] = None
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
