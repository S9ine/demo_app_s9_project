"""
Migration script to split 'name' field into 'firstName' and 'lastName' for Guard and Staff tables.

This script:
1. Adds firstName and lastName columns to guards and staff tables
2. Migrates existing name data by splitting on first space
3. Drops the old name column

Usage:
    python migrate_split_name.py
"""
import asyncio
from sqlalchemy import text
from app.database import engine


async def migrate_split_name():
    """Migrate name field to firstName and lastName"""
    async with engine.begin() as conn:
        print("Starting migration: Split name into firstName and lastName")
        
        # ===== GUARDS TABLE =====
        print("\n1. Processing guards table...")
        
        # Add new columns
        print("  - Adding firstName and lastName columns to guards...")
        await conn.execute(text("""
            ALTER TABLE guards 
            ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(100),
            ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(100)
        """))
        
        # Migrate data: split name by first space
        print("  - Migrating existing name data...")
        await conn.execute(text("""
            UPDATE guards 
            SET 
                "firstName" = CASE 
                    WHEN position(' ' in name) > 0 
                    THEN substring(name from 1 for position(' ' in name) - 1)
                    ELSE name
                END,
                "lastName" = CASE 
                    WHEN position(' ' in name) > 0 
                    THEN substring(name from position(' ' in name) + 1)
                    ELSE ''
                END
            WHERE "firstName" IS NULL OR "lastName" IS NULL
        """))
        
        # Set columns to NOT NULL
        print("  - Setting firstName and lastName as required fields...")
        await conn.execute(text("""
            ALTER TABLE guards 
            ALTER COLUMN "firstName" SET NOT NULL,
            ALTER COLUMN "lastName" SET NOT NULL
        """))
        
        # Drop old name column
        print("  - Dropping old name column...")
        await conn.execute(text("ALTER TABLE guards DROP COLUMN IF EXISTS name"))
        
        # ===== STAFF TABLE =====
        print("\n2. Processing staff table...")
        
        # Add new columns
        print("  - Adding firstName and lastName columns to staff...")
        await conn.execute(text("""
            ALTER TABLE staff 
            ADD COLUMN IF NOT EXISTS "firstName" VARCHAR(100),
            ADD COLUMN IF NOT EXISTS "lastName" VARCHAR(100)
        """))
        
        # Migrate data: split name by first space
        print("  - Migrating existing name data...")
        await conn.execute(text("""
            UPDATE staff 
            SET 
                "firstName" = CASE 
                    WHEN position(' ' in name) > 0 
                    THEN substring(name from 1 for position(' ' in name) - 1)
                    ELSE name
                END,
                "lastName" = CASE 
                    WHEN position(' ' in name) > 0 
                    THEN substring(name from position(' ' in name) + 1)
                    ELSE ''
                END
            WHERE "firstName" IS NULL OR "lastName" IS NULL
        """))
        
        # Set columns to NOT NULL
        print("  - Setting firstName and lastName as required fields...")
        await conn.execute(text("""
            ALTER TABLE staff 
            ALTER COLUMN "firstName" SET NOT NULL,
            ALTER COLUMN "lastName" SET NOT NULL
        """))
        
        # Drop old name column
        print("  - Dropping old name column...")
        await conn.execute(text("ALTER TABLE staff DROP COLUMN IF EXISTS name"))
        
        print("\n✅ Migration completed successfully!")
        print("   - Guards and Staff tables now use firstName and lastName")
        print("   - Old name column has been removed")


async def verify_migration():
    """Verify the migration was successful"""
    async with engine.connect() as conn:
        print("\n" + "="*60)
        print("Verifying migration...")
        print("="*60)
        
        # Check guards table structure
        result = await conn.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'guards' 
            AND column_name IN ('name', 'firstName', 'lastName')
            ORDER BY column_name
        """))
        print("\nGuards table columns:")
        for row in result:
            print(f"  - {row[0]}: {row[1]} (nullable: {row[2]})")
        
        # Check staff table structure
        result = await conn.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'staff' 
            AND column_name IN ('name', 'firstName', 'lastName')
            ORDER BY column_name
        """))
        print("\nStaff table columns:")
        for row in result:
            print(f"  - {row[0]}: {row[1]} (nullable: {row[2]})")
        
        # Sample data from guards
        result = await conn.execute(text("""
            SELECT "guardId", "firstName", "lastName" 
            FROM guards 
            LIMIT 3
        """))
        print("\nSample guards data:")
        rows = result.fetchall()
        if rows:
            for row in rows:
                print(f"  - {row[0]}: {row[1]} {row[2]}")
        else:
            print("  (no data)")
        
        # Sample data from staff
        result = await conn.execute(text("""
            SELECT "staffId", "firstName", "lastName" 
            FROM staff 
            LIMIT 3
        """))
        print("\nSample staff data:")
        rows = result.fetchall()
        if rows:
            for row in rows:
                print(f"  - {row[0]}: {row[1]} {row[2]}")
        else:
            print("  (no data)")


async def main():
    """Main migration function"""
    try:
        await migrate_split_name()
        await verify_migration()
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
