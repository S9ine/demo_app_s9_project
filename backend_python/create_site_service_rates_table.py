"""
Migration Script: Create site_service_rates table
สร้างตารางเก็บอัตราค่าจ้างเฉพาะแต่ละหน่วยงาน
"""
import asyncio
from sqlalchemy import text
from app.database import engine


async def create_site_service_rates_table():
    """สร้างตาราง site_service_rates"""
    
    async with engine.begin() as conn:
        # ตรวจสอบว่าตารางมีอยู่แล้วหรือไม่
        result = await conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'site_service_rates'
            );
        """))
        exists = result.scalar()
        
        if exists:
            print("⚠️  Table 'site_service_rates' already exists!")
            return
        
        print("🔧 Creating table 'site_service_rates'...")
        
        # สร้างตาราง
        await conn.execute(text("""
            CREATE TABLE site_service_rates (
                id SERIAL PRIMARY KEY,
                "siteId" INTEGER NOT NULL,
                "serviceId" INTEGER NOT NULL,
                
                -- Custom Rates
                "customRate" NUMERIC(10, 2),
                "customDiligenceBonus" NUMERIC(10, 2),
                "customSevenDayBonus" NUMERIC(10, 2),
                "customPointBonus" NUMERIC(10, 2),
                
                -- Control
                "useDefaultRate" BOOLEAN NOT NULL DEFAULT FALSE,
                
                -- Additional
                remarks TEXT,
                
                -- Metadata
                "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP WITH TIME ZONE,
                
                -- Foreign Keys
                CONSTRAINT fk_site FOREIGN KEY ("siteId") 
                    REFERENCES sites(id) ON DELETE CASCADE,
                CONSTRAINT fk_service FOREIGN KEY ("serviceId") 
                    REFERENCES services(id) ON DELETE CASCADE,
                    
                -- Unique Constraint (ห้ามซ้ำ siteId + serviceId)
                CONSTRAINT uk_site_service UNIQUE ("siteId", "serviceId")
            );
        """))
        
        # สร้าง indexes
        await conn.execute(text("""
            CREATE INDEX idx_site_service_rates_site_id 
                ON site_service_rates("siteId");
        """))
        
        await conn.execute(text("""
            CREATE INDEX idx_site_service_rates_service_id 
                ON site_service_rates("serviceId");
        """))
        
        # เพิ่ม comments
        await conn.execute(text("""
            COMMENT ON TABLE site_service_rates IS 
                'อัตราค่าจ้างเฉพาะแต่ละหน่วยงาน (Site-specific service rates)';
        """))
        
        await conn.execute(text("""
            COMMENT ON COLUMN site_service_rates."customRate" IS 
                'อัตราค่าจ้างต่อวัน (บาท)';
        """))
        
        await conn.execute(text("""
            COMMENT ON COLUMN site_service_rates."useDefaultRate" IS 
                'True = ใช้อัตราจาก services table, False = ใช้ customRate';
        """))
        
        print("✅ Table 'site_service_rates' created successfully!")
        
        # แสดงโครงสร้างตาราง
        result = await conn.execute(text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'site_service_rates'
            ORDER BY ordinal_position;
        """))
        
        print("\n📋 Table Structure:")
        for row in result:
            print(f"  - {row[0]}: {row[1]} (nullable: {row[2]})")
        
        # ตรวจสอบ constraints
        result = await conn.execute(text("""
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'site_service_rates';
        """))
        
        print("\n🔒 Constraints:")
        for row in result:
            print(f"  - {row[0]} ({row[1]})")


async def main():
    print("=" * 60)
    print("Migration: Create site_service_rates table")
    print("=" * 60)
    
    try:
        await create_site_service_rates_table()
        print("\n✅ Migration completed successfully!")
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
