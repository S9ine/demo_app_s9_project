import asyncio
from app.database import engine
from sqlalchemy import text

async def update_staff_3():
    async with engine.begin() as conn:
        await conn.execute(text(
            "UPDATE staff SET position = 'พนักงานบัญชี', department = 'แผนกบัญชี' WHERE id = 3"
        ))
    print("✅ Updated staff ID 3")
    
    # เช็คผลลัพธ์
    async with engine.begin() as conn:
        result = await conn.execute(text(
            'SELECT id, "staffId", "firstName", "lastName", position, department FROM staff WHERE id = 3'
        ))
        row = result.fetchone()
        if row:
            print(f'\nID: {row[0]}, StaffId: {row[1]}')
            print(f'Name: {row[2]} {row[3]}')
            print(f'Position: {row[4]}')
            print(f'Department: {row[5]}')

asyncio.run(update_staff_3())
