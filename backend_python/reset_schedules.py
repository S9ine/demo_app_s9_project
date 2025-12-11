"""
Reset all schedule data in database
ลบข้อมูลตารางงานทั้งหมด (schedules และ schedule_guards)
"""
import asyncio
from sqlalchemy import text
from app.database import async_session_maker

async def reset_schedules():
    """Delete all schedule and schedule_guards data"""
    
    async with async_session_maker() as db:
        print("="*80)
        print("🗑️  Reset Schedule Data")
        print("="*80)
        
        # Check existing data
        result = await db.execute(text("SELECT COUNT(*) FROM schedules"))
        schedules_count = result.scalar()
        
        result = await db.execute(text("SELECT COUNT(*) FROM schedule_guards"))
        guards_count = result.scalar()
        
        print(f"\n📊 ข้อมูลปัจจุบัน:")
        print(f"   Schedules: {schedules_count} records")
        print(f"   Schedule Guards: {guards_count} records")
        
        if schedules_count == 0 and guards_count == 0:
            print("\n✅ ไม่มีข้อมูลที่ต้องลบ")
            return
        
        # Confirm deletion
        print(f"\n⚠️  คุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่?")
        print(f"   - จะลบ {schedules_count} ตารางงาน")
        print(f"   - จะลบ {guards_count} รายการพนักงาน")
        
        # In script mode, we'll auto-confirm. For interactive, uncomment below:
        # response = input("\n   พิมพ์ 'yes' เพื่อยืนยัน: ")
        # if response.lower() != 'yes':
        #     print("❌ ยกเลิกการลบข้อมูล")
        #     return
        
        print("\n🔄 กำลังลบข้อมูล...")
        
        # Delete schedule_guards first (child table)
        await db.execute(text("DELETE FROM schedule_guards"))
        print("   ✅ ลบ schedule_guards สำเร็จ")
        
        # Delete schedules
        await db.execute(text("DELETE FROM schedules"))
        print("   ✅ ลบ schedules สำเร็จ")
        
        # Reset sequences (optional)
        await db.execute(text("ALTER SEQUENCE schedules_id_seq RESTART WITH 1"))
        await db.execute(text("ALTER SEQUENCE schedule_guards_id_seq RESTART WITH 1"))
        print("   ✅ รีเซ็ต ID sequences")
        
        await db.commit()
        
        # Verify
        result = await db.execute(text("SELECT COUNT(*) FROM schedules"))
        schedules_after = result.scalar()
        
        result = await db.execute(text("SELECT COUNT(*) FROM schedule_guards"))
        guards_after = result.scalar()
        
        print(f"\n📊 ข้อมูลหลังลบ:")
        print(f"   Schedules: {schedules_after} records")
        print(f"   Schedule Guards: {guards_after} records")
        
        print("\n" + "="*80)
        print("✅ รีเซ็ตข้อมูลตารางงานเสร็จสมบูรณ์!")
        print("="*80)
        print("\n💡 คุณสามารถเริ่มจัดตารางงานใหม่ได้ทันที")

if __name__ == "__main__":
    asyncio.run(reset_schedules())
