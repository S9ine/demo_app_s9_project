import asyncio
from app.database import engine
from sqlalchemy import text

async def clear_guard_audit_logs():
    """ลบ audit logs เก่าสำหรับ guards"""
    async with engine.connect() as conn:
        # Delete old audit logs
        result = await conn.execute(
            text('''
                DELETE FROM audit_logs 
                WHERE "entityType" = 'guards'
            ''')
        )
        await conn.commit()
        
        print(f"✅ ลบ audit logs เก่า: {result.rowcount} รายการ")
        print("🔄 กรุณาทดสอบแก้ไข guard ใหม่ เพื่อสร้าง audit log ที่ใช้ guardId")

if __name__ == "__main__":
    asyncio.run(clear_guard_audit_logs())
