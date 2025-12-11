
"""
Schedule Models
ตารางงานสำหรับจัดพนักงานตามหน่วยงานและวันที่
"""
from sqlalchemy import Column, Integer, String, Date, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.database import Base

class Schedule(Base):
    """
    ตารางงานหลัก - เก็บข้อมูลการจัดตารางตามวันที่และหน่วยงาน
    """
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    scheduleDate = Column(Date, nullable=False, index=True, comment="วันที่จัดตารางงาน")
    siteId = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    siteName = Column(String(255), nullable=False, comment="ชื่อหน่วยงาน (เก็บไว้เพื่อความเร็ว)")

    # ข้อมูลตารางงาน (JSON format)
    # Structure: {
    #   "day": [ {...}, ... ],
    #   "night": [ {...}, ... ]
    # }
    shifts = Column(Text, nullable=False, comment="ข้อมูลกะงาน (JSON)")

    # Statistics (เก็บไว้เพื่อ query ง่าย)
    totalGuardsDay = Column(Integer, default=0, comment="จำนวนพนักงานกะกลางวัน")
    totalGuardsNight = Column(Integer, default=0, comment="จำนวนพนักงานกะกลางคืน")
    totalGuards = Column(Integer, default=0, comment="จำนวนพนักงานทั้งหมด")

    # Metadata
    isActive = Column(Boolean, default=True, nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
    createdBy = Column(Integer, ForeignKey("users.id"), nullable=True)
    remarks = Column(Text, nullable=True, comment="หมายเหตุ")

    def __repr__(self):
        return f"<Schedule(id={self.id}, date={self.scheduleDate}, site={self.siteName})>"
