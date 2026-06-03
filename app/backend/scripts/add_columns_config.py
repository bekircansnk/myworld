import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env"))

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        print("Checking if columns_config column exists in projects table...")
        
        # PostgreSQL specific query to check if column exists
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='projects' AND column_name='columns_config';
        """)
        
        result = await conn.execute(check_query)
        exists = result.fetchone()
        
        if exists:
            print("columns_config column already exists in projects table.")
        else:
            print("Adding columns_config column to projects table...")
            alter_query = text("ALTER TABLE projects ADD COLUMN columns_config JSONB NULL;")
            await conn.execute(alter_query)
            print("✅ columns_config column successfully added to projects table.")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
