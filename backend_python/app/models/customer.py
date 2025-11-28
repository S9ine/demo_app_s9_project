from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Customer(Base):
    """Customer model for PostgreSQL"""
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True) # เพิ่มบรรทัดนี้
    name = Column(String(200), nullable=False)
    contactPerson = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(String(500), nullable=True)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
    taxId = Column(String(20), nullable=True)
    mapLink = Column(String(500), nullable=True)
    contact = Column(String(500), nullable=True)
    billing = Column(String(500), nullable=True)