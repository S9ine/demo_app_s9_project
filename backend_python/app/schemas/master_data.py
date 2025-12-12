from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime, date
import re


# ========== CUSTOMER SCHEMAS ==========

# ประเภทธุรกิจ
BUSINESS_TYPES = [
    "กิจการเจ้าของคนเดียว",
    "ห้างหุ้นส่วน",
    "บริษัทจำกัด",
    "รัฐวิสาหกิจ"
]

class CustomerCreate(BaseModel):
    code: str = Field(..., min_length=1, description="รหัสลูกค้า (ไม่อนุญาตให้มีช่องว่าง)")
    businessType: Optional[str] = Field(None, description="ประเภทธุรกิจ")
    name: str = Field(..., min_length=1, description="ชื่อลูกค้า")
    taxId: Optional[str] = Field(None, description="เลขประจำตัวผู้เสียภาษี")
    
    # ที่อยู่
    address: Optional[str] = Field(None, description="บ้านเลขที่, หมู่, ซอย, ถนน")
    subDistrict: Optional[str] = Field(None, description="แขวง/ตำบล")
    district: Optional[str] = Field(None, description="เขต/อำเภอ")
    province: Optional[str] = Field(None, description="จังหวัด")
    postalCode: Optional[str] = Field(None, description="รหัสไปรษณีย์")
    
    # ข้อมูลติดต่อ
    contactPerson: Optional[str] = Field(None, description="ชื่อผู้ติดต่อ")
    phone: Optional[str] = Field(None, description="เบอร์โทร")
    email: Optional[str] = Field(None, description="อีเมล")
    secondaryContact: Optional[str] = Field(None, description="ผู้ติดต่อรอง")
    paymentTerms: Optional[str] = Field(None, description="เงื่อนไขการชำระเงิน")
    
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

    @field_validator('businessType')
    @classmethod
    def validate_business_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate business type"""
        if v is not None and v not in BUSINESS_TYPES:
            raise ValueError(f'ประเภทธุรกิจต้องเป็นหนึ่งใน: {", ".join(BUSINESS_TYPES)}')
        return v


class CustomerUpdate(BaseModel):
    code: Optional[str] = None
    businessType: Optional[str] = None
    name: Optional[str] = None
    taxId: Optional[str] = None
    address: Optional[str] = None
    subDistrict: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None
    postalCode: Optional[str] = None
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    secondaryContact: Optional[str] = None
    paymentTerms: Optional[str] = None
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

    @field_validator('businessType')
    @classmethod
    def validate_business_type(cls, v: Optional[str]) -> Optional[str]:
        """Validate business type"""
        if v is not None and v not in BUSINESS_TYPES:
            raise ValueError(f'ประเภทธุรกิจต้องเป็นหนึ่งใน: {", ".join(BUSINESS_TYPES)}')
        return v


class CustomerResponse(BaseModel):
    id: str
    code: str
    businessType: Optional[str] = None
    name: str
    taxId: Optional[str] = None
    address: Optional[str] = None
    subDistrict: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None
    postalCode: Optional[str] = None
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    secondaryContact: Optional[str] = None
    paymentTerms: Optional[str] = None
    isActive: bool
    createdAt: Optional[datetime] = None


# ========== SITE SCHEMAS ==========

class EmploymentDetail(BaseModel):
    """ข้อมูลการจ้าง"""
    position: str = Field(..., description="ชื่อ/ตำแหน่ง")
    quantity: int = Field(..., description="จำนวน", ge=0)
    workingDays: int = Field(30, description="วันทำงาน/เดือน", ge=1, le=31)
    dailyIncome: float = Field(0.0, description="รายได้รายวัน (บาท/วัน)", ge=0)
    hiringRate: float = Field(..., description="ราคาจ้าง", ge=0)
    positionAllowance: float = Field(0.0, description="ค่าตำแหน่ง", ge=0)
    diligenceBonus: float = Field(0.0, description="เบี้ยขยัน", ge=0)
    sevenDayBonus: float = Field(0.0, description="7DAY", ge=0)
    pointBonus: float = Field(0.0, description="ค่าจุด", ge=0)
    otherAllowance: float = Field(0.0, description="ค่าอื่นๆ", ge=0)
    remarks: Optional[str] = Field(None, description="หมายเหตุ")


class ContractedService(BaseModel):
    """Deprecated - เก็บไว้ backward compatible"""
    id: str
    serviceName: str
    position: str
    payoutRate: float
    hiringRate: float
    diligenceBonus: float = 0.0
    pointBonus: float = 0.0
    otherBonus: float = 0.0


class ShiftAssignment(BaseModel):
    """ข้อมูลกะงาน"""
    shiftId: int = Field(..., description="ID ของกะ")
    shiftCode: str = Field(..., description="รหัสกะ")
    shiftName: str = Field(..., description="ชื่อกะ")
    startTime: Optional[str] = Field(None, description="เวลาเริ่มกะ (HH:MM)")
    endTime: Optional[str] = Field(None, description="เวลาสิ้นสุดกะ (HH:MM)")
    numberOfPeople: int = Field(..., description="จำนวนคน", ge=1)


class SiteCreate(BaseModel):
    siteCode: str = Field(..., min_length=1, description="รหัสหน่วยงาน (ไม่อนุญาตให้มีช่องว่าง)")
    name: str = Field(..., min_length=1, description="ชื่อหน่วยงาน")
    customerId: str = Field(..., description="รหัสลูกค้า (ID)")
    customerCode: Optional[str] = Field(None, description="รหัสลูกค้า")
    customerName: Optional[str] = Field(None, description="ชื่อลูกค้า")
    
    # ข้อมูลสัญญา
    contractStartDate: Optional[str] = Field(None, description="วันเริ่มสัญญา (YYYY-MM-DD)")
    contractEndDate: Optional[str] = Field(None, description="วันสิ้นสุดสัญญา (YYYY-MM-DD)")
    
    # ที่อยู่หน่วยงาน
    address: Optional[str] = Field(None, description="ที่อยู่หน่วยงาน")
    subDistrict: Optional[str] = Field(None, description="แขวง/ตำบล")
    district: Optional[str] = Field(None, description="เขต/อำเภอ")
    province: Optional[str] = Field(None, description="จังหวัด")
    postalCode: Optional[str] = Field(None, description="รหัสไปรษณีย์")
    
    # ข้อมูลติดต่อ
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    
    # ข้อมูลการจ้าง
    employmentDetails: List[EmploymentDetail] = []
    
    # ข้อมูลกะงาน
    shiftAssignments: List[ShiftAssignment] = []
    
    # เก่า (deprecated)
    contractedServices: List[ContractedService] = []
    isActive: bool = True

    @field_validator('siteCode')
    @classmethod
    def site_code_no_spaces(cls, v: str) -> str:
        """Validate that site code contains no spaces"""
        if ' ' in v:
            raise ValueError('รหัสหน่วยงานต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\-\.]+$', v):  # Allow dot (.) for customer.01 format
            raise ValueError('รหัสหน่วยงานต้องเป็นตัวอักษร ตัวเลข - _ หรือ . เท่านั้น')
        return v


class SiteUpdate(BaseModel):
    siteCode: Optional[str] = None
    name: Optional[str] = None
    customerId: Optional[str] = None
    customerCode: Optional[str] = None
    customerName: Optional[str] = None
    contractStartDate: Optional[str] = None
    contractEndDate: Optional[str] = None
    address: Optional[str] = None
    subDistrict: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None
    postalCode: Optional[str] = None
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    employmentDetails: Optional[List[EmploymentDetail]] = None
    shiftAssignments: Optional[List[ShiftAssignment]] = None
    contractedServices: Optional[List[ContractedService]] = None
    isActive: Optional[bool] = None

    @field_validator('siteCode')
    @classmethod
    def site_code_no_spaces(cls, v: Optional[str]) -> Optional[str]:
        """Validate that site code contains no spaces"""
        if v is None:
            return v
        if ' ' in v:
            raise ValueError('รหัสหน่วยงานต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\.\-]+$', v):
            raise ValueError('รหัสหน่วยงานต้องเป็นตัวอักษร ตัวเลข . - หรือ _ เท่านั้น')
        return v


class SiteResponse(BaseModel):
    id: str
    siteCode: str
    name: str
    customerId: str
    customerCode: Optional[str] = None
    customerName: Optional[str] = None
    contractStartDate: Optional[str] = None
    contractEndDate: Optional[str] = None
    address: Optional[str] = None
    subDistrict: Optional[str] = None
    district: Optional[str] = None
    province: Optional[str] = None
    postalCode: Optional[str] = None
    contactPerson: Optional[str] = None
    phone: Optional[str] = None
    employmentDetails: List[EmploymentDetail] = []
    shiftAssignments: List[ShiftAssignment] = []
    contractedServices: List[ContractedService] = []
    isActive: bool
    createdAt: Optional[datetime] = None


# ========== GUARD/STAFF SCHEMAS ==========

class GuardCreate(BaseModel):
    # ข้อมูลส่วนตัว
    title: Optional[str] = Field(None, description="คำนำหน้า")
    firstName: str = Field(..., min_length=1, description="ชื่อ")
    lastName: str = Field(..., min_length=1, description="นามสกุล")
    birthDate: Optional[date] = Field(None, description="วันเดือนปีเกิด")
    nationality: Optional[str] = Field(None, description="สัญชาติ")
    religion: Optional[str] = Field(None, description="ศาสนา")
    
    # ที่อยู่
    addressIdCard: Optional[str] = Field(None, description="ที่อยู่ตามบัตรประชาชน")
    addressCurrent: Optional[str] = Field(None, description="ที่อยู่ปัจจุบันที่ติดต่อได้")
    phone: Optional[str] = Field(None, description="เบอร์โทรศัพท์มือถือ")
    
    # การศึกษาและใบอนุญาต
    education: Optional[str] = Field(None, description="วุฒิการศึกษาสูงสุด")
    licenseNumber: Optional[str] = Field(None, description="เลขที่บัตร/ใบอนุญาต")
    licenseExpiry: Optional[date] = Field(None, description="วันหมดอายุ")
    
    # การทำงาน
    startDate: Optional[date] = Field(None, description="วันที่เริ่มปฏิบัติงาน")
    
    # ข้อมูลธนาคาร
    bankAccountName: Optional[str] = Field(None, description="ชื่อบัญชีธนาคาร")
    bankAccountNo: Optional[str] = Field(None, description="เลขที่บัญชี")
    bankCode: Optional[str] = Field(None, description="รหัสธนาคาร")
    
    # เลขบัตรประชาชน
    idCardNumber: Optional[str] = Field(None, description="เลขที่บัตรประชาชน 13 หลัก")
    
    # สถานภาพครอบครัว
    maritalStatus: Optional[str] = Field(None, description="สถานภาพสมรส")
    spouseName: Optional[str] = Field(None, description="ชื่อ-นามสกุลคู่สมรส")
    
    # ผู้ติดต่อฉุกเฉิน
    emergencyContactName: Optional[str] = Field(None, description="ชื่อบุคคลที่ติดต่อได้ในกรณีฉุกเฉิน")
    emergencyContactPhone: Optional[str] = Field(None, description="เบอร์โทรศัพท์บุคคลฉุกเฉิน")
    emergencyContactRelation: Optional[str] = Field(None, description="ความสัมพันธ์กับบุคคลฉุกเฉิน")
    
    isActive: bool = True


class GuardUpdate(BaseModel):
    guardId: Optional[str] = None
    
    # ข้อมูลส่วนตัว
    title: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    birthDate: Optional[date] = None
    nationality: Optional[str] = None
    religion: Optional[str] = None
    
    # ที่อยู่
    addressIdCard: Optional[str] = None
    addressCurrent: Optional[str] = None
    phone: Optional[str] = None
    
    # การศึกษาและใบอนุญาต
    education: Optional[str] = None
    licenseNumber: Optional[str] = None
    licenseExpiry: Optional[date] = None
    
    # การทำงาน
    startDate: Optional[date] = None
    
    # ข้อมูลธนาคาร
    bankAccountName: Optional[str] = None
    bankAccountNo: Optional[str] = None
    bankCode: Optional[str] = None
    
    # เลขบัตรประชาชน
    idCardNumber: Optional[str] = None
    
    # สถานภาพครอบครัว
    maritalStatus: Optional[str] = None
    spouseName: Optional[str] = None
    
    # ผู้ติดต่อฉุกเฉิน
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    emergencyContactRelation: Optional[str] = None
    
    # Legacy fields (for backward compatibility)
    address: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    salary: Optional[Decimal] = None
    salaryType: Optional[str] = None
    paymentMethod: Optional[str] = None
    
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
    
    # ข้อมูลส่วนตัว
    title: Optional[str] = None
    firstName: str
    lastName: str
    birthDate: Optional[date] = None
    nationality: Optional[str] = None
    religion: Optional[str] = None
    
    # ที่อยู่
    addressIdCard: Optional[str] = None
    addressCurrent: Optional[str] = None
    phone: Optional[str] = None
    
    # การศึกษาและใบอนุญาต
    education: Optional[str] = None
    licenseNumber: Optional[str] = None
    licenseExpiry: Optional[date] = None
    
    # การทำงาน
    startDate: Optional[date] = None
    
    # ข้อมูลธนาคาร
    bankAccountName: Optional[str] = None
    bankAccountNo: Optional[str] = None
    bankCode: Optional[str] = None
    
    # เลขบัตรประชาชน
    idCardNumber: Optional[str] = None
    
    # สถานภาพครอบครัว
    maritalStatus: Optional[str] = None
    spouseName: Optional[str] = None
    
    # ผู้ติดต่อฉุกเฉิน
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    emergencyContactRelation: Optional[str] = None
    
    isActive: bool
    createdAt: Optional[datetime] = None


# Staff uses different schemas from Guard
class StaffCreate(BaseModel):
    # ข้อมูลส่วนตัว
    title: Optional[str] = Field(None, description="คำนำหน้า")
    firstName: str = Field(..., min_length=1, description="ชื่อ")
    lastName: str = Field(..., min_length=1, description="นามสกุล")
    idCardNumber: Optional[str] = Field(None, description="เลขที่บัตรประชาชน 13 หลัก")
    birthDate: Optional[date] = Field(None, description="วันเกิด")
    
    # ข้อมูลติดต่อ
    phone: Optional[str] = Field(None, description="เบอร์โทรศัพท์")
    email: Optional[str] = Field(None, description="อีเมล")
    address: Optional[str] = Field(None, description="ที่อยู่")
    
    # ข้อมูลการทำงาน
    position: Optional[str] = Field(None, description="ตำแหน่งงาน")
    department: Optional[str] = Field(None, description="แผนก")
    startDate: Optional[date] = Field(None, description="วันที่เริ่มงาน")
    
    # ข้อมูลเงินเดือนและธนาคาร
    salary: Optional[Decimal] = Field(None, description="เงินเดือน")
    bankAccountNo: Optional[str] = Field(None, description="เลขที่บัญชี")
    bankCode: Optional[str] = Field(None, description="รหัสธนาคาร")
    
    # ผู้ติดต่อฉุกเฉิน
    emergencyContactName: Optional[str] = Field(None, description="ชื่อบุคคลที่ติดต่อได้ในกรณีฉุกเฉิน")
    emergencyContactPhone: Optional[str] = Field(None, description="เบอร์โทรศัพท์บุคคลฉุกเฉิน")
    emergencyContactRelation: Optional[str] = Field(None, description="ความสัมพันธ์กับบุคคลฉุกเฉิน")
    
    isActive: bool = True


class StaffUpdate(BaseModel):
    staffId: Optional[str] = None
    title: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    idCardNumber: Optional[str] = None
    birthDate: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    startDate: Optional[date] = None
    salary: Optional[Decimal] = None
    bankAccountNo: Optional[str] = None
    bankCode: Optional[str] = None
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    emergencyContactRelation: Optional[str] = None
    isActive: Optional[bool] = None

    @field_validator('staffId')
    @classmethod
    def staff_id_no_spaces(cls, v: Optional[str]) -> Optional[str]:
        """Validate that staff ID contains no spaces"""
        if v is None:
            return v
        if ' ' in v:
            raise ValueError('รหัสพนักงานต้องไม่มีช่องว่าง (กรุณาใช้ - หรือ _ แทน)')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสพนักงานต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


class StaffResponse(BaseModel):
    id: str
    staffId: str
    title: Optional[str] = None
    firstName: str
    lastName: str
    idCardNumber: Optional[str] = None
    birthDate: Optional[date] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    startDate: Optional[date] = None
    salary: Optional[Decimal] = None
    bankAccountNo: Optional[str] = None
    bankCode: Optional[str] = None
    emergencyContactName: Optional[str] = None
    emergencyContactPhone: Optional[str] = None
    emergencyContactRelation: Optional[str] = None
    isActive: bool
    createdAt: Optional[datetime] = None


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
    serviceCode: str = Field(..., min_length=1, description="รหัสบริการ")
    serviceName: str = Field(..., min_length=1, description="ชื่อบริการ")
    remarks: Optional[str] = Field(None, description="หมายเหตุ")
    hiringRate: float = Field(0.0, description="ราคาจ้าง", ge=0)
    diligenceBonus: float = Field(0.0, description="เบี้ยขยัน", ge=0)
    sevenDayBonus: float = Field(0.0, description="7DAY", ge=0)
    pointBonus: float = Field(0.0, description="ค่าจุด", ge=0)
    isActive: bool = True

    @field_validator('serviceCode')
    @classmethod
    def code_no_spaces(cls, v: str) -> str:
        if ' ' in v:
            raise ValueError('รหัสบริการต้องไม่มีช่องว่าง')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสบริการต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


class ServiceUpdate(BaseModel):
    serviceCode: Optional[str] = None
    serviceName: Optional[str] = None
    remarks: Optional[str] = None
    hiringRate: Optional[float] = None
    diligenceBonus: Optional[float] = None
    sevenDayBonus: Optional[float] = None
    pointBonus: Optional[float] = None
    isActive: Optional[bool] = None

    @field_validator('serviceCode')
    @classmethod
    def code_no_spaces(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if ' ' in v:
            raise ValueError('รหัสบริการต้องไม่มีช่องว่าง')
        if not re.match(r'^[\w\-]+$', v):
            raise ValueError('รหัสบริการต้องเป็นตัวอักษร ตัวเลข - หรือ _ เท่านั้น')
        return v


class ServiceResponse(BaseModel):
    id: str
    serviceCode: str
    serviceName: str
    remarks: Optional[str] = None
    hiringRate: float
    diligenceBonus: float
    sevenDayBonus: float
    pointBonus: float
    isActive: bool
    createdAt: Optional[datetime] = None


# ========== SHIFT SCHEMAS ==========

class ShiftCreate(BaseModel):
    shiftCode: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    startTime: Optional[str] = Field(None, description="เวลาเริ่มกะ (HH:MM)")
    endTime: Optional[str] = Field(None, description="เวลาสิ้นสุดกะ (HH:MM)")
    isActive: bool = True


class ShiftUpdate(BaseModel):
    shiftCode: Optional[str] = None
    name: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    isActive: Optional[bool] = None


class ShiftResponse(BaseModel):
    id: int
    shiftCode: str
    name: str
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    isActive: bool
    createdAt: Optional[datetime] = None