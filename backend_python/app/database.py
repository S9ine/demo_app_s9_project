from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings


# Create async engine for PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,  # Log SQL queries in development
    future=True,
    pool_pre_ping=True
)

# Create async session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for all models
Base = declarative_base()


async def get_db():
    """
    Dependency for getting database session
    
    Usage in FastAPI endpoints:
        async def endpoint(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Create all database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created")


async def close_db():
    """Close database connection"""
    await engine.dispose()
    print("❌ Database connection closed")
