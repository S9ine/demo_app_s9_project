from sqlalchemy import Column, Integer, String, DateTime, Text, JSON  # type: ignore
from sqlalchemy.sql import func  # type: ignore
from app.database import Base  # type: ignore


class AuditLog(Base):  # type: ignore
    """Audit Log model for tracking all changes"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # ข้อมูลการกระทำ
    action = Column(String(50), nullable=False, index=True)  # CREATE, UPDATE, DELETE, IMPORT, EXPORT
    entityType = Column(String(50), nullable=False, index=True)  # customers, sites, guards, staff, etc.
    entityId = Column(String(100), nullable=True, index=True)  # ID ของข้อมูลที่ถูกแก้ไข
    entityName = Column(String(500), nullable=True)  # ชื่อของข้อมูลที่ถูกแก้ไข
    
    # ข้อมูลผู้ทำ
    userId = Column(Integer, nullable=False, index=True)  # ID ของผู้ใช้
    username = Column(String(100), nullable=False)  # Username ของผู้ใช้
    
    # รายละเอียด
    description = Column(Text, nullable=True)  # คำอธิบายการเปลี่ยนแปลง
    oldData = Column(JSON, nullable=True)  # ข้อมูลก่อนแก้ไข (JSON)
    newData = Column(JSON, nullable=True)  # ข้อมูลหลังแก้ไข (JSON)
    changes = Column(JSON, nullable=True)  # รายการฟิลด์ที่เปลี่ยน
    
    # ข้อมูลเพิ่มเติม
    ipAddress = Column(String(50), nullable=True)  # IP Address
    userAgent = Column(String(500), nullable=True)  # Browser/Device info
    
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), index=True)
