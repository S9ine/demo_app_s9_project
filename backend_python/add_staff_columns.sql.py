"""
Simple SQL script to add title and email to staff table
Copy and run these SQL commands in your PostgreSQL database
"""

SQL_COMMANDS = """
-- Check current staff table structure
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'staff' 
ORDER BY ordinal_position;

-- Add title column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff' AND column_name = 'title'
    ) THEN
        ALTER TABLE staff ADD COLUMN title VARCHAR(20);
        RAISE NOTICE 'Column title added successfully';
    ELSE
        RAISE NOTICE 'Column title already exists';
    END IF;
END $$;

-- Add email column (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'staff' AND column_name = 'email'
    ) THEN
        ALTER TABLE staff ADD COLUMN email VARCHAR(100);
        RAISE NOTICE 'Column email added successfully';
    ELSE
        RAISE NOTICE 'Column email already exists';
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'staff' 
ORDER BY ordinal_position;
"""

if __name__ == "__main__":
    print("=" * 70)
    print("SQL Commands to Add title and email to staff table")
    print("=" * 70)
    print("\nCopy and run these commands in your PostgreSQL client:")
    print("(pgAdmin, DBeaver, psql, etc.)\n")
    print(SQL_COMMANDS)
    print("\n" + "=" * 70)
    print("OR run via psql command line:")
    print("=" * 70)
    print('\npsql -U postgres -d erp_db -c "...[paste SQL above]..."')
