"""
Migration V11: Add startTime and endTime columns to shifts table
"""
import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine


async def run_migration():
    """Add startTime and endTime columns to shifts table"""
    
    async with engine.begin() as conn:
        print("🚀 Starting migration V11: Add shift times...")
        
        # Check if columns already exist
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'shifts' AND column_name IN ('startTime', 'endTime')
        """))
        existing_columns = [row[0] for row in result.fetchall()]
        
        # Add startTime column if not exists
        if 'startTime' not in existing_columns:
            await conn.execute(text("""
                ALTER TABLE shifts 
                ADD COLUMN "startTime" TIME
            """))
            print("✅ Added startTime column")
        else:
            print("⏭️ startTime column already exists")
        
        # Add endTime column if not exists
        if 'endTime' not in existing_columns:
            await conn.execute(text("""
                ALTER TABLE shifts 
                ADD COLUMN "endTime" TIME
            """))
            print("✅ Added endTime column")
        else:
            print("⏭️ endTime column already exists")
        
        # Update existing shifts with default times (optional)
        # Morning shift: 06:00 - 18:00
        # Night shift: 18:00 - 06:00
        await conn.execute(text("""
            UPDATE shifts 
            SET "startTime" = '06:00', "endTime" = '18:00'
            WHERE "startTime" IS NULL 
            AND (LOWER(name) LIKE '%เช้า%' OR LOWER(name) LIKE '%กลางวัน%' OR LOWER("shiftCode") LIKE '%d%')
        """))
        
        await conn.execute(text("""
            UPDATE shifts 
            SET "startTime" = '18:00', "endTime" = '06:00'
            WHERE "startTime" IS NULL 
            AND (LOWER(name) LIKE '%ดึก%' OR LOWER(name) LIKE '%กลางคืน%' OR LOWER("shiftCode") LIKE '%n%')
        """))
        
        print("✅ Migration V11 completed successfully!")


if __name__ == "__main__":
    asyncio.run(run_migration())
