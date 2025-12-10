from fastapi import APIRouter, HTTPException, Depends, Request  # type: ignore
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession  # type: ignore
from sqlalchemy import select, desc, func  # type: ignore
from datetime import datetime, timedelta
from app.schemas.audit_log import AuditLogResponse, AuditLogCreate
from app.core.deps import get_current_active_user
from app.database import get_db
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter()


async def create_audit_log(
    db: AsyncSession,
    current_user: User,
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    entity_name: Optional[str] = None,
    description: Optional[str] = None,
    old_data: Optional[dict] = None,  # type: ignore
    new_data: Optional[dict] = None,  # type: ignore
    changes: Optional[list] = None,  # type: ignore
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """Helper function to create audit log entry"""
    log = AuditLog(
        action=action,
        entityType=entity_type,
        entityId=entity_id,
        entityName=entity_name,
        userId=current_user.id,
        username=current_user.username,
        description=description,
        oldData=old_data,
        newData=new_data,
        changes=changes,
        ipAddress=ip_address,
        userAgent=user_agent
    )
    db.add(log)
    await db.commit()
    return log


@router.get("/logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    user_id: Optional[int] = None,
    days: int = 30,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get audit logs with filters"""
    query = select(AuditLog)
    
    # Filter by date (last N days)
    cutoff_date = datetime.now() - timedelta(days=days)
    query = query.where(AuditLog.createdAt >= cutoff_date)
    
    # Apply filters
    if entity_type:
        query = query.where(AuditLog.entityType == entity_type)
    if action:
        query = query.where(AuditLog.action == action)
    if user_id:
        query = query.where(AuditLog.userId == user_id)
    
    # Order by latest first and limit
    query = query.order_by(desc(AuditLog.createdAt)).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return logs


@router.get("/logs/{entity_type}/{entity_id}")
async def get_entity_logs(
    entity_type: str,
    entity_id: str,
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get audit logs for a specific entity with pagination"""
    # Calculate offset
    offset = (page - 1) * limit
    
    # Get total count
    count_query = select(func.count(AuditLog.id)).where(
        AuditLog.entityType == entity_type,
        AuditLog.entityId == entity_id
    )
    count_result = await db.execute(count_query)
    total = count_result.scalar()
    
    # Get paginated logs
    query = select(AuditLog).where(
        AuditLog.entityType == entity_type,
        AuditLog.entityId == entity_id
    ).order_by(desc(AuditLog.createdAt)).offset(offset).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    # Calculate total pages
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    
    return {
        "data": logs,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": total_pages,
            "hasNext": page < total_pages,
            "hasPrev": page > 1
        }
    }


@router.get("/logs/stats")
async def get_audit_stats(
    days: int = 30,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get audit log statistics"""
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Get all logs for the period
    result = await db.execute(
        select(AuditLog).where(AuditLog.createdAt >= cutoff_date)
    )
    logs = result.scalars().all()
    
    # Calculate statistics
    stats = {
        "total": len(logs),
        "byAction": {},
        "byEntityType": {},
        "byUser": {},
        "recentLogs": []
    }
    
    for log in logs:
        # Count by action
        stats["byAction"][log.action] = stats["byAction"].get(log.action, 0) + 1
        
        # Count by entity type
        stats["byEntityType"][log.entityType] = stats["byEntityType"].get(log.entityType, 0) + 1
        
        # Count by user
        user_key = f"{log.username} (ID: {log.userId})"
        stats["byUser"][user_key] = stats["byUser"].get(user_key, 0) + 1
    
    # Get recent 10 logs
    recent_result = await db.execute(
        select(AuditLog)
        .where(AuditLog.createdAt >= cutoff_date)
        .order_by(desc(AuditLog.createdAt))
        .limit(10)
    )
    recent_logs = recent_result.scalars().all()
    stats["recentLogs"] = [
        {
            "id": log.id,
            "action": log.action,
            "entityType": log.entityType,
            "username": log.username,
            "description": log.description,
            "createdAt": log.createdAt.isoformat()
        }
        for log in recent_logs
    ]
    
    return stats
