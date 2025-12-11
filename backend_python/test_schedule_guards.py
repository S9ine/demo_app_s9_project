"""
Test script for schedule_guards synchronization
ทดสอบว่าเมื่อสร้าง schedule ข้อมูลจะถูก sync ไป schedule_guards หรือไม่
"""
import asyncio
from datetime import date
from app.database import engine
from sqlalchemy import text

async def test_schedule_guards():
    """ทดสอบการ sync ข้อมูล schedule_guards"""
    
    async with engine.begin() as conn:
        print("=== Testing Schedule Guards Synchronization ===\n")
        
        # 1. Check existing schedules
        result = await conn.execute(
            text("SELECT id, \"scheduleDate\", \"siteName\", \"totalGuards\" FROM schedules WHERE \"isActive\" = true LIMIT 3")
        )
        schedules = result.fetchall()
        
        print(f"📅 Found {len(schedules)} active schedules:")
        for schedule in schedules:
            print(f"   ID: {schedule[0]}, Date: {schedule[1]}, Site: {schedule[2]}, Guards: {schedule[3]}")
        
        print()
        
        # 2. Check schedule_guards records
        result = await conn.execute(
            text("SELECT COUNT(*) FROM schedule_guards")
        )
        guard_count = result.scalar()
        
        print(f"👥 Records in schedule_guards: {guard_count}")
        
        if guard_count > 0:
            # Show sample records
            result = await conn.execute(
                text("""
                    SELECT 
                        "scheduleId",
                        "scheduleDate",
                        "guardId",
                        "guardName",
                        "siteName",
                        shift,
                        position,
                        "payoutRate"
                    FROM schedule_guards
                    ORDER BY "scheduleDate" DESC, "guardId"
                    LIMIT 10
                """)
            )
            records = result.fetchall()
            
            print("\n📋 Sample records (latest 10):")
            print(f"{'Sch.ID':<8} {'Date':<12} {'Guard ID':<12} {'Name':<20} {'Site':<15} {'Shift':<8} {'Pos':<10} {'Rate':<8}")
            print("-" * 110)
            for rec in records:
                print(f"{rec[0]:<8} {str(rec[1]):<12} {rec[2]:<12} {rec[3]:<20} {rec[4]:<15} {rec[5]:<8} {rec[6]:<10} {rec[7]:<8.2f}")
        
        print("\n" + "="*110)
        
        # 3. Check if we need to sync existing schedules
        if guard_count == 0 and len(schedules) > 0:
            print("\n⚠️  Warning: You have active schedules but no schedule_guards records!")
            print("   This means the schedules were created before the schedule_guards table existed.")
            print("   You need to:")
            print("   1. Edit each schedule in the frontend (this will trigger sync)")
            print("   2. OR run a migration script to backfill existing schedules")
        elif guard_count > 0:
            print("\n✅ Schedule guards table is populated and ready for payroll queries!")
        else:
            print("\n📝 No schedules yet. Create a schedule to test the sync functionality.")

if __name__ == "__main__":
    asyncio.run(test_schedule_guards())
