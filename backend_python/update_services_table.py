"""Add new columns to services table"""
import asyncio
import asyncpg
from app.config import settings

async def update_services_table():
    """Add new columns to services table"""
    # Connect to database
    conn = await asyncpg.connect(settings.DATABASE_URL.replace('+asyncpg', ''))
    
    try:
        # Add new columns if they don't exist
        await conn.execute("""
            ALTER TABLE services 
            ADD COLUMN IF NOT EXISTS "serviceCode" VARCHAR(50) UNIQUE,
            ADD COLUMN IF NOT EXISTS "serviceName" VARCHAR(200),
            ADD COLUMN IF NOT EXISTS "hiringRate" FLOAT DEFAULT 0.0,
            ADD COLUMN IF NOT EXISTS "diligenceBonus" FLOAT DEFAULT 0.0,
            ADD COLUMN IF NOT EXISTS "sevenDayBonus" FLOAT DEFAULT 0.0,
            ADD COLUMN IF NOT EXISTS "pointBonus" FLOAT DEFAULT 0.0;
        """)
        
        # Create index on serviceCode
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_services_code ON services("serviceCode");
        """)
        
        # Update existing records - copy name to serviceName and generate serviceCode
        await conn.execute("""
            UPDATE services 
            SET "serviceName" = name,
                "serviceCode" = 'SVC-' || LPAD(id::TEXT, 3, '0')
            WHERE "serviceName" IS NULL OR "serviceCode" IS NULL;
        """)
        
        print("✅ Services table updated successfully!")
        print("   - Added serviceCode, serviceName, hiringRate, diligenceBonus, sevenDayBonus, pointBonus columns")
        print("   - Created index on serviceCode")
        print("   - Updated existing records")
        
    except Exception as e:
        print(f"❌ Error updating services table: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(update_services_table())
