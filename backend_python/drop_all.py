import asyncio
from app.database import engine
from sqlalchemy import text

async def drop_all():
    async with engine.begin() as conn:
        await conn.execute(text('DROP TABLE IF EXISTS departments CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS sites CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS customers CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS guards CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS staff CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS banks CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS products CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS services CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS daily_advances CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS users CASCADE'))
        await conn.execute(text('DROP TABLE IF EXISTS roles CASCADE'))
    print('✅ Dropped all tables successfully')

if __name__ == '__main__':
    asyncio.run(drop_all())
