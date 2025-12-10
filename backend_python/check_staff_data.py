import asyncio
from app.database import engine
from sqlalchemy import text

async def check_staff_data():
    async with engine.begin() as conn:
        result = await conn.execute(text(
            'SELECT id, "staffId", "firstName", "lastName", position, department FROM staff LIMIT 5'
        ))
        rows = result.fetchall()
        
        print('\n=== Staff Data in Database ===')
        for r in rows:
            print(f'ID: {r[0]}, StaffId: {r[1]}, Name: {r[2]} {r[3]}, Position: {r[4]}, Department: {r[5]}')
        print('=' * 50)

if __name__ == "__main__":
    asyncio.run(check_staff_data())
