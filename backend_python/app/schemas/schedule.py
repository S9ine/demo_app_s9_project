"""
Schedule Schemas
Pydantic schemas สำหรับ API ตารางงาน
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


# ========== GUARD IN SHIFT SCHEMA ==========

class GuardInShift(BaseModel):
    """พนักงานที่ถูกจัดเข้ากะ"""
    id: int = Field(..., description="Guard ID")
    guardId: Optional[str] = None
    staffId: Optional[str] = None
    code: Optional[str] = None
    firstName: str
    lastName: str
    position: str
    dailyIncome: float = Field(0.0, ge=0)
    payoutRate: float = Field(0.0, ge=0)
    hiringRate: float = Field(0.0, ge=0)
    positionAllowance: float = Field(0.0, ge=0)
    diligenceBonus: float = Field(0.0, ge=0)
    sevenDayBonus: float = Field(0.0, ge=0)
    pointBonus: float = Field(0.0, ge=0)
    otherAllowance: float = Field(0.0, ge=0)

    class Config:
        extra = "allow"  # อนุญาตให้มี field เพิ่มเติม


# ========== SCHEDULE SCHEMAS ==========

class ScheduleCreate(BaseModel):
    """สร้างตารางงาน"""
    scheduleDate: date = Field(..., description="วันที่จัดตารางงาน")
    siteId: int = Field(..., description="ID ของหน่วยงาน")
    siteName: str = Field(..., description="ชื่อหน่วยงาน")
    shifts: Dict[str, List[Any]] = Field(..., description="ข้อมูลกะงาน - key คือ shiftCode")
    remarks: Optional[str] = Field(None, description="หมายเหตุ")


class ScheduleUpdate(BaseModel):
    """อัปเดตตารางงาน"""
    shifts: Optional[Dict[str, List[Any]]] = None
    remarks: Optional[str] = None
    isActive: Optional[bool] = None


class ScheduleResponse(BaseModel):
    """Response ตารางงาน"""
    id: int
    scheduleDate: date
    siteId: int
    siteName: str
    shifts: Dict[str, List[Any]]
    totalGuardsDay: int
    totalGuardsNight: int
    totalGuards: int
    isActive: bool
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    createdBy: Optional[int] = None
    remarks: Optional[str] = None


class ScheduleListItem(BaseModel):
    """รายการตารางงานแบบสั้น (สำหรับ list view)"""
    id: int
    scheduleDate: date
    siteId: int
    siteName: str
    totalGuardsDay: int
    totalGuardsNight: int
    totalGuards: int
    isActive: bool
