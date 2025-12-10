import asyncio
from app.database import engine
from sqlalchemy import text

async def check_all_staff():
    async with engine.begin() as conn:
        result = await conn.execute(text(
            'SELECT id, "staffId", "firstName", "lastName", position, department FROM staff'
        ))
        rows = result.fetchall()
        
        print(f'\n=== All Staff Data (Total: {len(rows)}) ===')
        for row in rows:
            print(f'ID: {row[0]}, StaffId: {row[1]}, Name: {row[2]} {row[3]}, Position: {row[4]}, Dept: {row[5]}')
        print('=' * 80)

if __name__ == "__main__":
    asyncio.run(check_all_staff())
