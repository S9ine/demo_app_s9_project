from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Product(Base):
    """Product model for PostgreSQL"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=True)
    price = Column(Float, default=0.0)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())