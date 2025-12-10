import asyncio
from sqlalchemy import text
from app.database import engine

async def add_position_department_columns():
    async with engine.begin() as conn:
        # เพิ่มคอลัมน์ position (ตำแหน่ง)
        await conn.execute(text("""
            ALTER TABLE staff 
            ADD COLUMN IF NOT EXISTS position VARCHAR(100)
        """))
        
        await conn.execute(text("""
            COMMENT ON COLUMN staff.position IS 'ตำแหน่งงาน'
        """))
        
        print("✅ Added position column")
        
        # เพิ่มคอลัมน์ department (แผนก)
        await conn.execute(text("""
            ALTER TABLE staff 
            ADD COLUMN IF NOT EXISTS department VARCHAR(100)
        """))
        
        await conn.execute(text("""
            COMMENT ON COLUMN staff.department IS 'แผนก'
        """))
        
        print("✅ Added department column")
        
    print("🎉 Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(add_position_department_columns())
