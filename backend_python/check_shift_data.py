"""
Check if shiftAssignments data is being saved
"""

import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from app.database import engine


async def check_data():
    """Check sites table for shiftAssignments data"""
    print("=" * 60)
    print("Checking shiftAssignments in sites table")
    print("=" * 60)
    
    async with engine.begin() as conn:
        # Check column exists
        check_column = text("""
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'sites' 
            AND column_name = 'shiftAssignments'
        """)
        result = await conn.execute(check_column)
        column = result.fetchone()
        
        if column:
            print(f"\n✓ Column 'shiftAssignments' exists: {column[0]} ({column[1]})")
        else:
            print("\n✗ Column 'shiftAssignments' NOT FOUND!")
            return
        
        # Check actual data
        check_data = text("""
            SELECT "siteCode", name, "shiftAssignments"
            FROM sites
            ORDER BY id DESC
            LIMIT 5
        """)
        result = await conn.execute(check_data)
        sites = result.fetchall()
        
        print(f"\n📋 Latest 5 sites:")
        print("-" * 60)
        
        if not sites:
            print("No sites found in database")
        else:
            for site in sites:
                print(f"\nSite: {site[0]} - {site[1]}")
                if site[2]:
                    print(f"  shiftAssignments: {site[2]}")
                else:
                    print(f"  shiftAssignments: NULL (ไม่มีข้อมูล)")
        
        print("\n" + "=" * 60)


if __name__ == "__main__":
    asyncio.run(check_data())
