"""
SQLAlchemy models for PostgreSQL
"""

from app.models.user import User, Role
from app.models.customer import Customer
from app.models.site import Site
from app.models.guard import Guard
from app.models.staff import Staff
from app.models.bank import Bank
from app.models.daily_advance import DailyAdvance
# เพิ่ม 2 บรรทัดนี้
from app.models.product import Product
from app.models.service import Service
from app.models.schedule import Schedule

__all__ = [
    "User",
    "Role",
    "Customer",
    "Site",
    "Guard",
    "Staff",
    "Bank",
    "DailyAdvance",
    "Product", # เพิ่ม
    "Service",  # เพิ่ม
    "Schedule"
]