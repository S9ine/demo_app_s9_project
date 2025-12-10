"""
Migration Script: Create schedules table
สร้างตารางเก็บข้อมูลตารางงาน
"""
import asyncio
from sqlalchemy import text
from app.database import engine


async def create_schedules_table():
    """สร้างตาราง schedules"""
    
    async with engine.begin() as conn:
        # ตรวจสอบว่าตารางมีอยู่แล้วหรือไม่
        result = await conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'schedules'
            );
        """))
        exists = result.scalar()
        
        if exists:
            print("⚠️  Table 'schedules' already exists!")
            return
        
        print("🔧 Creating table 'schedules'...")
        
        # สร้างตาราง
        await conn.execute(text("""
            CREATE TABLE schedules (
                id SERIAL PRIMARY KEY,
                
                -- วันที่และหน่วยงาน
                "scheduleDate" DATE NOT NULL,
                "siteId" INTEGER NOT NULL,
                "siteName" VARCHAR(255) NOT NULL,
                
                -- ข้อมูลตารางงาน (JSON)
                shifts TEXT NOT NULL,
                
                -- Statistics
                "totalGuardsDay" INTEGER DEFAULT 0,
                "totalGuardsNight" INTEGER DEFAULT 0,
                "totalGuards" INTEGER DEFAULT 0,
                
                -- Metadata
                "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE,
                "createdBy" INTEGER,
                remarks TEXT,
                
                -- Foreign Keys
                CONSTRAINT fk_schedule_site FOREIGN KEY ("siteId") 
                    REFERENCES sites(id) ON DELETE CASCADE,
                CONSTRAINT fk_schedule_user FOREIGN KEY ("createdBy") 
                    REFERENCES users(id) ON DELETE SET NULL,
                    
                -- Unique Constraint (ห้ามซ้ำ วันที่ + หน่วยงาน)
                CONSTRAINT uk_schedule_date_site UNIQUE ("scheduleDate", "siteId")
            );
        """))
        
        # สร้าง indexes
        await conn.execute(text("""
            CREATE INDEX idx_schedules_date 
                ON schedules("scheduleDate");
        """))
        
        await conn.execute(text("""
            CREATE INDEX idx_schedules_site_id 
                ON schedules("siteId");
        """))
        
        await conn.execute(text("""
            CREATE INDEX idx_schedules_date_site 
                ON schedules("scheduleDate", "siteId");
        """))
        
        # เพิ่ม comments
        await conn.execute(text("""
            COMMENT ON TABLE schedules IS 
                'ตารางงาน - จัดพนักงานตามหน่วยงานและวันที่';
        """))
        
        await conn.execute(text("""
            COMMENT ON COLUMN schedules."scheduleDate" IS 
                'วันที่จัดตารางงาน';
        """))
        
        await conn.execute(text("""
            COMMENT ON COLUMN schedules.shifts IS 
                'ข้อมูลกะงาน (JSON) - เก็บ day shift และ night shift';
        """))
        
        print("✅ Table 'schedules' created successfully!")
        
        # แสดงโครงสร้างตาราง
        result = await conn.execute(text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'schedules'
            ORDER BY ordinal_position;
        """))
        
        print("\n📋 Table Structure:")
        for row in result:
            print(f"  - {row[0]}: {row[1]} (nullable: {row[2]})")
        
        # ตรวจสอบ constraints
        result = await conn.execute(text("""
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'schedules';
        """))
        
        print("\n🔒 Constraints:")
        for row in result:
            print(f"  - {row[0]} ({row[1]})")


async def main():
    print("=" * 60)
    print("Migration: Create schedules table")
    print("=" * 60)
    
    try:
        await create_schedules_table()
        print("\n✅ Migration completed successfully!")
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
