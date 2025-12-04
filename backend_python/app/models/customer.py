from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Customer(Base):
    """Customer model for PostgreSQL"""
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # รหัสลูกค้า
    businessType = Column(String(50), nullable=True)  # ประเภทธุรกิจ
    name = Column(String(200), nullable=False)  # ชื่อลูกค้า
    taxId = Column(String(20), nullable=True)  # เลขประจำตัวผู้เสียภาษี
    
    # ที่อยู่
    address = Column(String(500), nullable=True)  # บ้านเลขที่, หมู่, ซอย, ถนน
    subDistrict = Column(String(100), nullable=True)  # แขวง/ตำบล
    district = Column(String(100), nullable=True)  # เขต/อำเภอ
    province = Column(String(100), nullable=True)  # จังหวัด
    postalCode = Column(String(10), nullable=True)  # รหัสไปรษณีย์
    
    # ข้อมูลติดต่อ
    contactPerson = Column(String(100), nullable=True)  # ชื่อผู้ติดต่อ
    phone = Column(String(20), nullable=True)  # เบอร์โทร
    email = Column(String(100), nullable=True)  # อีเมล
    secondaryContact = Column(String(100), nullable=True)  # ผู้ติดต่อรอง
    paymentTerms = Column(String(500), nullable=True)  # เงื่อนไขการชำระเงิน (หมายเหตุ)
    
    # เก่า (deprecated แต่เก็บไว้ backward compatible)
    mapLink = Column(String(500), nullable=True)
    contact = Column(String(500), nullable=True)
    billing = Column(String(500), nullable=True)
    
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())