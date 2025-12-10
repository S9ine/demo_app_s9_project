"""Add idCardNumber column to staff table"""

import asyncio
from sqlalchemy import text
from app.database import engine


async def add_id_card_number():
    """Add idCardNumber column to staff table"""
    
    async with engine.begin() as conn:
        print("🔄 Adding idCardNumber column to staff table...")
        
        try:
            await conn.execute(text("""
                ALTER TABLE staff 
                ADD COLUMN IF NOT EXISTS "idCardNumber" VARCHAR(13);
            """))
            print("✅ Added idCardNumber column")
        except Exception as e:
            print(f"⚠️  idCardNumber column: {e}")
        
        await conn.execute(text("""
            COMMENT ON COLUMN staff."idCardNumber" IS 'เลขบัตรประชาชน';
        """))
        
        print("✅ Added column comment")
        print("🎉 Migration completed successfully!")


if __name__ == "__main__":
    asyncio.run(add_id_card_number())
