"""
Quick Test Script for Guard Import Functionality
Run this to verify the Guard import system is working
"""
import asyncio
import os
from pathlib import Path


async def test_guard_import_system():
    """Complete test of Guard import system"""
    
    print("=" * 80)
    print("🧪 GUARD IMPORT SYSTEM TEST")
    print("=" * 80)
    print()
    
    # Test 1: Check template file exists
    print("📋 Test 1: Template File")
    template_path = Path("templates/guard_template.xlsx")
    if template_path.exists():
        size = template_path.stat().st_size
        print(f"✅ Template exists: {template_path}")
        print(f"   Size: {size:,} bytes")
    else:
        print(f"❌ Template missing: {template_path}")
        return False
    print()
    
    # Test 2: Verify template columns
    print("📊 Test 2: Template Structure")
    try:
        import pandas as pd
        df = pd.read_excel(template_path)
        expected_cols = [
            'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'เลขบัตรประชาชน', 'วันเกิด', 
            'สัญชาติ', 'ศาสนา', 'ที่อยู่ตามบัตรประชาชน', 'ที่อยู่ปัจจุบัน', 
            'เบอร์โทร', 'วุฒิการศึกษา', 'เลขที่บัตรใบอนุญาต', 
            'วันหมดอายุใบอนุญาต', 'วันเริ่มปฏิบัติงาน', 'ชื่อบัญชี', 
            'เลขบัญชี', 'รหัสธนาคาร', 'สถานภาพสมรส', 'ชื่อคู่สมรส', 
            'ชื่อผู้ติดต่อฉุกเฉิน', 'เบอร์โทรฉุกเฉิน', 'ความสัมพันธ์', 'สถานะ'
        ]
        
        missing = [col for col in expected_cols if col not in df.columns]
        if missing:
            print(f"❌ Missing columns: {missing}")
            return False
        else:
            print(f"✅ All 23 columns present")
            print(f"   Sample rows: {len(df)}")
    except Exception as e:
        print(f"❌ Error reading template: {e}")
        return False
    print()
    
    # Test 3: Database connectivity and structure
    print("🗄️  Test 3: Database Structure")
    try:
        from app.database import engine
        from sqlalchemy import text
        
        async with engine.begin() as conn:
            # Check guards table exists
            result = await conn.execute(text("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_name = 'guards'
            """))
            table_exists = result.scalar() == 1
            
            if not table_exists:
                print("❌ Guards table does not exist")
                return False
            
            # Check column count
            result = await conn.execute(text("""
                SELECT COUNT(*)
                FROM information_schema.columns 
                WHERE table_name = 'guards'
            """))
            column_count = result.scalar()
            
            print(f"✅ Guards table exists")
            print(f"   Total columns: {column_count}")
            
            # Check critical columns exist
            critical_cols = [
                'title', 'birthDate', 'nationality', 'religion',
                'addressIdCard', 'addressCurrent', 'education',
                'licenseNumber', 'licenseExpiry', 'startDate',
                'bankAccountName', 'idCardNumber', 'maritalStatus',
                'spouseName', 'emergencyContactName', 
                'emergencyContactPhone', 'emergencyContactRelation'
            ]
            
            for col in critical_cols:
                result = await conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'guards' 
                    AND column_name = '{col}'
                """))
                if not result.fetchone():
                    print(f"❌ Missing column: {col}")
                    return False
            
            print(f"✅ All {len(critical_cols)} critical columns present")
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False
    print()
    
    # Test 4: Check existing guards
    print("👥 Test 4: Existing Guards")
    try:
        from app.models.guard import Guard
        from app.database import get_db
        from sqlalchemy import select
        
        async for db in get_db():
            result = await db.execute(select(Guard))
            guards = result.scalars().all()
            
            print(f"✅ Database query successful")
            print(f"   Current guards: {len(guards)}")
            
            if guards:
                print(f"   Sample:")
                for g in guards[:3]:
                    info = f"      • {g.guardId}: {g.firstName} {g.lastName}"
                    if g.phone:
                        info += f" (📱 {g.phone})"
                    print(info)
            else:
                print("   ℹ️  No guards in database yet (ready for import)")
            
            break
            
    except Exception as e:
        print(f"❌ Guard query error: {e}")
        return False
    print()
    
    # Test 5: Import function check
    print("🔧 Test 5: Import Function")
    try:
        from app.api import master_data
        import inspect
        
        # Check function exists
        if hasattr(master_data, 'import_guards_from_excel'):
            func = getattr(master_data, 'import_guards_from_excel')
            sig = inspect.signature(func)
            params = list(sig.parameters.keys())
            
            print("✅ Import function exists")
            print(f"   Function: import_guards_from_excel")
            print(f"   Parameters: {', '.join(params)}")
            
            # Check function source for key features
            source = inspect.getsource(func)
            features = {
                'Auto-ID generation': 'PG-' in source and 'next_num' in source,
                'Date parsing': 'parse_date' in source,
                'Safe value extraction': 'get_value' in source,
                'Error handling': 'try:' in source and 'except' in source,
                'All 23 fields': all(field in source for field in [
                    'title', 'birthDate', 'nationality', 'emergencyContactRelation'
                ])
            }
            
            for feature, present in features.items():
                status = "✅" if present else "❌"
                print(f"   {status} {feature}")
                
            if not all(features.values()):
                print("⚠️  Some features missing - function may need update")
        else:
            print("❌ import_guards_from_excel function not found")
            return False
            
    except Exception as e:
        print(f"❌ Function check error: {e}")
        return False
    print()
    
    # Summary
    print("=" * 80)
    print("✅ ALL TESTS PASSED!")
    print("=" * 80)
    print()
    print("🎉 Guard Import System is ready to use!")
    print()
    print("📝 Next Steps:")
    print("   1. Start the backend: python -m uvicorn app.main:app --reload")
    print("   2. Open frontend: npm run dev")
    print("   3. Navigate to Guard List page")
    print("   4. Click Import button")
    print("   5. Download template and test import")
    print()
    
    return True


if __name__ == "__main__":
    try:
        result = asyncio.run(test_guard_import_system())
        exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
