import asyncio
from app.database import engine
from sqlalchemy import text

async def count_audit_logs():
    async with engine.connect() as conn:
        # Count total audit logs for guards
        result = await conn.execute(
            text('SELECT COUNT(*) FROM audit_logs WHERE "entityType" = \'guards\'')
        )
        count = result.scalar()
        
        print(f'\n📊 จำนวน Audit Logs สำหรับ Guards: {count} รายการ\n')
        
        if count == 0:
            print('❌ ยังไม่มีประวัติการแก้ไขเลย')
            print('   เพราะเพิ่งลบ audit logs เก่าออกไป\n')
            print('✅ ขั้นตอนต่อไป:')
            print('   1. ไปที่หน้า Guards')
            print('   2. แก้ไขข้อมูล guard ใดก็ได้ → บันทึก')
            print('   3. คลิกปุ่ม 📜 ประวัติ')
            print('   4. จะเห็น audit log แสดงขึ้นมา!\n')
        else:
            # Show breakdown by action
            result2 = await conn.execute(
                text('''
                    SELECT action, COUNT(*) 
                    FROM audit_logs 
                    WHERE "entityType" = 'guards' 
                    GROUP BY action
                    ORDER BY action
                ''')
            )
            rows = result2.fetchall()
            
            print('รายละเอียดแยกตามประเภท:')
            for row in rows:
                print(f'  - {row[0]}: {row[1]} รายการ')
            print()

if __name__ == "__main__":
    asyncio.run(count_audit_logs())
