"""
Migration: Create schedule_guards table
เพิ่มตารางเก็บข้อมูลพนักงานในตารางงาน สำหรับ query เร็วและคำนวณเงินเดือน
"""

import sys
import asyncio
from sqlalchemy import text
from app.database import async_engine, AsyncSessionLocal


async def migrate():
    """สร้างตาราง schedule_guards"""
    
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS schedule_guards (
        id SERIAL PRIMARY KEY,
        "scheduleId" INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
        "scheduleDate" DATE NOT NULL,
        "guardId" VARCHAR(50) NOT NULL,
        guard_id_fk INTEGER REFERENCES guards(id) ON DELETE SET NULL,
        "guardName" VARCHAR(255) NOT NULL,
        "siteId" INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        "siteName" VARCHAR(255) NOT NULL,
        shift VARCHAR(20) NOT NULL,
        position VARCHAR(100) NOT NULL,
        "dailyIncome" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "payoutRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "hiringRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "positionAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "diligenceBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "sevenDayBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "pointBonus" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "otherAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
    
    -- สร้าง indexes
    CREATE INDEX IF NOT EXISTS idx_schedule_guards_schedule_id ON schedule_guards("scheduleId");
    CREATE INDEX IF NOT EXISTS idx_schedule_guards_schedule_date ON schedule_guards("scheduleDate");
    CREATE INDEX IF NOT EXISTS idx_schedule_guards_guard_id ON schedule_guards("guardId");
    CREATE INDEX IF NOT EXISTS idx_schedule_guards_guard_id_fk ON schedule_guards(guard_id_fk);
    CREATE INDEX IF NOT EXISTS idx_schedule_guards_site_id ON schedule_guards("siteId");
    CREATE INDEX IF NOT EXISTS idx_schedule_guards_shift ON schedule_guards(shift);
    
    -- Composite indexes สำหรับ query ที่ใช้บ่อย
    CREATE INDEX IF NOT EXISTS idx_schedule_guard_query 
        ON schedule_guards("guardId", "scheduleDate");
    
    CREATE INDEX IF NOT EXISTS idx_schedule_guard_date_range 
        ON schedule_guards("guardId", "scheduleDate", shift);
    
    -- เพิ่ม comments
    COMMENT ON TABLE schedule_guards IS 'ตารางเก็บข้อมูลพนักงานที่ถูกจัดเข้าตารางงาน (denormalized)';
    COMMENT ON COLUMN schedule_guards."scheduleId" IS 'อ้างอิงไปยัง schedules.id';
    COMMENT ON COLUMN schedule_guards."scheduleDate" IS 'วันที่ (duplicate จาก schedules เพื่อ query เร็ว)';
    COMMENT ON COLUMN schedule_guards."guardId" IS 'รหัสพนักงาน เช่น PG-0001';
    COMMENT ON COLUMN schedule_guards.guard_id_fk IS 'FK ไปยัง guards.id';
    COMMENT ON COLUMN schedule_guards."guardName" IS 'ชื่อพนักงาน (ชื่อ + นามสกุล)';
    COMMENT ON COLUMN schedule_guards."siteId" IS 'หน่วยงานที่ทำงาน';
    COMMENT ON COLUMN schedule_guards."siteName" IS 'ชื่อหน่วยงาน';
    COMMENT ON COLUMN schedule_guards.shift IS 'กะงาน: day หรือ night';
    COMMENT ON COLUMN schedule_guards.position IS 'ตำแหน่งงาน เช่น รปภ., หัวหน้า';
    COMMENT ON COLUMN schedule_guards."dailyIncome" IS 'รายได้/วัน (ฐาน)';
    COMMENT ON COLUMN schedule_guards."payoutRate" IS 'ค่าจ้างที่จ่ายจริงในวันนี้';
    """
    
    async with async_engine.begin() as conn:
        print("🔧 Creating schedule_guards table...")
        await conn.execute(text(create_table_sql))
        print("✅ Table created successfully!")
        
        # ตรวจสอบว่าสร้างสำเร็จ
        result = await conn.execute(text("""
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_name = 'schedule_guards'
        """))
        count = result.scalar()
        
        if count > 0:
            print(f"✅ Verification: schedule_guards table exists")
        else:
            print("❌ Error: Table was not created")
            return False
    
    return True


async def rollback():
    """ลบตาราง schedule_guards (ใช้เมื่อต้องการ rollback)"""
    
    drop_table_sql = """
    DROP TABLE IF EXISTS schedule_guards CASCADE;
    """
    
    async with async_engine.begin() as conn:
        print("🔙 Rolling back: Dropping schedule_guards table...")
        await conn.execute(text(drop_table_sql))
        print("✅ Rollback completed!")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        asyncio.run(rollback())
    else:
        success = asyncio.run(migrate())
        if success:
            print("\n🎉 Migration completed successfully!")
            print("📋 Next steps:")
            print("   1. Restart backend to load new model")
            print("   2. Update schedule API to populate schedule_guards")
            print("   3. Create API endpoint to query guard schedules")
        else:
            print("\n❌ Migration failed!")
            sys.exit(1)
