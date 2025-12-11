"""
Schedule Guard Models
ตารางเก็บข้อมูลพนักงานในตารางงาน (denormalized สำหรับ query เร็ว)
"""
from sqlalchemy import Column, Integer, String, Date, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from app.database import Base


class ScheduleGuard(Base):
    """
    ตารางเก็บข้อมูลพนักงานที่ถูกจัดเข้าตารางงาน
    - ใช้สำหรับ query ว่าพนักงานคนใดๆ ทำงานวันไหนบ้าง
    - ใช้สำหรับคำนวณเงินเดือน
    """
    __tablename__ = "schedule_guards"

    id = Column(Integer, primary_key=True, index=True)
    
    # Schedule Reference
    scheduleId = Column(
        Integer, 
        ForeignKey("schedules.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True,
        comment="อ้างอิงไปยัง schedules.id"
    )
    scheduleDate = Column(
        Date, 
        nullable=False, 
        index=True, 
        comment="วันที่ (duplicate จาก schedules เพื่อ query เร็ว)"
    )
    
    # Guard Information
    guardId = Column(
        String(50), 
        nullable=False, 
        index=True, 
        comment="รหัสพนักงาน เช่น PG-0001"
    )
    guard_id_fk = Column(
        Integer,
        ForeignKey("guards.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="FK ไปยัง guards.id"
    )
    guardName = Column(
        String(255),
        nullable=False,
        comment="ชื่อพนักงาน (ชื่อ + นามสกุล)"
    )
    
    # Site Information
    siteId = Column(
        Integer,
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="หน่วยงานที่ทำงาน"
    )
    siteName = Column(
        String(255),
        nullable=False,
        comment="ชื่อหน่วยงาน"
    )
    
    # Shift Information
    shift = Column(
        String(20),
        nullable=False,
        index=True,
        comment="กะงาน: day หรือ night"
    )
    position = Column(
        String(100),
        nullable=False,
        comment="ตำแหน่งงาน เช่น รปภ., หัวหน้า"
    )
    
    # Payment Information
    dailyIncome = Column(
        Float,
        default=0.0,
        nullable=False,
        comment="รายได้/วัน (ฐาน)"
    )
    payoutRate = Column(
        Float,
        default=0.0,
        nullable=False,
        comment="ค่าจ้างที่จ่ายจริงในวันนี้"
    )
    hiringRate = Column(
        Float,
        default=0.0,
        nullable=False,
        comment="ราคาจ้าง"
    )
    positionAllowance = Column(
        Float,
        default=0.0,
        nullable=False,
        comment="ค่าตำแหน่ง"
    )
    diligenceBonus = Column(
        Float,
        default=0.0,
        nullable=False,
        comment="เบี้ยขยัน"
    )
    sevenDayBonus = Column(
        Float,
        default=0.0,
        nullable=False,
        comment="7DAY"
    )
    pointBonus = Column(
        Float,
        default=0.0,
        nullable=False,
        comment="ค่าจุด"
    )
    otherAllowance = Column(
        Float,
        default=0.0,
        nullable=False,
        comment="ค่าอื่นๆ"
    )
    
    # Metadata
    createdAt = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    def __repr__(self):
        return f"<ScheduleGuard(guardId={self.guardId}, date={self.scheduleDate}, site={self.siteName}, shift={self.shift})>"


# Create composite indexes for common queries
Index('idx_schedule_guard_query', 
      ScheduleGuard.guardId, 
      ScheduleGuard.scheduleDate)

Index('idx_schedule_guard_date_range',
      ScheduleGuard.guardId,
      ScheduleGuard.scheduleDate,
      ScheduleGuard.shift)
