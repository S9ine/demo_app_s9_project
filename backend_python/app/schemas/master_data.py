from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime
import re


# ========== CUSTOMER SCHEMAS ==========

class CustomerCreate(BaseModel):
    code: str = Field(..., min_length=1, description="รหัสลูกค้า (ไม่อนุญาตให้มีช่องว่าง)")
    name: str = Field(..., min_length=1)
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    # --- เพิ่มฟิลด์ใหม่ ---
    taxId: Optional[str] = None
    mapLink: Optional[str] = None
    contact: Optional[dict] = None  # รับเป็น JSON Object
    billing: Optional[dict] = None  # รับเป็น JSON Object
    # -------------------
    isActive: bool = True

    @field_validator('code')
    @classmethod
    def code_no_spaces(cls, v: str) -> str:
        """Validate that code contains no spaces"""
        if ' ' in v:
            raise ValueError('รหัสลูกค้าต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสลูกค้าต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


class CustomerUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    # --- เพิ่มฟิลด์ใหม่ ---
    taxId: Optional[str] = None
    mapLink: Optional[str] = None
    contact: Optional[dict] = None
    billing: Optional[dict] = None
    # -------------------
    isActive: Optional[bool] = None

    @field_validator('code')
    @classmethod
    def code_no_spaces(cls, v: Optional[str]) -> Optional[str]:
        """Validate that code contains no spaces"""
        if v is None:
            return v
        if ' ' in v:
            raise ValueError('รหัสลูกค้าต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสลูกค้าต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


class CustomerResponse(BaseModel):
    id: str
    code: str
    name: str
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    # --- เพิ่มฟิลด์ใหม่ ---
    taxId: Optional[str] = None
    mapLink: Optional[str] = None
    contact: Optional[dict] = None
    billing: Optional[dict] = None
    # -------------------
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
    guardId: str = Field(..., min_length=1, description="รหัสพนักงาน (ไม่อนุญาตให้มีช่องว่าง)")
    name: str = Field(..., min_length=1)
    phone: Optional[str] = None
    address: Optional[str] = None
    bankAccountNo: Optional[str] = None
    bankCode: Optional[str] = None
    isActive: bool = True

    @field_validator('guardId')
    @classmethod
    def guard_id_no_spaces(cls, v: str) -> str:
        """Validate that guard ID contains no spaces"""
        if ' ' in v:
            raise ValueError('รหัสพนักงานต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสพนักงานต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


class GuardUpdate(BaseModel):
    guardId: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    bankAccountNo: Optional[str] = None
    bankCode: Optional[str] = None
    isActive: Optional[bool] = None

    @field_validator('guardId')
    @classmethod
    def guard_id_no_spaces(cls, v: Optional[str]) -> Optional[str]:
        """Validate that guard ID contains no spaces"""
        if v is None:
            return v
        if ' ' in v:
            raise ValueError('รหัสพนักงานต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสพนักงานต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


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


# Staff uses same schemas as Guard
StaffCreate = GuardCreate
StaffUpdate = GuardUpdate
StaffResponse = GuardResponse


# ========== BANK SCHEMAS ==========

class BankCreate(BaseModel):
    code: str = Field(..., min_length=1, description="รหัสธนาคาร (ไม่อนุญาตให้มีช่องว่าง)")
    name: str = Field(..., min_length=1)
    shortNameEN: str = Field(..., min_length=1)

    @field_validator('code')
    @classmethod
    def code_no_spaces(cls, v: str) -> str:
        """Validate that bank code contains no spaces"""
        if ' ' in v:
            raise ValueError('รหัสธนาคารต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสธนาคารต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


class BankUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    shortNameEN: Optional[str] = None

    @field_validator('code')
    @classmethod
    def code_no_spaces(cls, v: Optional[str]) -> Optional[str]:
        """Validate that bank code contains no spaces"""
        if v is None:
            return v
        if ' ' in v:
            raise ValueError('รหัสธนาคารต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสธนาคารต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


class BankResponse(BaseModel):
    id: str
    code: str
    name: str
    shortNameEN: str


# ========== PRODUCT SCHEMAS ==========

class ProductCreate(BaseModel):
    code: str = Field(..., min_length=1, description="รหัสสินค้า (ไม่อนุญาตให้มีช่องว่าง)")
    name: str = Field(..., min_length=1)
    category: Optional[str] = None
    price: float = 0.0
    isActive: bool = True

    @field_validator('code')
    @classmethod
    def code_no_spaces(cls, v: str) -> str:
        """Validate that product code contains no spaces"""
        if ' ' in v:
            raise ValueError('รหัสสินค้าต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสสินค้าต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


class ProductUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    isActive: Optional[bool] = None

    @field_validator('code')
    @classmethod
    def code_no_spaces(cls, v: Optional[str]) -> Optional[str]:
        """Validate that product code contains no spaces"""
        if v is None:
            return v
        if ' ' in v:
            raise ValueError('รหัสสินค้าต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสสินค้าต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


class ProductResponse(BaseModel):
    id: str
    code: str
    name: str
    category: Optional[str] = None
    price: float
    isActive: bool
    createdAt: Optional[datetime] = None


# ========== SERVICE SCHEMAS ==========

class ServiceCreate(BaseModel):
    name: str = Field(..., min_length=1)
    isActive: bool = True


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    isActive: Optional[bool] = None


class ServiceResponse(BaseModel):
    id: str
    name: str
    isActive: bool
    createdAt: Optional[datetime] = None