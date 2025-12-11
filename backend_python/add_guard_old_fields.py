"""Add backward compatibility columns to Guards table"""
import asyncio
from app.database import engine
from sqlalchemy import text


async def add_old_fields():
    """Add old/backward compatibility fields to guards table"""
    columns = [
        ('position', 'VARCHAR(100)', 'ตำแหน่ง (เก่า)'),
        ('department', 'VARCHAR(100)', 'แผนก (เก่า)'),
        ('salary', 'NUMERIC(10, 2)', 'เงินเดือน (เก่า)'),
        ('salaryType', 'VARCHAR(50)', 'ประเภทเงินเดือน (เก่า)'),
        ('paymentMethod', 'VARCHAR(50)', 'วิธีรับเงิน (เก่า)'),
    ]
    
    async with engine.begin() as conn:
        for col_name, data_type, description in columns:
            await conn.execute(text(f'''
                ALTER TABLE guards 
                ADD COLUMN IF NOT EXISTS "{col_name}" {data_type} NULL
            '''))
            print(f'✅ Added: {col_name}')
    
    print('✅ All backward compatibility columns added successfully!')


if __name__ == "__main__":
    asyncio.run(add_old_fields())
