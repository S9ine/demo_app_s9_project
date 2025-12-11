"""Test Guard Import Functionality"""
import asyncio
from app.database import get_db
from app.models.guard import Guard
from sqlalchemy import select


async def check_guards():
    """Check current guards in database"""
    async for db in get_db():
        result = await db.execute(select(Guard))
        guards = result.scalars().all()
        
        print(f'📊 Total Guards in Database: {len(guards)}')
        print()
        
        if guards:
            print('👥 Existing Guards (first 5):')
            for g in guards[:5]:
                print(f'  • {g.guardId}: {g.firstName} {g.lastName}')
                if g.phone:
                    print(f'    📱 {g.phone}')
                if g.idCardNumber:
                    print(f'    🆔 {g.idCardNumber}')
        else:
            print('ℹ️  No guards found in database')
        
        break


if __name__ == "__main__":
    asyncio.run(check_guards())
