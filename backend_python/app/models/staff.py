from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric
from sqlalchemy.sql import func
from app.database import Base


class Staff(Base):
    """Staff model for PostgreSQL"""
    __tablename__ = "staff"
    
    id = Column(Integer, primary_key=True, index=True)
    staffId = Column(String(50), unique=True, nullable=False, index=True)
    
    # ข้อมูลส่วนตัว
    title = Column(String(20), nullable=True, comment="คำนำหน้า")
    firstName = Column(String(100), nullable=False)
    lastName = Column(String(100), nullable=False)
    idCardNumber = Column(String(13), nullable=True, comment="เลขบัตรประชาชน 13 หลัก")
    birthDate = Column(Date, nullable=True, comment="วันเกิด")
    
    # ข้อมูลติดต่อ
    phone = Column(String(20), nullable=True, comment="เบอร์โทรศัพท์")
    email = Column(String(100), nullable=True, comment="อีเมล")
    address = Column(String(500), nullable=True)
    
    # ข้อมูลการทำงาน
    position = Column(String(100), nullable=True, comment="ตำแหน่งงาน")
    department = Column(String(100), nullable=True, comment="แผนก")
    startDate = Column(Date, nullable=True, comment="วันเริ่มงาน")
    
    # ข้อมูลเงินเดือนและธนาคาร
    salary = Column(Numeric(10, 2), nullable=True, comment="เงินเดือน")
    bankAccountNo = Column(String(50), nullable=True, comment="เลขที่บัญชี")
    bankCode = Column(String(10), nullable=True, comment="รหัสธนาคาร")
    
    # ผู้ติดต่อฉุกเฉิน
    emergencyContactName = Column(String(200), nullable=True, comment="ชื่อบุคคลที่ติดต่อได้ในกรณีฉุกเฉิน")
    emergencyContactPhone = Column(String(20), nullable=True, comment="เบอร์โทรศัพท์บุคคลฉุกเฉิน")
    emergencyContactRelation = Column(String(100), nullable=True, comment="ความสัมพันธ์กับบุคคลฉุกเฉิน")
    
    # Legacy fields (เก็บไว้ backward compatibility)
    salaryType = Column(String(50), nullable=True)
    paymentMethod = Column(String(50), nullable=True)
    
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
