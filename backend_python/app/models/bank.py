from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Bank(Base):
    """Bank model for PostgreSQL"""
    __tablename__ = "banks"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    shortNameEN = Column(String(50), nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
