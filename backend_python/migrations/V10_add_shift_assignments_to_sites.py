"""
Migration V10: Add shiftAssignments column to sites table
Date: 2024-12-12
Description: เพิ่ม column shiftAssignments (TEXT) เพื่อเก็บข้อมูลกะงานของแต่ละหน่วยงาน
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from app.database import engine


async def run_migration():
    """Execute migration V10"""
    print("=" * 60)
    print("Running Migration V10: Add shiftAssignments to sites")
    print("=" * 60)
    
    async with engine.begin() as conn:
        # Check if column already exists
        check_column = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'sites' 
            AND column_name = 'shiftAssignments'
        """)
        result = await conn.execute(check_column)
        exists = result.fetchone()
        
        if exists:
            print("✓ Column 'shiftAssignments' already exists in 'sites' table")
            return
        
        # Add shiftAssignments column
        print("\n1. Adding 'shiftAssignments' column to 'sites' table...")
        add_column = text("""
            ALTER TABLE sites 
            ADD COLUMN "shiftAssignments" TEXT
        """)
        await conn.execute(add_column)
        print("   ✓ Column 'shiftAssignments' added successfully")
        
        print("\n" + "=" * 60)
        print("✅ Migration V10 completed successfully!")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_migration())
