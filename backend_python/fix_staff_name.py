import asyncio
from app.database import engine
from sqlalchemy import text

async def fix_name():
    async with engine.begin() as conn:
        # เช็คข้อมูลเดิม
        result = await conn.execute(text(
            'SELECT id, "staffId", "firstName", "lastName" FROM staff WHERE id = 4'
        ))
        row = result.fetchone()
        
        if row:
            print(f'=== ข้อมูลเดิม ===')
            print(f'ID: {row[0]}')
            print(f'StaffId: {row[1]}')
            print(f'FirstName: [{row[2]}] (length: {len(row[2]) if row[2] else 0})')
            print(f'LastName: [{row[3]}] (length: {len(row[3]) if row[3] else 0})')
            
            # แสดงตัวอักษรแต่ละตัว
            if row[2]:
                print(f'\nFirstName chars: {[c for c in row[2]]}')
            if row[3]:
                print(f'LastName chars: {[c for c in row[3]]}')
            
            # แก้ไขโดยตัดช่องว่างและอักขระพิเศษ
            new_first = row[2].strip() if row[2] else ''
            new_last = row[3].strip() if row[3] else ''
            
            await conn.execute(text(
                'UPDATE staff SET "firstName" = :first, "lastName" = :last WHERE id = 4'
            ), {"first": new_first, "last": new_last})
            
            print(f'\n✅ แก้ไขแล้ว')
            print(f'FirstName: {new_first}')
            print(f'LastName: {new_last}')

asyncio.run(fix_name())
