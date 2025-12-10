from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Numeric
from sqlalchemy.sql import func
from app.database import Base


class Staff(Base):
    """Staff model for PostgreSQL"""
    __tablename__ = "staff"
    
    id = Column(Integer, primary_key=True, index=True)
    staffId = Column(String(50), unique=True, nullable=False, index=True)
    firstName = Column(String(100), nullable=False)
    lastName = Column(String(100), nullable=False)
    idCardNumber = Column(String(13), nullable=True, comment="เลขบัตรประชาชน")
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    
    # ข้อมูลการทำงาน
    position = Column(String(100), nullable=True, comment="ตำแหน่งงาน")
    department = Column(String(100), nullable=True, comment="แผนก")
    startDate = Column(Date, nullable=True, comment="วันเริ่มงาน")
    birthDate = Column(Date, nullable=True, comment="วันเกิด")
    
    # ข้อมูลเงินเดือน
    salary = Column(Numeric(10, 2), nullable=True, comment="เงินเดือน")
    salaryType = Column(String(50), nullable=True, comment="ประเภทเงินเดือน: รายเดือน, รายวัน, รายชั่วโมง")
    
    # ข้อมูลการรับเงิน
    paymentMethod = Column(String(50), nullable=True, comment="วิธีรับเงิน: โอนเข้าบัญชี, เงินสด, เช็ค")
    bankAccountNo = Column(String(50), nullable=True)
    bankCode = Column(String(10), nullable=True)
    
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
