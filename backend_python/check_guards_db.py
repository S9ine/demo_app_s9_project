import asyncio
from sqlalchemy import text
from app.database import async_session_maker

async def check_guards_table():
    async with async_session_maker() as db:
        # Check if table exists
        result = await db.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'guards'
            );
        """))
        exists = result.scalar()
        
        if not exists:
            print("❌ Table 'guards' does not exist in database!")
            print("🔧 Need to run: CREATE TABLE or alembic migration")
            return
        
        print("✅ Table 'guards' exists in database")
        
        # Get columns
        result = await db.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'guards' 
            ORDER BY ordinal_position
        """))
        cols = result.fetchall()
        
        print(f"\n📊 Database Table Schema ({len(cols)} columns):")
        print("-" * 80)
        for col in cols:
            nullable = "NULL" if col[2] == 'YES' else "NOT NULL"
            default = f" DEFAULT {col[3]}" if col[3] else ""
            print(f"  {col[0]:<20} {col[1]:<20} {nullable:<10}{default}")
        
        # Check if startDate exists
        startdate_exists = any(col[0] == 'startDate' for col in cols)
        if startdate_exists:
            print("\n✅ Column 'startDate' exists - can save date values!")
        else:
            print("\n❌ Column 'startDate' MISSING - cannot save date values!")
            print("🔧 Need to add column or run migration")

if __name__ == "__main__":
    asyncio.run(check_guards_table())
