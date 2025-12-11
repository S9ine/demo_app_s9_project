"""
Migration script to add new columns for Staff model
"""
import asyncio
from sqlalchemy import text  # type: ignore
from app.database import async_session_maker

async def migrate_staff_v2():
    """Add new columns for staff information"""
    
    print("🔄 Starting Staff V2 migration...")
    
    async with async_session_maker() as db:
        try:
            # Add title (คำนำหน้า)
            await db.execute(text('ALTER TABLE staff ADD COLUMN IF NOT EXISTS title VARCHAR(20)'))
            print("✅ Added: title")
            
            # Add email (อีเมล)
            await db.execute(text('ALTER TABLE staff ADD COLUMN IF NOT EXISTS email VARCHAR(100)'))
            print("✅ Added: email")
            
            # Add emergencyContactName (ชื่อผู้ติดต่อฉุกเฉิน)
            await db.execute(text('ALTER TABLE staff ADD COLUMN IF NOT EXISTS "emergencyContactName" VARCHAR(200)'))
            print("✅ Added: emergencyContactName")
            
            # Add emergencyContactPhone (เบอร์ฉุกเฉิน)
            await db.execute(text('ALTER TABLE staff ADD COLUMN IF NOT EXISTS "emergencyContactPhone" VARCHAR(20)'))
            print("✅ Added: emergencyContactPhone")
            
            # Add emergencyContactRelation (ความสัมพันธ์)
            await db.execute(text('ALTER TABLE staff ADD COLUMN IF NOT EXISTS "emergencyContactRelation" VARCHAR(100)'))
            print("✅ Added: emergencyContactRelation")
            
            await db.commit()
            print("\n✅ Migration V2 completed successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    print("=" * 80)
    print("🔧 STAFF TABLE MIGRATION V2")
    print("=" * 80)
    asyncio.run(migrate_staff_v2())
