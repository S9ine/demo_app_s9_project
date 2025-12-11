"""
Migration V8: Add shift_config column to sites table
เพิ่มคอลัมน์สำหรับเก็บการตั้งค่ากะงานของแต่ละหน่วยงาน
"""

import sys
import asyncio
from sqlalchemy import text
from app.database import engine


async def run_migration():
    """Run migration to add shift_config to sites table"""
    
    async with engine.begin() as conn:
        print("=" * 80)
        print("Migration V8: Add shift_config to sites table")
        print("=" * 80)
        
        # Add shift_config column (JSONB)
        print("\n📝 Adding shift_config column...")
        await conn.execute(text("""
            ALTER TABLE sites 
            ADD COLUMN IF NOT EXISTS shift_config JSONB DEFAULT '{}'::jsonb
        """))
        print("✅ Added shift_config column")
        
        # Add comment
        print("\n📝 Adding column comment...")
        await conn.execute(text("""
            COMMENT ON COLUMN sites.shift_config IS 
            'การตั้งค่ากะงาน: {day: {enabled, name, requiredGuards, startTime, endTime}, night: {...}}'
        """))
        print("✅ Added column comment")
        
        # Create index for better query performance
        print("\n📝 Creating index on shift_config...")
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_sites_shift_config 
            ON sites USING gin (shift_config)
        """))
        print("✅ Created GIN index on shift_config")
        
        # Set default shift config for existing sites
        print("\n📝 Setting default shift config for existing sites...")
        await conn.execute(text("""
            UPDATE sites 
            SET shift_config = '{
                "day": {
                    "enabled": true,
                    "name": "กะเช้า",
                    "requiredGuards": 1,
                    "startTime": "08:00",
                    "endTime": "20:00"
                },
                "night": {
                    "enabled": true,
                    "name": "กะดึก",
                    "requiredGuards": 1,
                    "startTime": "20:00",
                    "endTime": "08:00"
                }
            }'::jsonb
            WHERE shift_config IS NULL OR shift_config = '{}'::jsonb
        """))
        print("✅ Set default shift config for existing sites")
        
        print("\n" + "=" * 80)
        print("✅ Migration V8 completed successfully!")
        print("=" * 80)


if __name__ == "__main__":
    asyncio.run(run_migration())
