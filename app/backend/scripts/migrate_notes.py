import asyncio
import sys
import os

sys.path.append(os.path.dirname(__file__))
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.config import settings

async def migrate_notes():
    print(f"Connecting to {settings.database_url}")
    engine = create_async_engine(settings.database_url, echo=True)
    async with engine.begin() as conn:
        print("Executing ALTER TABLE notes...")
        try:
            await conn.execute(text("ALTER TABLE notes ADD COLUMN title TEXT;"))
            print("Added title")
        except Exception as e: print("title err:", e)
        
        try:
            await conn.execute(text("ALTER TABLE notes ADD COLUMN ai_analysis TEXT;"))
            print("Added ai_analysis")
        except Exception as e: print("ai_analysis err:", e)
        
        try:
            # SQLite does not support JSONB, just use JSON/TEXT
            await conn.execute(text("ALTER TABLE notes ADD COLUMN ai_analysis_history JSON;"))
            print("Added history")
        except Exception as e: print("history err:", e)
        
        # Not sure if created_at is already there. Let's try to add it just in case
        try:
            await conn.execute(text("ALTER TABLE notes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();"))
            print("Added created_at (if not exists)")
        except Exception as e: print("created_at err:", e)
        
    await engine.dispose()
    
if __name__ == "__main__":
    asyncio.run(migrate_notes())
