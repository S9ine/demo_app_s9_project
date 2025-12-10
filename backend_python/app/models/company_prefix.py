from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class CompanyPrefix(Base):
    """Company prefix for customer code generation"""
    __tablename__ = "company_prefixes"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), nullable=False, unique=True, index=True)  # PG, SG, CF
    name = Column(String(100), nullable=False)  # Prime Guard, Security Guard
    description = Column(String(500), nullable=True)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
