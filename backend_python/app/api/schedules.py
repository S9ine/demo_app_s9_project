"""
Schedule API Endpoints
จัดการตารางงาน - บันทึก/ดึง/แก้ไข/ลบ ตารางงานพนักงาน
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from datetime import date
import json

from app.database import get_db
from app.models.schedule import Schedule
from app.models.user import User
from app.schemas.schedule import (
    ScheduleCreate, ScheduleUpdate, ScheduleResponse,
    ScheduleListItem
)
from app.core.deps import get_current_active_user


router = APIRouter()


# ========== SCHEDULE ENDPOINTS ==========

@router.get("/schedules", response_model=List[ScheduleListItem])
async def get_schedules(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    site_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ดึงรายการตารางงาน (สามารถกรองตามวันที่และหน่วยงาน)"""
    query = select(Schedule).where(Schedule.isActive == True)
    
    if start_date:
        query = query.where(Schedule.scheduleDate >= start_date)
    if end_date:
        query = query.where(Schedule.scheduleDate <= end_date)
    if site_id:
        query = query.where(Schedule.siteId == site_id)
    
    query = query.order_by(Schedule.scheduleDate.desc())
    
    result = await db.execute(query)
    schedules = result.scalars().all()
    
    return [
        ScheduleListItem(
            id=s.id,  # type: ignore
            scheduleDate=s.scheduleDate,  # type: ignore
            siteId=s.siteId,  # type: ignore
            siteName=s.siteName,  # type: ignore
            totalGuardsDay=s.totalGuardsDay or 0,  # type: ignore
            totalGuardsNight=s.totalGuardsNight or 0,  # type: ignore
            totalGuards=s.totalGuards or 0,  # type: ignore
            isActive=s.isActive  # type: ignore
        )
        for s in schedules
    ]


@router.get("/schedules/by-date/{schedule_date}")
async def get_schedules_by_date(  # type: ignore
    schedule_date: date,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ดึงตารางงานทั้งหมดในวันที่ระบุ"""
    result = await db.execute(
        select(Schedule)
        .where(
            and_(
                Schedule.scheduleDate == schedule_date,
                Schedule.isActive == True
            )
        )
        .order_by(Schedule.siteName)
    )
    schedules = result.scalars().all()
    
    return {  # type: ignore
        schedule_date.isoformat(): {
            str(s.siteId): {
                "scheduleId": s.id,
                "siteId": s.siteId,
                "siteName": s.siteName,
                "shifts": json.loads(s.shifts)  # type: ignore
            }
            for s in schedules
        }
    }


@router.get("/schedules/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(
    schedule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ดึงข้อมูลตารางงานเฉพาะ"""
    result = await db.execute(
        select(Schedule).where(Schedule.id == schedule_id)
    )
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="ไม่พบตารางงาน")
    
    shifts_data = json.loads(schedule.shifts)  # type: ignore
    
    return ScheduleResponse(
        id=schedule.id,  # type: ignore
        scheduleDate=schedule.scheduleDate,  # type: ignore
        siteId=schedule.siteId,  # type: ignore
        siteName=schedule.siteName,  # type: ignore
        shifts=shifts_data,
        totalGuardsDay=schedule.totalGuardsDay or 0,  # type: ignore
        totalGuardsNight=schedule.totalGuardsNight or 0,  # type: ignore
        totalGuards=schedule.totalGuards or 0,  # type: ignore
        isActive=schedule.isActive,  # type: ignore
        createdAt=schedule.createdAt,  # type: ignore
        updatedAt=schedule.updatedAt,  # type: ignore
        createdBy=schedule.createdBy,  # type: ignore
        remarks=schedule.remarks  # type: ignore
    )


