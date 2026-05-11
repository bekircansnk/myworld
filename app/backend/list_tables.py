import asyncio
import sys
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def show_tables():
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
            tables = result.scalars().all()
            print("DB Tables:", tables)
        except Exception as e:
            print(f"Hata: {e}")

if __name__ == "__main__":
    asyncio.run(show_tables())
