import asyncio
from app.database import engine
from sqlalchemy import text

async def fix_lastname():
    async with engine.begin() as conn:
        # แก้ไขนามสกุล - เอาสระ ิ ที่อยู่ด้านหน้าออก
        await conn.execute(text(
            'UPDATE staff SET "lastName" = :last WHERE id = 4'
        ), {"last": "อังคะบุตร"})
        
        print('✅ แก้ไขนามสกุลเรียบร้อย')
        
        # เช็คผลลัพธ์
        result = await conn.execute(text(
            'SELECT "firstName", "lastName" FROM staff WHERE id = 4'
        ))
        row = result.fetchone()
        print(f'\nชื่อ-นามสกุลใหม่: {row[0]} {row[1]}')

asyncio.run(fix_lastname())
