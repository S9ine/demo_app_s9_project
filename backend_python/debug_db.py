import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.config import settings
from app.database import Base
from app.models.user import User, Role
from app.core.security import get_password_hash
import json

async def test_db():
    print("Connecting...")
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    print("Inserting data...")
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Test Role
        role = Role(
            roleId="1",
            name="Admin",
            permissions=json.dumps(["all"])
        )
        session.add(role)
        await session.commit()
        print("Role Inserted!")
        
        # Test User
        user = User(
            username="admin",
            password=get_password_hash("admin123"),
            firstName="Admin",
            lastName="User",
            email="admin@example.com",
            role="Admin",
            roleId="1",
            isActive=True
        )
        session.add(user)
        await session.commit()
        print("User Inserted!")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_db())
