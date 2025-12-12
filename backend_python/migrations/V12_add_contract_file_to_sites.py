"""
Migration: Add contract file columns to sites table
Version: V12
"""

import psycopg2
from psycopg2 import sql

def run_migration():
    """Add contractFilePath and contractFileName columns to sites table"""
    
    conn = psycopg2.connect(
        host="localhost",
        port="5433",
        database="erp_demo",
        user="postgres",
        password="admin"
    )
    
    try:
        cur = conn.cursor()
        
        # Check if columns exist
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'sites' AND column_name IN ('contractFilePath', 'contractFileName')
        """)
        existing_columns = [row[0] for row in cur.fetchall()]
        
        # Add contractFilePath column if not exists
        if 'contractFilePath' not in [col.lower() for col in existing_columns]:
            print("Adding contractFilePath column...")
            cur.execute("""
                ALTER TABLE sites 
                ADD COLUMN "contractFilePath" VARCHAR(500) NULL
            """)
            print("✅ Added contractFilePath column")
        else:
            print("⏭️ contractFilePath column already exists")
        
        # Add contractFileName column if not exists
        if 'contractFileName' not in [col.lower() for col in existing_columns]:
            print("Adding contractFileName column...")
            cur.execute("""
                ALTER TABLE sites 
                ADD COLUMN "contractFileName" VARCHAR(255) NULL
            """)
            print("✅ Added contractFileName column")
        else:
            print("⏭️ contractFileName column already exists")
        
        conn.commit()
        print("\n✅ Migration V12 completed successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Migration failed: {e}")
        raise e
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
