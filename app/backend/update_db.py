import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")
async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        await conn.execute(text("UPDATE photo_model_colors SET revision_required = true WHERE revision_required IS NULL OR revision_required = false;"))
    print("Database updated successfully.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
