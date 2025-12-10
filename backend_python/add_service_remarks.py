"""
Migration script to add remarks column to services table
"""
import asyncio
from sqlalchemy import text
from app.database import engine

async def add_remarks_column():
    async with engine.begin() as conn:
        # Check if column exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='services' AND column_name='remarks'
        """)
        result = await conn.execute(check_query)
        exists = result.fetchone()
        
        if not exists:
            print("Adding remarks column to services table...")
            await conn.execute(text("""
                ALTER TABLE services 
                ADD COLUMN remarks TEXT
            """))
            print("✓ Column 'remarks' added successfully")
        else:
            print("✓ Column 'remarks' already exists")

if __name__ == "__main__":
    print("Starting migration: Add remarks column to services table")
    asyncio.run(add_remarks_column())
    print("Migration completed!")
