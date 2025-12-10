"""
Site Service Rate Model
กำหนดอัตราค่าจ้างเฉพาะแต่ละหน่วยงาน (Site) สำหรับแต่ละตำแหน่ง (Service)
"""
from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base


class SiteServiceRate(Base):
    """
    ตารางเก็บอัตราค่าจ้างเฉพาะของแต่ละหน่วยงาน
    
    หากไม่มีข้อมูลใน table นี้ หรือ useDefaultRate = True 
    จะใช้อัตราจาก services.hiringRate แทน
    """
    __tablename__ = "site_service_rates"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign Keys
    siteId = Column(Integer, ForeignKey("sites.id", ondelete="CASCADE"), nullable=False, index=True)
    serviceId = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Custom Rates (อัตราเฉพาะหน่วยงาน)
    customRate = Column(Numeric(10, 2), nullable=True, comment="อัตราค่าจ้างต่อวัน (บาท)")
    customDiligenceBonus = Column(Numeric(10, 2), nullable=True, comment="เบี้ยขยัน")
    customSevenDayBonus = Column(Numeric(10, 2), nullable=True, comment="โบนัสทำงาน 7 วัน")
    customPointBonus = Column(Numeric(10, 2), nullable=True, comment="โบนัสแต้ม")
    
    # Control Flags
    useDefaultRate = Column(Boolean, default=False, nullable=False, 
                           comment="True = ใช้อัตราจาก services table, False = ใช้ customRate")
    
    # Additional Info
    remarks = Column(Text, nullable=True, comment="หมายเหตุ เช่น เหตุผลที่อัตราสูงกว่า/ต่ำกว่า")
    
    # Metadata
    isActive = Column(Boolean, default=True, nullable=False)
    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<SiteServiceRate(id={self.id}, siteId={self.siteId}, serviceId={self.serviceId})>"
