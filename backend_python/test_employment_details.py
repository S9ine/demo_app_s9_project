"""
Test script to verify employment details work correctly
"""
import asyncio
import json
from sqlalchemy import select, text # type: ignore
from app.database import engine
from app.models.site import Site # type: ignore

async def test_employment_details():
    """Test if employment details are saved and retrieved correctly"""
    
    async with engine.begin() as conn:
        # Check if employmentDetails column exists
        check_query = text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name='sites' AND column_name='employmentDetails'
        """)
        result = await conn.execute(check_query)
        column = result.fetchone()
        
        if column:
            print(f"✅ Column 'employmentDetails' exists: {column.data_type}")
        else:
            print("❌ Column 'employmentDetails' does NOT exist!")
            return
        
        # Get a sample site with employment details
        sample_query = text("""
            SELECT id, "siteCode", name, "employmentDetails"
            FROM sites 
            WHERE "employmentDetails" IS NOT NULL 
            LIMIT 1
        """)
        result = await conn.execute(sample_query)
        site = result.fetchone()
        
        if site:
            print(f"\n✅ Found site with employment details:")
            print(f"   ID: {site.id}")
            print(f"   Code: {site.siteCode}")
            print(f"   Name: {site.name}")
            
            # Parse JSON
            try:
                details = json.loads(site.employmentDetails)
                print(f"\n   Employment Details ({len(details)} items):")
                for i, detail in enumerate(details, 1):
                    print(f"\n   {i}. {detail.get('position', 'N/A')}")
                    print(f"      Quantity: {detail.get('quantity', 0)}")
                    print(f"      Hiring Rate: ฿{detail.get('hiringRate', 0):,.2f}")
                    print(f"      Diligence Bonus: ฿{detail.get('diligenceBonus', 0):,.2f}")
                    print(f"      Seven Day Bonus: ฿{detail.get('sevenDayBonus', 0):,.2f}")
                    print(f"      Point Bonus: ฿{detail.get('pointBonus', 0):,.2f}")
                    total = (detail.get('hiringRate', 0) + 
                            detail.get('diligenceBonus', 0) + 
                            detail.get('sevenDayBonus', 0) + 
                            detail.get('pointBonus', 0))
                    print(f"      Total per person: ฿{total:,.2f}")
                    if detail.get('remarks'):
                        print(f"      Remarks: {detail['remarks']}")
            except json.JSONDecodeError as e:
                print(f"   ❌ Error parsing JSON: {e}")
        else:
            print("\n⚠️  No sites with employment details found")
            print("   Try creating a site with employment details from the frontend")
        
        # Show all sites
        count_query = text("SELECT COUNT(*) FROM sites")
        result = await conn.execute(count_query)
        total_sites = result.scalar()
        print(f"\n📊 Total sites in database: {total_sites}")

if __name__ == "__main__":
    print("=" * 60)
    print("Testing Employment Details Feature")
    print("=" * 60)
    asyncio.run(test_employment_details())
    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)
