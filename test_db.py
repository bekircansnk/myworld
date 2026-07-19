from sqlalchemy.ext.asyncio import create_async_engine
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@host/db?ssl=require",
    pool_size=10,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True
)
print("ok")
