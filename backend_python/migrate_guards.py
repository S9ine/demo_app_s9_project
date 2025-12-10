"""
ALTER TABLE script to add missing columns to guards table
Run this in PostgreSQL or via migration
"""

import asyncio
from sqlalchemy import text  # type: ignore
from app.database import async_session_maker, engine
from app.models.guard import Guard

async def migrate_guards_table():
    """Add missing columns to guards table"""
    
    print("🔄 Starting migration for guards table...")
    
    async with async_session_maker() as db:
        try:
            # Add idCardNumber
            await db.execute(text("""
                ALTER TABLE guards 
                ADD COLUMN IF NOT EXISTS "idCardNumber" VARCHAR(20)
            """))
            print("✅ Added column: idCardNumber")
            
            # Add position
            await db.execute(text("""
                ALTER TABLE guards 
                ADD COLUMN IF NOT EXISTS position VARCHAR(100)
            """))
            print("✅ Added column: position")
            
            # Add department
            await db.execute(text("""
                ALTER TABLE guards 
                ADD COLUMN IF NOT EXISTS department VARCHAR(100)
            """))
            print("✅ Added column: department")
            
            # Add startDate
            await db.execute(text("""
                ALTER TABLE guards 
                ADD COLUMN IF NOT EXISTS "startDate" DATE
            """))
            print("✅ Added column: startDate")
            
            # Add birthDate
            await db.execute(text("""
                ALTER TABLE guards 
                ADD COLUMN IF NOT EXISTS "birthDate" DATE
            """))
            print("✅ Added column: birthDate")
            
            # Add salary
            await db.execute(text("""
                ALTER TABLE guards 
                ADD COLUMN IF NOT EXISTS salary NUMERIC(10, 2)
            """))
            print("✅ Added column: salary")
            
            # Add salaryType
            await db.execute(text("""
                ALTER TABLE guards 
                ADD COLUMN IF NOT EXISTS "salaryType" VARCHAR(50)
            """))
            print("✅ Added column: salaryType")
            
            # Add paymentMethod
            await db.execute(text("""
                ALTER TABLE guards 
                ADD COLUMN IF NOT EXISTS "paymentMethod" VARCHAR(50)
            """))
            print("✅ Added column: paymentMethod")
            
            await db.commit()
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

async def verify_migration():
    """Verify all columns exist after migration"""
    async with async_session_maker() as db:
        result = await db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'guards' 
            ORDER BY ordinal_position
        """))
        columns = [row[0] for row in result.fetchall()]
        
        print("\n📊 Current table columns:")
        for col in columns:
            print(f"  - {col}")
        
        required = ['idCardNumber', 'position', 'department', 'startDate', 
                   'birthDate', 'salary', 'salaryType', 'paymentMethod']
        missing = [col for col in required if col not in columns]
        
        if missing:
            print(f"\n❌ Still missing: {missing}")
        else:
            print("\n✅ All required columns present!")

if __name__ == "__main__":
    print("=" * 80)
    print("🔧 GUARDS TABLE MIGRATION")
    print("=" * 80)
    asyncio.run(migrate_guards_table())
    asyncio.run(verify_migration())
