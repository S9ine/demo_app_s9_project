from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """User model for PostgreSQL"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    firstName = Column(String(100), nullable=False)
    lastName = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    role = Column(String(50), nullable=False)
    roleId = Column(String(10), nullable=False)
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime(timezone=True), server_default=func.now())
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())


class Role(Base):
    """Role model for PostgreSQL"""
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    roleId = Column(String(10), unique=True, nullable=False)  # "1", "2", "3"
    name = Column(String(50), unique=True, nullable=False)
    permissions = Column(Text, nullable=True)  # Store as JSON string
