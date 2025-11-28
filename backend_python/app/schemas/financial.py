from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal


class AdvanceItem(BaseModel):
    guardId: str
    amount: float  # Will be converted to Decimal in API
    reason: Optional[str] = ""


class DailyAdvanceCreate(BaseModel):
    docNumber: str
    date: date
    type: str  # "advance" or "cash"
    status: str = "Draft"  # "Draft", "Pending", "Approved", "Rejected"
    items: List[AdvanceItem]


class DailyAdvanceUpdate(BaseModel):
    docNumber: Optional[str] = None
    date: Optional[date] = None
    type: Optional[str] = None
    status: Optional[str] = None
    items: Optional[List[AdvanceItem]] = None


class DailyAdvanceResponse(BaseModel):
    id: str
    docNumber: str
    date: date
    type: str
    status: str
    items: List[AdvanceItem]
    createdBy: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class AdvanceSummary(BaseModel):
    totalAmount: float
    totalItems: int
    documents: List[DailyAdvanceResponse]
