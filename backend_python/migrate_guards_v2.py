"""
Migration script to add new columns for Guard model v2
"""
import asyncio
from sqlalchemy import text  # type: ignore
from app.database import async_session_maker

async def migrate_guards_v2():
    """Add new columns for comprehensive guard information"""
    
    print("🔄 Starting Guards V2 migration...")
    
    async with async_session_maker() as db:
        try:
            # Add title (คำนำหน้า)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS title VARCHAR(20)'))
            print("✅ Added: title")
            
            # Add nationality (สัญชาติ)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS nationality VARCHAR(50)'))
            print("✅ Added: nationality")
            
            # Add religion (ศาสนา)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS religion VARCHAR(50)'))
            print("✅ Added: religion")
            
            # Add addressIdCard (ที่อยู่ตามบัตร)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS "addressIdCard" VARCHAR(500)'))
            print("✅ Added: addressIdCard")
            
            # Add addressCurrent (ที่อยู่ปัจจุบัน)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS "addressCurrent" VARCHAR(500)'))
            print("✅ Added: addressCurrent")
            
            # Add education (การศึกษา)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS education VARCHAR(100)'))
            print("✅ Added: education")
            
            # Add licenseNumber (เลขใบอนุญาต)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS "licenseNumber" VARCHAR(50)'))
            print("✅ Added: licenseNumber")
            
            # Add licenseExpiry (วันหมดอายุใบอนุญาต)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS "licenseExpiry" DATE'))
            print("✅ Added: licenseExpiry")
            
            # Add bankAccountName (ชื่อบัญชี)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS "bankAccountName" VARCHAR(200)'))
            print("✅ Added: bankAccountName")
            
            # Add maritalStatus (สถานภาพสมรส)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS "maritalStatus" VARCHAR(50)'))
            print("✅ Added: maritalStatus")
            
            # Add spouseName (ชื่อคู่สมรส)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS "spouseName" VARCHAR(200)'))
            print("✅ Added: spouseName")
            
            # Add emergencyContactName (ชื่อผู้ติดต่อฉุกเฉิน)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS "emergencyContactName" VARCHAR(200)'))
            print("✅ Added: emergencyContactName")
            
            # Add emergencyContactPhone (เบอร์ฉุกเฉิน)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS "emergencyContactPhone" VARCHAR(20)'))
            print("✅ Added: emergencyContactPhone")
            
            # Add emergencyContactRelation (ความสัมพันธ์)
            await db.execute(text('ALTER TABLE guards ADD COLUMN IF NOT EXISTS "emergencyContactRelation" VARCHAR(100)'))
            print("✅ Added: emergencyContactRelation")
            
            await db.commit()
            print("\n✅ Migration V2 completed successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    print("=" * 80)
    print("🔧 GUARDS TABLE MIGRATION V2")
    print("=" * 80)
    asyncio.run(migrate_guards_v2())
