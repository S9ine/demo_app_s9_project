"""
Database migration utility - Add title and email to staff table
Run this via: python migrate_staff_fields.py
"""
import asyncio
from sqlalchemy import text
from app.database import engine


async def migrate_staff_table():
    """Add title and email columns to staff table"""
    
    print("=" * 70)
    print("Starting Staff Table Migration")
    print("=" * 70)
    
    async with engine.begin() as conn:
        try:
            # Check existing columns
            result = await conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'staff' 
                AND column_name IN ('title', 'email')
            """))
            existing_columns = [row[0] for row in result.fetchall()]
            
            # Add title column
            if 'title' not in existing_columns:
                print("\n📝 Adding 'title' column...")
                await conn.execute(text("""
                    ALTER TABLE staff 
                    ADD COLUMN title VARCHAR(20)
                """))
                print("✅ 'title' column added successfully!")
            else:
                print("\n⏭️  'title' column already exists")
            
            # Add email column
            if 'email' not in existing_columns:
                print("\n📧 Adding 'email' column...")
                await conn.execute(text("""
                    ALTER TABLE staff 
                    ADD COLUMN email VARCHAR(100)
                """))
                print("✅ 'email' column added successfully!")
            else:
                print("\n⏭️  'email' column already exists")
            
            # Verify changes
            print("\n🔍 Verifying changes...")
            result = await conn.execute(text("""
                SELECT column_name, data_type, character_maximum_length
                FROM information_schema.columns 
                WHERE table_name = 'staff' 
                AND column_name IN ('staffid', 'firstname', 'lastname', 'title', 'email', 'position', 'department')
                ORDER BY ordinal_position
            """))
            
            print("\n📋 Current staff table structure:")
            print("-" * 70)
            for row in result.fetchall():
                col_name, data_type, max_length = row
                length_str = f"({max_length})" if max_length else ""
                print(f"  {col_name:20s} {data_type}{length_str}")
            
            print("\n" + "=" * 70)
            print("✅ Migration completed successfully!")
            print("=" * 70)
            print("\nNew fields added:")
            print("  - title VARCHAR(20)   : คำนำหน้าชื่อ (นาย/นาง/นางสาว)")
            print("  - email VARCHAR(100)  : อีเมล")
            print("\n")
            
        except Exception as e:
            print(f"\n❌ Error during migration: {e}")
            raise


async def main():
    """Main function"""
    try:
        await migrate_staff_table()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
