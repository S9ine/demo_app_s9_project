from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Guard(Base):
    """Guard model for PostgreSQL"""
    __tablename__ = "guards"
    
    id = Column(Integer, primary_key=True, index=True)
    guardId = Column(String(50), unique=True, nullable=False, index=True)
    firstName = Column(String(100), nullable=False)
    lastName = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    bankAccountNo = Column(String(50), nullable=True)
    bankCode = Column(String(10), nullable=True)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
