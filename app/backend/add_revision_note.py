import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_VH8GNi5XWDda@ep-spring-grass-altw7ldo-pooler.c-3.eu-central-1.aws.neon.tech/neondb?ssl=require"

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE photo_model_colors ADD COLUMN revision_note VARCHAR"))
            print("Successfully added revision_note column to photo_model_colors")
        except Exception as e:
            if "already exists" in str(e):
                print("Column revision_note already exists")
            else:
                print(f"Error: {e}")
                
        # Clean up old data: If a revision value is a string, move it to revision_note and set count to 0
        # Actually, since they are integers in the DB, strings like "oldu" wouldn't have been saved as integers.
        # But maybe they were saved as 0 or 4?
        # The user's screenshot shows "oldu" and "neden" in the Excel, which means they weren't saved in the DB previously
        # if the column was Integer.
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
