"""
Migration V9: Create shifts table - ตาราง Master Data สำหรับกะงาน
"""

import sys
import asyncio
from sqlalchemy import text
from app.database import engine


async def run_migration():
    async with engine.begin() as conn:
        print("=" * 80)
        print("Migration V9: Create shifts table")
        print("=" * 80)
        
        print("\n📝 Creating shifts table...")
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS shifts (
                id SERIAL PRIMARY KEY,
                "shiftCode" VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(200) NOT NULL,
                "isActive" BOOLEAN DEFAULT true,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE
            )
        """))
        print("✅ Created shifts table")
        
        print("\n📝 Creating indexes...")
        await conn.execute(text('CREATE INDEX IF NOT EXISTS idx_shifts_code ON shifts("shiftCode")'))
        await conn.execute(text('CREATE INDEX IF NOT EXISTS idx_shifts_active ON shifts("isActive")'))
        print("✅ Created indexes")
        
        print("\n📝 Inserting default shifts...")
        await conn.execute(text("""
            INSERT INTO shifts ("shiftCode", name) VALUES ('K01', 'กะเช้า'), ('K02', 'กะดึก')
            ON CONFLICT ("shiftCode") DO NOTHING
        """))
        print("✅ Inserted default shifts (K01: กะเช้า, K02: กะดึก)")
        
        print("\n" + "=" * 80)
        print("✅ Migration completed!")
        print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_migration())
