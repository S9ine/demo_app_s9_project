"""
Migration script to add new fields to staff table:
- startDate (วันเริ่มงาน)
- birthDate (วันเกิด)
- salary (เงินเดือน)
- salaryType (ประเภทเงินเดือน)
- paymentMethod (วิธีรับเงิน)
"""

import asyncio
from sqlalchemy import text
from app.database import engine


async def add_staff_fields():
    """Add new fields to staff table"""
    
    async with engine.begin() as conn:
        print("🔄 Adding new fields to staff table...")
        
        # Add startDate column
        try:
            await conn.execute(text("""
                ALTER TABLE staff 
                ADD COLUMN IF NOT EXISTS "startDate" DATE;
            """))
            print("✅ Added startDate column")
        except Exception as e:
            print(f"⚠️  startDate column: {e}")
        
        # Add birthDate column
        try:
            await conn.execute(text("""
                ALTER TABLE staff 
                ADD COLUMN IF NOT EXISTS "birthDate" DATE;
            """))
            print("✅ Added birthDate column")
        except Exception as e:
            print(f"⚠️  birthDate column: {e}")
        
        # Add salary column
        try:
            await conn.execute(text("""
                ALTER TABLE staff 
                ADD COLUMN IF NOT EXISTS salary NUMERIC(10, 2);
            """))
            print("✅ Added salary column")
        except Exception as e:
            print(f"⚠️  salary column: {e}")
        
        # Add salaryType column
        try:
            await conn.execute(text("""
                ALTER TABLE staff 
                ADD COLUMN IF NOT EXISTS "salaryType" VARCHAR(50);
            """))
            print("✅ Added salaryType column")
        except Exception as e:
            print(f"⚠️  salaryType column: {e}")
        
        # Add paymentMethod column
        try:
            await conn.execute(text("""
                ALTER TABLE staff 
                ADD COLUMN IF NOT EXISTS "paymentMethod" VARCHAR(50);
            """))
            print("✅ Added paymentMethod column")
        except Exception as e:
            print(f"⚠️  paymentMethod column: {e}")
        
        # Add comments
        await conn.execute(text("""
            COMMENT ON COLUMN staff."startDate" IS 'วันเริ่มงาน';
        """))
        await conn.execute(text("""
            COMMENT ON COLUMN staff."birthDate" IS 'วันเกิด';
        """))
        await conn.execute(text("""
            COMMENT ON COLUMN staff.salary IS 'เงินเดือน';
        """))
        await conn.execute(text("""
            COMMENT ON COLUMN staff."salaryType" IS 'ประเภทเงินเดือน: รายเดือน, รายวัน, รายชั่วโมง';
        """))
        await conn.execute(text("""
            COMMENT ON COLUMN staff."paymentMethod" IS 'วิธีรับเงิน: โอนเข้าบัญชี, เงินสด, เช็ค';
        """))
        
        print("✅ Added column comments")
        print("🎉 Migration completed successfully!")


if __name__ == "__main__":
    asyncio.run(add_staff_fields())
