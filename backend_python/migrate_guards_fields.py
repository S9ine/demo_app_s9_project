"""
Migration Script: Add comprehensive fields to Guards table
Purpose: Add all missing fields to the guards table to match the Guard model
Date: 2025-12-11
"""
import asyncio
from app.database import engine
from sqlalchemy import text


async def migrate_guards_table():
    """Add comprehensive fields to guards table"""
    
    migrations = [
        # Personal Information
        ("title", "VARCHAR(20)", "คำนำหน้า"),
        
        # Already exists in model but might be missing in DB
        ("birthDate", "DATE", "วันเดือนปีเกิด"),
        ("nationality", "VARCHAR(50)", "สัญชาติ"),
        ("religion", "VARCHAR(50)", "ศาสนา"),
        
        # Address fields (replace old 'address' field)
        ("addressIdCard", "VARCHAR(500)", "ที่อยู่ตามบัตรประชาชน"),
        ("addressCurrent", "VARCHAR(500)", "ที่อยู่ปัจจุบัน"),
        # phone already exists
        
        # Education and License
        ("education", "VARCHAR(100)", "วุฒิการศึกษา"),
        ("licenseNumber", "VARCHAR(50)", "เลขที่บัตร/ใบอนุญาต"),
        ("licenseExpiry", "DATE", "วันหมดอายุใบอนุญาต"),
        
        # Employment
        ("startDate", "DATE", "วันเริ่มปฏิบัติงาน"),
        
        # Bank Information
        ("bankAccountName", "VARCHAR(200)", "ชื่อบัญชี"),
        # bankAccountNo and bankCode already exist
        
        # ID Card
        ("idCardNumber", "VARCHAR(13)", "เลขบัตรประชาชน 13 หลัก"),
        
        # Marital Status
        ("maritalStatus", "VARCHAR(50)", "สถานภาพสมรส"),
        ("spouseName", "VARCHAR(200)", "ชื่อคู่สมรส"),
        
        # Emergency Contact
        ("emergencyContactName", "VARCHAR(200)", "ชื่อผู้ติดต่อฉุกเฉิน"),
        ("emergencyContactPhone", "VARCHAR(20)", "เบอร์โทรฉุกเฉิน"),
        ("emergencyContactRelation", "VARCHAR(100)", "ความสัมพันธ์"),
    ]
    
    print("🔧 Starting Guards table migration...")
    print()
    
    async with engine.begin() as conn:
        for column_name, data_type, description in migrations:
            try:
                # Check if column exists
                check_query = text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'guards' 
                    AND column_name = :col_name
                """)
                result = await conn.execute(check_query, {"col_name": column_name})
                exists = result.fetchone() is not None
                
                if not exists:
                    # Add column
                    alter_query = text(f"""
                        ALTER TABLE guards 
                        ADD COLUMN "{column_name}" {data_type} NULL
                    """)
                    await conn.execute(alter_query)
                    
                    # Add comment
                    comment_query = text(f"""
                        COMMENT ON COLUMN guards."{column_name}" IS '{description}'
                    """)
                    await conn.execute(comment_query)
                    
                    print(f"✅ Added column: {column_name} ({data_type}) - {description}")
                else:
                    print(f"⏭️  Column already exists: {column_name}")
                    
            except Exception as e:
                print(f"❌ Error adding {column_name}: {str(e)}")
                raise
    
    print()
    print("🎉 Migration completed successfully!")
    print()
    
    # Display final table structure
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'guards'
            ORDER BY ordinal_position
        """))
        
        print("📋 Current Guards table structure:")
        print("-" * 80)
        for row in result:
            col_name = row[0]
            data_type = row[1]
            max_length = row[2] if row[2] else ''
            nullable = '✓' if row[3] == 'YES' else '✗'
            
            type_str = f"{data_type}({max_length})" if max_length else data_type
            print(f"  {col_name:30} {type_str:20} nullable: {nullable}")


if __name__ == "__main__":
    asyncio.run(migrate_guards_table())
