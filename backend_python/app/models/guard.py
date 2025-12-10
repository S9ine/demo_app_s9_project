from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric
from sqlalchemy.sql import func
from app.database import Base


class Guard(Base):
    """Guard model for PostgreSQL"""
    __tablename__ = "guards"
    
    id = Column(Integer, primary_key=True, index=True)
    guardId = Column(String(50), unique=True, nullable=False, index=True)
    
    # ข้อมูลส่วนตัว
    title = Column(String(20), nullable=True)  # คำนำหน้า
    firstName = Column(String(100), nullable=False)
    lastName = Column(String(100), nullable=False)
    birthDate = Column(Date, nullable=True)  # วันเดือนปีเกิด
    nationality = Column(String(50), nullable=True)  # สัญชาติ
    religion = Column(String(50), nullable=True)  # ศาสนา
    
    # ที่อยู่
    addressIdCard = Column(String(500), nullable=True)  # ที่อยู่ตามบัตรประชาชน
    addressCurrent = Column(String(500), nullable=True)  # ที่อยู่ปัจจุบัน
    phone = Column(String(20), nullable=True)  # เบอร์โทรมือถือ
    
    # การศึกษาและใบอนุญาต
    education = Column(String(100), nullable=True)  # วุฒิการศึกษา
    licenseNumber = Column(String(50), nullable=True)  # เลขที่บัตร/ใบอนุญาต
    licenseExpiry = Column(Date, nullable=True)  # วันหมดอายุ
    
    # การทำงาน
    startDate = Column(Date, nullable=True)  # วันเริ่มปฏิบัติงาน
    
    # ข้อมูลธนาคาร
    bankAccountName = Column(String(200), nullable=True)  # ชื่อบัญชี
    bankAccountNo = Column(String(50), nullable=True)  # เลขบัญชี
    bankCode = Column(String(10), nullable=True)  # รหัสธนาคาร
    
    # เลขบัตรประชาชน
    idCardNumber = Column(String(13), nullable=True)  # เลขบัตรประชาชน 13 หลัก
    
    # สถานภาพครอบครัว
    maritalStatus = Column(String(50), nullable=True)  # สถานภาพสมรส
    spouseName = Column(String(200), nullable=True)  # ชื่อคู่สมรส
    
    # ผู้ติดต่อฉุกเฉิน
    emergencyContactName = Column(String(200), nullable=True)  # ชื่อผู้ติดต่อฉุกเฉิน
    emergencyContactPhone = Column(String(20), nullable=True)  # เบอร์โทรฉุกเฉิน
    emergencyContactRelation = Column(String(100), nullable=True)  # ความสัมพันธ์
    
    # ฟิลด์เดิมที่ไม่ใช้แล้ว (เก็บไว้เพื่อ backward compatibility)
    address = Column(String(500), nullable=True)
    position = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    salary = Column(Numeric(10, 2), nullable=True)
    salaryType = Column(String(50), nullable=True)
    paymentMethod = Column(String(50), nullable=True)
    
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
