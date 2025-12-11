"""
Backfill schedule_guards table from existing schedules
รัน script นี้เพื่อเติมข้อมูลเก่าจาก schedules เข้าไปใน schedule_guards
"""
import asyncio
import json
from sqlalchemy import select
from app.database import async_session_maker
from app.models.schedule import Schedule
from app.models.schedule_guard import ScheduleGuard


async def backfill_schedule_guards():
    """Backfill schedule_guards from existing schedules"""
    
    async with async_session_maker() as db:
        # Get all active schedules
        result = await db.execute(
            select(Schedule).where(Schedule.isActive == True)
        )
        schedules = result.scalars().all()
        
        print(f"📅 Found {len(schedules)} active schedules to backfill")
        
        if not schedules:
            print("✅ No schedules to backfill")
            return
        
        total_records = 0
        
        for schedule in schedules:
            # Parse shifts JSON
            try:
                shifts_data = json.loads(schedule.shifts)  # type: ignore
            except (json.JSONDecodeError, TypeError) as e:
                print(f"⚠️  Skipping schedule {schedule.id} - Invalid JSON: {e}")  # type: ignore
                continue
            
            print(f"\n📋 Processing Schedule ID: {schedule.id}")  # type: ignore
            print(f"   Date: {schedule.scheduleDate}, Site: {schedule.siteName}")  # type: ignore
            
            # Process day shift
            day_guards = shifts_data.get('day', [])
            print(f"   Day shift: {len(day_guards)} guards")
            
            for guard_data in day_guards:
                guard_record = ScheduleGuard(
                    scheduleId=schedule.id,  # type: ignore
                    scheduleDate=schedule.scheduleDate,  # type: ignore
                    guardId=guard_data.get('guardId', ''),
                    guard_id_fk=guard_data.get('guard_id_fk'),
                    guardName=guard_data.get('guardName', ''),
                    siteId=schedule.siteId,  # type: ignore
                    siteName=schedule.siteName,  # type: ignore
                    shift='day',
                    position=guard_data.get('position', ''),
                    dailyIncome=float(guard_data.get('dailyIncome', 0)),
                    payoutRate=float(guard_data.get('payoutRate', 0)),
                    hiringRate=float(guard_data.get('hiringRate', 0)),
                    positionAllowance=float(guard_data.get('positionAllowance', 0)),
                    diligenceBonus=float(guard_data.get('diligenceBonus', 0)),
                    sevenDayBonus=float(guard_data.get('sevenDayBonus', 0)),
                    pointBonus=float(guard_data.get('pointBonus', 0)),
                    otherAllowance=float(guard_data.get('otherAllowance', 0))
                )
                db.add(guard_record)
                total_records += 1
            
            # Process night shift
            night_guards = shifts_data.get('night', [])
            print(f"   Night shift: {len(night_guards)} guards")
            
            for guard_data in night_guards:
                guard_record = ScheduleGuard(
                    scheduleId=schedule.id,  # type: ignore
                    scheduleDate=schedule.scheduleDate,  # type: ignore
                    guardId=guard_data.get('guardId', ''),
                    guard_id_fk=guard_data.get('guard_id_fk'),
                    guardName=guard_data.get('guardName', ''),
                    siteId=schedule.siteId,  # type: ignore
                    siteName=schedule.siteName,  # type: ignore
                    shift='night',
                    position=guard_data.get('position', ''),
                    dailyIncome=float(guard_data.get('dailyIncome', 0)),
                    payoutRate=float(guard_data.get('payoutRate', 0)),
                    hiringRate=float(guard_data.get('hiringRate', 0)),
                    positionAllowance=float(guard_data.get('positionAllowance', 0)),
                    diligenceBonus=float(guard_data.get('diligenceBonus', 0)),
                    sevenDayBonus=float(guard_data.get('sevenDayBonus', 0)),
                    pointBonus=float(guard_data.get('pointBonus', 0)),
                    otherAllowance=float(guard_data.get('otherAllowance', 0))
                )
                db.add(guard_record)
                total_records += 1
        
        # Commit all records
        await db.commit()
        
        print(f"\n✅ Successfully backfilled {total_records} guard records from {len(schedules)} schedules")


if __name__ == "__main__":
    print("="*80)
    print("Backfilling schedule_guards table from existing schedules")
    print("="*80)
    asyncio.run(backfill_schedule_guards())
    print("="*80)