@router.post("/schedules", status_code=201)
async def create_schedule(  # type: ignore
    schedule_data: ScheduleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """สร้างตารางงานใหม่"""
    
    # ตรวจสอบว่ามีตารางงานของหน่วยงานนี้ในวันนี้หรือยัง (ทั้ง active และ inactive)
    existing_result = await db.execute(
        select(Schedule)
        .where(
            and_(
                Schedule.scheduleDate == schedule_data.scheduleDate,
                Schedule.siteId == schedule_data.siteId
            )
        )
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        if existing.isActive:
            # มี schedule active อยู่แล้ว
            raise HTTPException(
                status_code=400,
                detail="มีตารางงานของหน่วยงานนี้ในวันนี้แล้ว ใช้ PUT เพื่ออัปเดต"
            )
        else:
            # มี schedule แต่ถูก soft delete ไปแล้ว -> reactivate และ update
            total_guards = 0
            for shift_code, guards in schedule_data.shifts.items():
                total_guards += len(guards)
            
            existing.shifts = json.dumps(schedule_data.shifts)  # type: ignore[assignment]
            existing.siteName = schedule_data.siteName  # type: ignore[assignment]
            existing.totalGuards = total_guards  # type: ignore[assignment]
            existing.isActive = True  # type: ignore[assignment]
            existing.remarks = schedule_data.remarks  # type: ignore[assignment]
            
            await db.commit()
            await db.refresh(existing)
            
            return {  # type: ignore
                "id": existing.id,
                "scheduleDate": existing.scheduleDate,
                "siteId": existing.siteId,
                "message": "กู้คืนและอัปเดตตารางงานสำเร็จ"
            }
    
    # คำนวณจำนวนพนักงานทั้งหมด (รองรับ dynamic shifts)
    total_guards = 0
    for shift_code, guards in schedule_data.shifts.items():
        total_guards += len(guards)
    
    # แปลง shifts เป็น JSON
    shifts_json = json.dumps(schedule_data.shifts)
    
    # สร้าง record ใหม่
    new_schedule = Schedule(
        scheduleDate=schedule_data.scheduleDate,
        siteId=schedule_data.siteId,
        siteName=schedule_data.siteName,
        shifts=shifts_json,
        totalGuardsDay=0,  # Legacy field - ไม่ใช้แล้ว
        totalGuardsNight=0,  # Legacy field - ไม่ใช้แล้ว
        totalGuards=total_guards,
        createdBy=current_user.id,
        remarks=schedule_data.remarks
    )
    
    db.add(new_schedule)
    await db.commit()
    await db.refresh(new_schedule)
    
    return {  # type: ignore
        "id": new_schedule.id,
        "scheduleDate": new_schedule.scheduleDate,
        "siteId": new_schedule.siteId,
        "message": "สร้างตารางงานสำเร็จ"
    }


@router.put("/schedules/{schedule_id}")
async def update_schedule(  # type: ignore
    schedule_id: int,
    schedule_data: ScheduleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """อัปเดตตารางงาน"""
    
    result = await db.execute(
        select(Schedule).where(Schedule.id == schedule_id)
    )
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="ไม่พบตารางงาน")
    
    # อัปเดตข้อมูล
    if schedule_data.shifts is not None:
        # คำนวณจำนวนพนักงานทั้งหมด (รองรับ dynamic shifts)
        total_guards = 0
        for shift_code, guards in schedule_data.shifts.items():
            total_guards += len(guards)
        
        schedule.shifts = json.dumps(schedule_data.shifts)  # type: ignore[assignment]
        schedule.totalGuardsDay = 0  # Legacy field  # type: ignore[assignment]
        schedule.totalGuardsNight = 0  # Legacy field  # type: ignore[assignment]
        schedule.totalGuards = total_guards  # type: ignore[assignment]
    
    if schedule_data.remarks is not None:
        schedule.remarks = schedule_data.remarks  # type: ignore[assignment]
    
    if schedule_data.isActive is not None:
        schedule.isActive = schedule_data.isActive  # type: ignore[assignment]
    
    await db.commit()
    await db.refresh(schedule)
    
    return {  # type: ignore
        "id": schedule.id,
        "message": "อัปเดตตารางงานสำเร็จ"
    }


@router.delete("/schedules/{schedule_id}")
async def delete_schedule(
    schedule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ลบตารางงาน (soft delete)"""
    
    result = await db.execute(
        select(Schedule).where(Schedule.id == schedule_id)
    )
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="ไม่พบตารางงาน")
    
    # Soft delete
    schedule.isActive = False  # type: ignore[assignment]
    
    await db.commit()
    
    return {"message": "ลบตารางงานสำเร็จ"}


@router.delete("/schedules/{schedule_id}/hard")
async def hard_delete_schedule(
    schedule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """ลบตารางงานถาวร (hard delete) - ใช้ด้วยความระมัดระวัง"""
    
    result = await db.execute(
        select(Schedule).where(Schedule.id == schedule_id)
    )
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="ไม่พบตารางงาน")
    
    await db.delete(schedule)
    await db.commit()
    
    return {"message": "ลบตารางงานถาวรสำเร็จ"}
