"""Create PostgreSQL database if it doesn't exist"""
import asyncpg
import asyncio

async def create_database():
    """Create database using asyncpg"""
    try:
        # Connect to postgres database (default)
        conn = await asyncpg.connect(
            user='postgres',
            password='admin',
            host='localhost',
            port=5432,
            database='postgres'
        )
        
        # Check if database exists
        result = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = 'my_project_db'"
        )
        
        if result:
            print("✓ Database 'my_project_db' already exists")
        else:
            # Create database
            await conn.execute('CREATE DATABASE my_project_db')
            print("✓ Created database 'my_project_db' successfully")
        
        await conn.close()
        return True
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(create_database())
    if success:
        print("\nYou can now run: python init_db.py")
    else:
        print("\nFailed to create database")
