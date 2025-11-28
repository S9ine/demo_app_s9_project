from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Site(Base):
    """Site model for PostgreSQL"""
    __tablename__ = "sites"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    customerId = Column(Integer, nullable=False)  # Reference to customer
    address = Column(String(500), nullable=True)
    contactPerson = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    contractedServices = Column(Text, nullable=True)  # JSON string
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
