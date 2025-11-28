import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.config import settings
from app.database import Base
from app.models import *  # Import all models to register them

async def reset_db():
    print("Connecting...")
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    print("Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        
    print("Tables dropped!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_db())
