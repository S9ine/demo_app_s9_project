from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Date
from sqlalchemy.sql import func
from app.database import Base


class Site(Base):
    """Site model for PostgreSQL"""
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    siteCode = Column(String(50), unique=True, nullable=False, index=True)  # รหัสหน่วยงาน
    name = Column(String(200), nullable=False)  # ชื่อหน่วยงาน
    customerId = Column(Integer, nullable=False)  # Reference to customer
    customerCode = Column(String(50), nullable=True)  # รหัสลูกค้า (denormalized)
    customerName = Column(String(200), nullable=True)  # ชื่อลูกค้า (denormalized)
    
    # ข้อมูลสัญญา
    contractStartDate = Column(Date, nullable=True)  # วันเริ่มสัญญา
    contractEndDate = Column(Date, nullable=True)  # วันสิ้นสุดสัญญา
    contractFilePath = Column(String(500), nullable=True)  # ไฟล์เอกสารสัญญา (path)
    contractFileName = Column(String(255), nullable=True)  # ชื่อไฟล์ต้นฉบับ
    
    # ที่อยู่หน่วยงาน
    address = Column(String(500), nullable=True)  # ที่อยู่หน่วยงาน
    subDistrict = Column(String(100), nullable=True)  # แขวง/ตำบล
    district = Column(String(100), nullable=True)  # เขต/อำเภอ
    province = Column(String(100), nullable=True)  # จังหวัด
    postalCode = Column(String(10), nullable=True)  # รหัสไปรษณีย์
    
    # ข้อมูลติดต่อ (เก่า)
    contactPerson = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    
    # ข้อมูลการจ้าง (JSON Array)
    employmentDetails = Column(Text, nullable=True)  # JSON string: [{position, quantity, hiringRate, diligenceBonus, sevenDayBonus, pointBonus, remarks}]
    
    # ข้อมูลกะงาน (JSON Array)
    shiftAssignments = Column(Text, nullable=True)  # JSON string: [{shiftId, shiftCode, shiftName, numberOfPeople}]
    
    # เก่า (deprecated แต่ยังเก็บไว้ backward compatible)
    contractedServices = Column(Text, nullable=True)  # JSON string
    
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
