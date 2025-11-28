from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


# ========== CUSTOMER SCHEMAS ==========

class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1)
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    isActive: bool = True


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    isActive: Optional[bool] = None


class CustomerResponse(BaseModel):
    id: str
    name: str
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    isActive: bool
    createdAt: Optional[datetime] = None


# ========== SITE SCHEMAS ==========

class ContractedService(BaseModel):
    id: str
    serviceName: str
    position: str
    payoutRate: float
    hiringRate: float
    diligenceBonus: float = 0.0
    pointBonus: float = 0.0
    otherBonus: float = 0.0


class SiteCreate(BaseModel):
    name: str = Field(..., min_length=1)
    customerId: str
    address: Optional[str] = None
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    contractedServices: List[ContractedService] = []
    isActive: bool = True


class SiteUpdate(BaseModel):
    name: Optional[str] = None
    customerId: Optional[str] = None
    address: Optional[str] = None
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    contractedServices: Optional[List[ContractedService]] = None
    isActive: Optional[bool] = None


class SiteResponse(BaseModel):
    id: str
    name: str
    customerId: str
    customerName: Optional[str] = None
    address: Optional[str] = None
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    contractedServices: List[ContractedService] = []
    isActive: bool
    createdAt: Optional[datetime] = None


# ========== GUARD/STAFF SCHEMAS ==========

class GuardCreate(BaseModel):
    guardId: str = Field(..., min_length=1)  # รหัสพนักงาน
    name: str = Field(..., min_length=1)
    phone: Optional[str] = None
    address: Optional[str] = None
    bankAccountNo: Optional[str] = None
    bankCode: Optional[str] = None
    isActive: bool = True


class GuardUpdate(BaseModel):
    guardId: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    bankAccountNo: Optional[str] = None
    bankCode: Optional[str] = None
    isActive: Optional[bool] = None


class GuardResponse(BaseModel):
    id: str
    guardId: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    bankAccountNo: Optional[str] = None
    bankCode: Optional[str] = None
    isActive: bool
    createdAt: Optional[datetime] = None


# Staff uses same schemas as Guard (they're similar)
StaffCreate = GuardCreate
StaffUpdate = GuardUpdate
StaffResponse = GuardResponse


# ========== BANK SCHEMAS ==========

class BankCreate(BaseModel):
    code: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    shortNameEN: str = Field(..., min_length=1)


class BankUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    shortNameEN: Optional[str] = None


class BankResponse(BaseModel):
    id: str
    code: str
    name: str
    shortNameEN: str
