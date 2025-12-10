from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from sqlalchemy.sql import func
from app.database import Base

class Service(Base):
    """Service model for PostgreSQL"""
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    serviceCode = Column(String(50), unique=True, nullable=False, index=True)  # type: ignore[assignment]
    serviceName = Column(String(200), nullable=False)  # type: ignore[assignment]
    name = Column(String(200), nullable=False)  # Deprecated - keep for backward compatibility
    remarks = Column(Text, nullable=True)  # type: ignore[assignment]
    hiringRate = Column(Float, default=0.0)  # type: ignore[assignment]
    diligenceBonus = Column(Float, default=0.0)  # type: ignore[assignment]
    sevenDayBonus = Column(Float, default=0.0)  # type: ignore[assignment]
    pointBonus = Column(Float, default=0.0)  # type: ignore[assignment]
    isActive = Column(Boolean, default=True)  # type: ignore[assignment]
    createdAt = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore[assignment]
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())  # type: ignore[assignment]