from sqlalchemy import Column, Integer, String, Boolean, DateTime, Time
from sqlalchemy.sql import func
from app.database import Base


class Shift(Base):
    """Shift model for PostgreSQL"""
    __tablename__ = "shifts"
    
    id = Column(Integer, primary_key=True, index=True)
    shiftCode = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    startTime = Column(Time, nullable=True, comment="เวลาเริ่มกะ")
    endTime = Column(Time, nullable=True, comment="เวลาสิ้นสุดกะ")
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
