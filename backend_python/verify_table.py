"""Verify schedule_guards table structure"""
import asyncio
from app.database import engine
from sqlalchemy import text

async def verify_table():
    async with engine.begin() as conn:
        # Check table exists
        result = await conn.execute(
            text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'schedule_guards'
            """)
        )
        
        if not result.scalar():
            print("❌ Table schedule_guards not found")
            return
        
        print("✅ Table schedule_guards exists\n")
        
        # Get column details
        result = await conn.execute(
            text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'schedule_guards' 
                ORDER BY ordinal_position
            """)
        )
        
        print("=== Columns ===")
        for row in result:
            nullable = "NULL" if row[2] == "YES" else "NOT NULL"
            print(f"  {row[0]:25} {row[1]:20} {nullable}")
        
        # Get indexes
        result = await conn.execute(
            text("""
                SELECT indexname, indexdef
                FROM pg_indexes 
                WHERE tablename = 'schedule_guards'
            """)
        )
        
        print("\n=== Indexes ===")
        for row in result:
            print(f"  {row[0]}")
        
        # Check record count
        result = await conn.execute(text("SELECT COUNT(*) FROM schedule_guards"))
        count = result.scalar()
        print(f"\n=== Data ===")
        print(f"  Records in table: {count}")
        
        # Check existing schedules
        result = await conn.execute(text("SELECT COUNT(*) FROM schedules WHERE \"isActive\" = true"))
        schedules_count = result.scalar()
        print(f"  Active schedules: {schedules_count}")
        
        print("\n✅ Migration V7 successfully completed!")
        print("📌 Next step: Update schedule API to populate this table")

if __name__ == "__main__":
    asyncio.run(verify_table())
