from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Numeric
from sqlalchemy.sql import func
from app.database import Base


class DailyAdvance(Base):
    """Daily Advance model for PostgreSQL"""
    __tablename__ = "daily_advances"
    
    id = Column(Integer, primary_key=True, index=True)
    docNumber = Column(String(50), unique=True, nullable=False, index=True)
    date = Column(Date, nullable=False)
    type = Column(String(20), nullable=False)  # "advance" or "cash"
    status = Column(String(20), nullable=False, default="Draft")  # Draft, Pending, Approved, Rejected
    items = Column(Text, nullable=False)  # JSON string of items
    createdBy = Column(String(50), nullable=False)
    approvedBy = Column(String(50), nullable=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
