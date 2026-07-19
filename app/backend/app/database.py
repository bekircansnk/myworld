from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
import sys
from pathlib import Path

# Alembic'in config'i bulabilmesi için sys.path ekliyoruz
sys.path.append(str(Path(__file__).resolve().parent.parent))
from app.config import settings

connect_args = {}
if settings.environment != "development":
    connect_args["ssl"] = True

engine = create_async_engine(
    settings.database_url,
    echo=True if settings.environment == "development" else False,
    future=True,
    pool_size=10,
    max_overflow=20,
    pool_recycle=300,
    pool_pre_ping=True,
    pool_timeout=30,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
