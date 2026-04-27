import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_VH8GNi5XWDda@ep-spring-grass-altw7ldo-pooler.c-3.eu-central-1.aws.neon.tech/neondb?ssl=require"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        await conn.execute(text("UPDATE photo_model_colors SET revision_required = true WHERE revision_required IS NULL OR revision_required = false;"))
    print("Database updated successfully.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
