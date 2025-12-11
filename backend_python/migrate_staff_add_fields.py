"""
Migration script to add title and email fields to staff table
Run this script to update existing database
"""
import psycopg2 # type: ignore
from psycopg2 import sql # type: ignore

# Database connection parameters
DB_CONFIG = {
    'host': 'localhost',
    'database': 'erp_db',
    'user': 'postgres',
    'password': 'your_password'  # เปลี่ยนตามที่ตั้งค่าไว้
}

def migrate_staff_table():
    """Add title and email columns to staff table"""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    try:
        # Check if columns already exist
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'staff' 
            AND column_name IN ('title', 'email')
        """)
        existing_columns = [row[0] for row in cur.fetchall()]
        
        # Add title column if not exists
        if 'title' not in existing_columns:
            print("Adding 'title' column to staff table...")
            cur.execute("""
                ALTER TABLE staff 
                ADD COLUMN title VARCHAR(20)
            """)
            conn.commit()
            print("✅ 'title' column added successfully!")
        else:
            print("⏭️  'title' column already exists")
        
        # Add email column if not exists
        if 'email' not in existing_columns:
            print("Adding 'email' column to staff table...")
            cur.execute("""
                ALTER TABLE staff 
                ADD COLUMN email VARCHAR(100)
            """)
            conn.commit()
            print("✅ 'email' column added successfully!")
        else:
            print("⏭️  'email' column already exists")
        
        print("\n✅ Migration completed successfully!")
        print("\nUpdated staff table structure:")
        print("- title VARCHAR(20) - คำนำหน้าชื่อ (นาย/นาง/นางสาว)")
        print("- email VARCHAR(100) - อีเมล")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Staff Table Migration: Adding title and email fields")
    print("=" * 60)
    migrate_staff_table()
