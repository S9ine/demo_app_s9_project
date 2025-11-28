"""
Database initialization script for PostgreSQL
Creates all tables and initial data
"""
import asyncio
import json
from sqlalchemy import select
from app.database import init_db, async_session_maker
from app.models import User, Role, Bank
from app.core.security import get_password_hash


async def initialize_database():
    """Initialize PostgreSQL database with tables and default data"""
    
    print("Initializing PostgreSQL database...")
    
    # Create all tables
    await init_db()
    
    async with async_session_maker() as db:
        try:
            # Check if admin user already exists
            result = await db.execute(select(User).where(User.username == "admin"))
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                # Create default roles
                roles_data = [
                    {
                        "roleId": "1",
                        "name": "Admin",
                        "permissions": json.dumps([
                            "dashboard",
                            "customer-list", "site-list",
                            "guard-list", "staff-list",
                            "daily-advance", "equipment-request", "damage-deposit",
                            "services", "product",
                            "social-security",
                            "scheduler",
                            "settings"
                        ])
                    },
                    {
                        "roleId": "2",
                        "name": "Supervisor",
                        "permissions": json.dumps([
                            "dashboard",
                            "customer-list", "site-list",
                            "guard-list", "staff-list",
                            "daily-advance", "scheduler"
                        ])
                    },
                    {
                        "roleId": "3",
                        "name": "HR",
                        "permissions": json.dumps(["dashboard", "guard-list", "staff-list", "daily-advance"])
                    },
                    {
                        "roleId": "4",
                        "name": "User",
                        "permissions": json.dumps(["dashboard", "daily-advance"])
                    }
                ]
                
                for role_data in roles_data:
                    role = Role(**role_data)
                    db.add(role)
                
                await db.commit()
                print(f"Created {len(roles_data)} default roles")
                
                # Create admin user
                admin = User(
                    username="admin",
                    password=get_password_hash("admin123"),
                    firstName="Admin",
                    lastName="User",
                    email="admin@example.com",
                    role="Admin",
                    roleId="1",
                    isActive=True
                )
                
                db.add(admin)
                await db.commit()
                
                print("Created admin user")
                print("   Username: admin")
                print("   Password: admin123")
                
                # Create some default banks (optional)
                default_banks = [
                    {"code": "BBL", "name": "Bangkok Bank", "shortNameEN": "Bangkok Bank"},
                    {"code": "KBANK", "name": "Kasikorn Bank", "shortNameEN": "Kasikorn Bank"},
                    {"code": "KTB", "name": "Krungthai Bank", "shortNameEN": "Krungthai Bank"},
                    {"code": "SCB", "name": "Siam Commercial Bank", "shortNameEN": "Siam Commercial Bank"},
                    {"code": "TMB", "name": "TMB Thanachart Bank", "shortNameEN": "TMB Thanachart Bank"}
                ]
                
                for bank_data in default_banks:
                    bank = Bank(**bank_data)
                    db.add(bank)
                
                await db.commit()
                print(f"Created {len(default_banks)} default banks")
                
            else:
                print("Database already initialized")
                print("Admin user already exists")
            
            print("Database initialization complete!")
            
        except Exception as e:
            print(f"Error during initialization: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(initialize_database())
