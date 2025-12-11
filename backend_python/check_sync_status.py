"""
Check and sync all schedules to schedule_guards
ตรวจสอบและ sync ตารางเวรทั้งหมดเข้า schedule_guards
"""
import asyncio
from sqlalchemy import select, text
from app.database import async_session_maker
from app.models.schedule import Schedule
from app.models.schedule_guard import ScheduleGuard

async def check_and_sync():
    """Check if all schedules are synced to schedule_guards"""
    
    async with async_session_maker() as db:
        # Count schedules
        result = await db.execute(
            select(Schedule).where(Schedule.isActive == True)
        )
        schedules = result.scalars().all()
        total_schedules = len(schedules)
        
        print(f"📅 Total active schedules: {total_schedules}")
        
        if total_schedules == 0:
            print("✅ No schedules to sync")
            return
        
        # Count schedule_guards records
        result = await db.execute(
            text("SELECT COUNT(*) FROM schedule_guards")
        )
        total_guards = result.scalar()
        
        print(f"👥 Total schedule_guards records: {total_guards}")
        
        # Check each schedule
        schedules_without_guards = []
        
        for schedule in schedules:
            result = await db.execute(
                select(ScheduleGuard).where(ScheduleGuard.scheduleId == schedule.id)  # type: ignore
            )
            guards = result.scalars().all()
            
            if len(guards) == 0:
                schedules_without_guards.append(schedule)
        
        if len(schedules_without_guards) > 0:
            print(f"\n⚠️  Found {len(schedules_without_guards)} schedules without guard records:")
            for s in schedules_without_guards:
                print(f"   - Schedule ID {s.id}: {s.scheduleDate} at {s.siteName}")  # type: ignore
            
            print("\n💡 Recommendation: Run backfill_schedule_guards.py to sync these schedules")
        else:
            print("\n✅ All schedules are properly synced to schedule_guards table!")
        
        # Show summary by date
        print("\n📊 Summary by date:")
        result = await db.execute(
            text("""
                SELECT 
                    "scheduleDate",
                    COUNT(DISTINCT "scheduleId") as schedules_count,
                    COUNT(*) as guards_count,
                    SUM(CASE WHEN shift = 'day' THEN 1 ELSE 0 END) as day_shifts,
                    SUM(CASE WHEN shift = 'night' THEN 1 ELSE 0 END) as night_shifts
                FROM schedule_guards
                GROUP BY "scheduleDate"
                ORDER BY "scheduleDate" DESC
                LIMIT 10
            """)
        )
        
        rows = result.fetchall()
        if rows:
            print(f"{'Date':<15} {'Schedules':<12} {'Guards':<10} {'Day':<8} {'Night':<8}")
            print("-" * 60)
            for row in rows:
                print(f"{str(row[0]):<15} {row[1]:<12} {row[2]:<10} {row[3]:<8} {row[4]:<8}")

if __name__ == "__main__":
    print("="*80)
    print("Checking Schedule Guards Synchronization Status")
    print("="*80)
    asyncio.run(check_and_sync())
    print("="*80)
