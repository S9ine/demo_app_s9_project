import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.schedule import Schedule
from sqlalchemy import select
import json

async def check_details():
    async for db in get_db():
        # Get all schedules
        result = await db.execute(select(Schedule))
        schedules = result.scalars().all()
        
        print("=" * 80)
        print("📋 Schedule Details")
        print("=" * 80)
        print(f"Total schedules: {len(schedules)}")
        print()
        
        for schedule in schedules:
            print(f"Schedule ID: {schedule.id}")
            print(f"  Date: {schedule.scheduleDate}")
            print(f"  Site: {schedule.siteName} (ID: {schedule.siteId})")
            print(f"  Total Guards: {schedule.totalGuards}")
            print(f"  Day Shift: {schedule.totalGuardsDay}")
            print(f"  Night Shift: {schedule.totalGuardsNight}")
            print(f"  Created At: {schedule.createdAt}")
            print(f"  Updated At: {schedule.updatedAt}")
            print(f"  Shifts Data:")
            shifts_data = schedule.shifts if isinstance(schedule.shifts, dict) else json.loads(schedule.shifts)
            print(f"    Day: {json.dumps(shifts_data.get('day', []), indent=6, ensure_ascii=False)}")
            print(f"    Night: {json.dumps(shifts_data.get('night', []), indent=6, ensure_ascii=False)}")
            print()
        
        break

if __name__ == "__main__":
    asyncio.run(check_details())
