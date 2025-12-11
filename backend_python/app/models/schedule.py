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
    
    # วันที่และหน่วยงาน
    scheduleDate = Column(Date, nullable=False, index=True, comment="วันที่จัดตารางงาน")
    siteId = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    siteName = Column(String(255), nullable=False, comment="ชื่อหน่วยงาน (เก็บไว้เพื่อความเร็ว)")
    
    # ความสัมพันธ์กับ shifts (normalized)
    shifts = relationship(
        "ScheduleShift",
        backref="schedule",
        cascade="all, delete-orphan",
        lazy="joined"
    )
    
    # Statistics (เก็บไว้เพื่อ query ง่าย)
    totalGuardsDay = Column(Integer, default=0, comment="จำนวนพนักงานกะกลางวัน")
    totalGuardsNight = Column(Integer, default=0, comment="จำนวนพนักงานกะกลางคืน")
    totalGuards = Column(Integer, default=0, comment="จำนวนพนักงานทั้งหมด")
    
    # Metadata
    isActive = Column(Boolean, default=True, nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())
    createdBy = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Remarks
    remarks = Column(Text, nullable=True, comment="หมายเหตุ")


    def __repr__(self):
        return f"<Schedule(id={self.id}, date={self.scheduleDate}, site={self.siteName})>"


# ตารางลูก: รายละเอียดแต่ละกะ/แต่ละคน
from sqlalchemy.orm import relationship

class ScheduleShift(Base):
    __tablename__ = "schedule_shifts"
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("schedules.id", ondelete="CASCADE"), nullable=False, index=True)
    shift_type = Column(String(20), nullable=False)  # 'day', 'night', etc.
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False, index=True)
    staff_name = Column(String(255))
    position = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ความสัมพันธ์กับตารางหลัก (ถ้าต้องการ)
    # schedule = relationship("Schedule", backref="shift_details")

    def __repr__(self):
        return f"<ScheduleShift(id={self.id}, schedule_id={self.schedule_id}, staff_id={self.staff_id}, shift={self.shift_type})>"
