from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from datetime import datetime, date
import json
from app.schemas.financial import (
    DailyAdvanceCreate,
    DailyAdvanceUpdate,
    DailyAdvanceResponse,
    AdvanceSummary
)
from app.core.deps import get_current_active_user
from app.core.decimal_utils import to_decimal
from app.database import get_db
from app.models.daily_advance import DailyAdvance
from app.models.user import User


router = APIRouter()


@router.get("/daily-advances", response_model=List[DailyAdvanceResponse])
async def get_daily_advances(
    date_str: Optional[str] = Query(None, alias="date"),
    type: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get daily advances with optional filters
    """
    query = select(DailyAdvance).order_by(desc(DailyAdvance.createdAt))
    
    if date_str:
        try:
            query_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            query = query.where(DailyAdvance.date == query_date)
        except ValueError:
            pass
            
    if type:
        query = query.where(DailyAdvance.type == type)
        
    # Non-admin users can only see their own documents
    if current_user.role != "Admin":
        query = query.where(DailyAdvance.createdBy == current_user.username)
        
    result = await db.execute(query)
    docs = result.scalars().all()
    
    return [
        {
            "id": str(doc.id),
            "docNumber": doc.docNumber,
            "date": doc.date,
            "type": doc.type,
            "status": doc.status,
            "items": json.loads(doc.items) if doc.items else [],
            "createdBy": doc.createdBy,
            "createdAt": doc.createdAt,
            "updatedAt": doc.updatedAt
        }
        for doc in docs
    ]


@router.post("/daily-advances", response_model=DailyAdvanceResponse)
async def create_daily_advance(
    advance_data: DailyAdvanceCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new daily advance document
    """
    # Prepare items
    items_list = []
    for item in advance_data.items:
        decimal_amount = to_decimal(item.amount)
        items_list.append({
            "guardId": item.guardId,
            "amount": float(decimal_amount),
            "reason": item.reason or ""
        })
    
    new_doc = DailyAdvance(
        docNumber=advance_data.docNumber,
        date=advance_data.date,
        type=advance_data.type,
        status=advance_data.status,
        items=json.dumps(items_list),
        createdBy=current_user.username
    )
    
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)
    
    return {
        "id": str(new_doc.id),
        "docNumber": new_doc.docNumber,
        "date": new_doc.date,
        "type": new_doc.type,
        "status": new_doc.status,
        "items": json.loads(new_doc.items),
        "createdBy": new_doc.createdBy,
        "createdAt": new_doc.createdAt,
        "updatedAt": new_doc.updatedAt
    }


@router.get("/daily-advances/{advance_id}", response_model=DailyAdvanceResponse)
async def get_daily_advance(
    advance_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get daily advance by ID"""
    try:
        aid = int(advance_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid advance ID")
        
    result = await db.execute(select(DailyAdvance).where(DailyAdvance.id == aid))
    doc = result.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Daily advance not found")
    
    # Check permission
    if current_user.role != "Admin" and doc.createdBy != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {
        "id": str(doc.id),
        "docNumber": doc.docNumber,
        "date": doc.date,
        "type": doc.type,
        "status": doc.status,
        "items": json.loads(doc.items) if doc.items else [],
        "createdBy": doc.createdBy,
        "createdAt": doc.createdAt,
        "updatedAt": doc.updatedAt
    }


@router.put("/daily-advances/{advance_id}", response_model=DailyAdvanceResponse)
async def update_daily_advance(
    advance_id: str,
    advance_data: DailyAdvanceUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update daily advance"""
    try:
        aid = int(advance_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid advance ID")
        
    result = await db.execute(select(DailyAdvance).where(DailyAdvance.id == aid))
    doc = result.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Daily advance not found")
    
    # Check permission
    if current_user.role != "Admin" and doc.createdBy != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
        
    if advance_data.docNumber is not None:
        doc.docNumber = advance_data.docNumber
        
    if advance_data.date is not None:
        doc.date = advance_data.date
        
    if advance_data.type is not None:
        doc.type = advance_data.type
        
    if advance_data.status is not None:
        doc.status = advance_data.status
        
    if advance_data.items is not None:
        items_list = []
        for item in advance_data.items:
            decimal_amount = to_decimal(item.amount)
            items_list.append({
                "guardId": item.guardId,
                "amount": float(decimal_amount),
                "reason": item.reason or ""
            })
        doc.items = json.dumps(items_list)
        
    await db.commit()
    await db.refresh(doc)
    
    return {
        "id": str(doc.id),
        "docNumber": doc.docNumber,
        "date": doc.date,
        "type": doc.type,
        "status": doc.status,
        "items": json.loads(doc.items) if doc.items else [],
        "createdBy": doc.createdBy,
        "createdAt": doc.createdAt,
        "updatedAt": doc.updatedAt
    }


@router.delete("/daily-advances/{advance_id}")
async def delete_daily_advance(
    advance_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete daily advance"""
    try:
        aid = int(advance_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid advance ID")
        
    result = await db.execute(select(DailyAdvance).where(DailyAdvance.id == aid))
    doc = result.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Daily advance not found")
        
    # Check permission
    if current_user.role != "Admin" and doc.createdBy != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")
        
    await db.delete(doc)
    await db.commit()
    
    return {"message": "Daily advance deleted successfully"}


@router.put("/daily-advances/{advance_id}/status")
async def update_advance_status(
    advance_id: str,
    status: str = Query(..., enum=["Draft", "Pending", "Approved", "Rejected"]),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update daily advance status"""
    try:
        aid = int(advance_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid advance ID")
        
    result = await db.execute(select(DailyAdvance).where(DailyAdvance.id == aid))
    doc = result.scalar_one_or_none()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Daily advance not found")
        
    doc.status = status
    if status in ["Approved", "Rejected"]:
        doc.approvedBy = current_user.username
        
    await db.commit()
    
    return {"message": f"Status updated to {status}"}
