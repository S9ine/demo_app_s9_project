"""
Script to fix role permissions to match Frontend Sidebar IDs
"""
import asyncio
import json
from sqlalchemy import select
from app.database import async_session_maker
from app.models import Role

async def fix_permissions():
    print("Fixing role permissions...")
    
    async with async_session_maker() as db:
        # 1. Admin Role - ALL PERMISSIONS
        result = await db.execute(select(Role).where(Role.name == "Admin"))
        admin_role = result.scalar_one_or_none()
        
        if admin_role:
            # All possible permissions from Sidebar.jsx
            new_permissions = [
                "dashboard",
                "customers", "customer-list", "site-list",
                "employees", "guard-list", "staff-list",
                "requests", "daily-advance", "equipment-request", "damage-deposit",
                "services", "product",
                "social-security",
                "scheduler",
                "settings"
            ]
            admin_role.permissions = json.dumps(new_permissions)
            print("Updated Admin permissions (Full Access)")
            
        await db.commit()
        print("✅ Permissions updated successfully!")

if __name__ == "__main__":
    asyncio.run(fix_permissions())
