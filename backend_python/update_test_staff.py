import asyncio
from app.database import engine
from sqlalchemy import text

async def update_test_data():
    async with engine.begin() as conn:
        # อัพเดทข้อมูลทดสอบ
        await conn.execute(text(
            '''UPDATE staff 
               SET position = 'พนักงานบัญชี', 
                   department = 'แผนกบัญชี' 
               WHERE id = 2'''
        ))
        print("✅ Updated staff ID 2 with test data")
        
    # เช็คผลลัพธ์ใน transaction แยก
    async with engine.begin() as conn:
        result = await conn.execute(text(
            'SELECT id, "staffId", "firstName", "lastName", position, department FROM staff WHERE id = 2'
        ))
        row = result.fetchone()
        
        if row:
            print('\n=== Updated Staff Data ===')
            print(f'ID: {row[0]}')
            print(f'StaffId: {row[1]}')
            print(f'Name: {row[2]} {row[3]}')
            print(f'Position: {row[4]}')
            print(f'Department: {row[5]}')
            print('=' * 50)
        else:
            print('❌ No data found')

if __name__ == "__main__":
    asyncio.run(update_test_data())
