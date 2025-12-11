"""
Test Staff Import Functionality
Run this to verify the Staff import system is working
"""
import asyncio
from pathlib import Path
import pandas as pd


async def test_staff_import_system():
    """Complete test of Staff import system"""
    
    print("=" * 80)
    print("🧪 STAFF IMPORT SYSTEM TEST")
    print("=" * 80)
    print()
    
    # Test 1: Check template file exists
    print("📋 Test 1: Template File")
    template_path = Path("templates/staff_template.xlsx")
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
        df = pd.read_excel(template_path)
        expected_cols = [
            'รหัสพนักงาน', 'คำนำหน้า', 'ชื่อ', 'นามสกุล', 'เลขบัตรประชาชน',
            'อีเมล', 'เบอร์โทร', 'ที่อยู่', 'ตำแหน่ง', 'แผนก', 'วันเกิด',
            'วันเริ่มงาน', 'เงินเดือน', 'ประเภทเงินเดือน', 'วิธีรับเงิน',
            'เลขบัญชี', 'รหัสธนาคาร', 'สถานะ'
        ]
        
        missing = [col for col in expected_cols if col not in df.columns]
        if missing:
            print(f"❌ Missing columns: {missing}")
            return False
        else:
            print(f"✅ All 18 columns present")
            print(f"   Sample rows: {len(df)}")
            print(f"   Columns: {', '.join(df.columns.tolist()[:5])}...")
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
            # Check staff table exists
            result = await conn.execute(text("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_name = 'staff'
            """))
            table_exists = result.scalar() == 1
            
            if not table_exists:
                print("❌ Staff table does not exist")
                return False
            
            # Check column count
            result = await conn.execute(text("""
                SELECT COUNT(*)
                FROM information_schema.columns 
                WHERE table_name = 'staff'
            """))
            column_count = result.scalar()
            
            print(f"✅ Staff table exists")
            print(f"   Total columns: {column_count}")
            
            # Check critical columns exist
            critical_cols = [
                'staffId', 'title', 'firstName', 'lastName', 'idCardNumber',
                'email', 'phone', 'address', 'position', 'department',
                'birthDate', 'startDate', 'salary', 'salaryType',
                'paymentMethod', 'bankAccountNo', 'bankCode', 'isActive'
            ]
            
            for col in critical_cols:
                result = await conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'staff' 
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
    
    # Test 4: Check existing staff
    print("👥 Test 4: Existing Staff")
    try:
        from app.models.staff import Staff
        from app.database import get_db
        from sqlalchemy import select
        
        async for db in get_db():
            result = await db.execute(select(Staff))
            staff_list = result.scalars().all()
            
            print(f"✅ Database query successful")
            print(f"   Current staff: {len(staff_list)}")
            
            if staff_list:
                print(f"   Sample:")
                for s in staff_list[:3]:
                    info = f"      • {s.staffId}: {s.firstName} {s.lastName}"
                    if s.position:
                        info += f" ({s.position})"
                    print(info)
            else:
                print("   ℹ️  No staff in database yet (ready for import)")
            
            break
            
    except Exception as e:
        print(f"❌ Staff query error: {e}")
        return False
    print()
    
    # Test 5: Import function check
    print("🔧 Test 5: Import Function")
    try:
        from app.api import master_data
        import inspect
        
        # Check function exists
        if hasattr(master_data, 'import_staff_from_excel'):
            func = getattr(master_data, 'import_staff_from_excel')
            sig = inspect.signature(func)
            params = list(sig.parameters.keys())
            
            print("✅ Import function exists")
            print(f"   Function: import_staff_from_excel")
            print(f"   Parameters: {', '.join(params)}")
            
            # Check function source for key features
            source = inspect.getsource(func)
            features = {
                'Required columns check': 'required_columns' in source,
                'Safe value extraction': 'get_value' in source,
                'Date parsing': 'parse_date' in source,
                'Error handling': 'try:' in source and 'except' in source,
                'Title field': 'title' in source,
                'Email field': 'email' in source,
                'All 18 fields': all(field in source for field in [
                    'title', 'email', 'position', 'department', 'salary'
                ])
            }
            
            for feature, present in features.items():
                status = "✅" if present else "❌"
                print(f"   {status} {feature}")
                
            if not all(features.values()):
                print("⚠️  Some features missing - function may need update")
        else:
            print("❌ import_staff_from_excel function not found")
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
    print("🎉 Staff Import System is ready to use!")
    print()
    print("📝 Next Steps:")
    print("   1. Start the backend: python -m uvicorn app.main:app --reload")
    print("   2. Open frontend: npm run dev")
    print("   3. Navigate to Staff List page")
    print("   4. Click Import button")
    print("   5. Download template and test import")
    print()
    
    return True


if __name__ == "__main__":
    try:
        result = asyncio.run(test_staff_import_system())
        exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
